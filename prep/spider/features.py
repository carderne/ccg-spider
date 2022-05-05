from pathlib import Path

import geopandas as gpd
import h3pandas  # noqa: W
import pandas as pd
import rasterio
from rasterio.features import rasterize
from rasterstats import zonal_stats
from scipy import ndimage
from typer import echo


def add_features(geom: gpd.GeoDataFrame, features: list, raster_like: Path):
    for f in features:
        try:
            col_name = f["name"]
            if col_name not in geom.columns:
                echo(f"Doing {col_name}")
                if f["type"] == "raster":
                    geom[col_name] = add_raster_layer(
                        geom=geom,
                        raster=Path(f["file"]).expanduser(),
                        operation=f["operation"],
                        crs=f["crs"] if "crs" in f.keys() else None,
                    )

                elif f["type"] == "vector":
                    geom[col_name] = add_vector_layer(
                        geom=geom,
                        vector=Path(f["file"]).expanduser(),
                        operation=f["operation"],
                        raster_like=raster_like,
                        joined_col=f.get("joined_col", None),
                    )

                else:
                    raise ValueError("Only 'raster' or 'vector' supported for 'type'.")

                if f.get("decimals"):
                    geom[col_name] = geom[col_name].fillna(0).round(f["decimals"])

                if "fix" in f:
                    fix = f["fix"]
                    geom[col_name] = fix_column(
                        col=geom[col_name],
                        pop=geom.Pop if "Pop" in geom.columns else None,
                        factor=fix.get("factor"),
                        minimum=fix.get("minimum"),
                        no_value=fix.get("no_value"),
                        per_capita=fix.get("per_capita"),
                    )
        except Exception as e:
            echo(f"Error: {e}")
            echo("Saving result so far and quitting")
            return geom

    return geom


def create_hex(aoi: gpd.GeoDataFrame, resolution=5):
    geom = aoi.h3.polyfill_resample(resolution).get(["geometry"])
    geom = geom.assign(h3_index=geom.index)
    geom = geom.reset_index(drop=True)
    return geom


def add_raster_layer(
    geom: gpd.GeoDataFrame,
    raster: Path,
    operation: str,
    affine=None,
    crs=None,
    decimals=2,
) -> list:
    """
    Add a raster layer

    Parameters
    ----------
    geom: geopandas.GeoDataFrame
        The processed geom.
    raster: str, pathlib.Path or numpy.ndarray
        Either a path to the raster, or numpy.ndarray with the data.
    operation: str
        The operation to perform when extracting the raster data.
        Either 'sum', 'max', or 'mean'
    col_name: str
        Name of the column to add.
    affine: affine.Affine(), optional
        If a numpy ndarray is passed above, the affine is also needed.
    crs: proj.crs, optional
        Override raster's reported crs
    """

    if isinstance(raster, Path):
        raster = str(raster)
    if isinstance(raster, str):
        # rasterstats doesn't check for same CRS
        # Throws memory error if don't ensure they are same
        if not crs:
            crs = rasterio.open(raster).crs
        geom_proj = geom.to_crs(crs)
        stats = zonal_stats(geom_proj, raster, stats=operation)

        return [x[operation] for x in stats]

    else:
        raise NotImplementedError("Only implemented for path input.")


def add_vector_layer(
    geom: gpd.GeoDataFrame,
    vector: Path,
    operation: str,
    raster_like: Path,
    decimals: int = 2,
    joined_col: str = None,
) -> list:
    """
    Use a vector containing grid infrastructure to determine
    each cluster's distance from the grid.

    Parameters
    ----------
    geom: geopandas.GeoDataFrame
        The processed geom.
    vector: str, pathlib.Path or geopandas.GeoDataFrame
        Path to or already imported grid dataframe.
    operation: str
        Operation to perform in extracting vector data.
        Currently only 'distance' and 'sjoin' supported.
    raster_like: file-like
        Raster file to use for crs, shape, affine when rasterizing vector
    """

    geom = geom.copy()
    vector = gpd.read_file(vector)

    assert isinstance(geom, gpd.GeoDataFrame), "geom must be a GeoDataFrame"

    if operation == "sjoin":
        geom = geom.to_crs(4326).sjoin(vector.to_crs(4326))
        geom = geom[~geom.index.duplicated()][joined_col]
        return geom

    elif operation == "distance":
        with rasterio.open(raster_like) as rd:
            crs = rd.crs
            affine = rd.transform
            shape = rd.shape

        vector = vector.to_crs(crs=crs)
        geom = geom.to_crs(crs=crs)

        vector = vector.loc[vector["geometry"].length > 0]

        grid_raster = rasterize(
            vector.geometry,
            out_shape=shape,
            fill=1,
            default_value=0,
            all_touched=True,
            transform=affine,
        )
        dist_raster = ndimage.distance_transform_edt(grid_raster) * affine[0]

        dists = zonal_stats(
            vectors=geom, raster=dist_raster, affine=affine, stats="min", nodata=-999
        )
        return [x["min"] for x in dists]

    else:
        raise NotImplementedError('Currently only "distance" is supported.')


def fix_column(
    col,
    pop=None,
    factor=1,
    minimum=0,
    no_value=None,
    per_capita=False,
) -> pd.Series:
    """
    A number of operations to apply to a columns values to get desired output.

    Parameters
    ----------
    geom : GeoDataFrame
        The geom object.
    factor : float, optional (default 1.)
        Factor by which to multiply the column vales.
    minimum : float, optional (default 0.)
        Apply a minimum threshold to the values.
    no_value : str, optional
        Currently only supported for 'median'.
        Replaces NaN instances with the median value.
    per_capita : boolean, optional (default False.)
        Divide values by cluster population.
    """

    if factor is not None and factor != 1:
        col *= factor

    if minimum is not None:
        col = col.clip(lower=minimum)

    if per_capita:
        if pop:
            col /= pop
        else:
            raise ValueError("Need to calculate Pop before doing per_capita")

    if no_value is not None:
        if no_value == "median":
            col = col.fillna(value=col.median())

        else:
            raise NotImplementedError("no_value only implemented for median.")

    return col
