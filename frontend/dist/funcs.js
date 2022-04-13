/* global turf */

export const getPath = (models) => {
  let path = window.location.pathname.split("/")[1];
  if (!(path in models)) path = "fish";
  return path;
};

export const getHex = async (path, infra, parVals, model) => {
  let hex = await fetch(`models/${path}/hex.geojson`).then((res) => res.json());
  infra.forEach((obj) => {
    hex = makeOrigProps(hex, obj.col);
  });
  hex = updateHex(parVals, hex, model);
  return hex;
};

export const reloadHex = (map, hex, mapLoaded) => {
  if (mapLoaded) {
    map.getSource("hex").setData(hex);
  }
};

export const updateHex = (parVals, hex, model) => {
  return {
    ...hex,
    features: hex.features.map((f) => ({
      ...f,
      properties: { ...f.properties, ...model(f.properties, parVals) },
    })),
  };
};

const resetProp = (hex, col) => {
  return {
    ...hex,
    features: hex.features.map((f) => ({
      ...f,
      properties: {
        ...f.properties,
        [col]: f.properties[`${col}_orig`],
      },
    })),
  };
};

export const makeOrigProps = (hex, col) => {
  return {
    ...hex,
    features: hex.features.map((f) => ({
      ...f,
      properties: {
        ...f.properties,
        [`${col}_orig`]: f.properties[col],
      },
    })),
  };
};

export const getColorByMinMax = (attr, scaleColors, hex) => {
  let min = attr.min;
  let max = attr.max;
  if (scaleColors && "features" in hex) {
    const hexVals = hex.features.map((f) => f.properties[attr.col]);
    min = Math.min(...hexVals);
    max = Math.max(...hexVals);
  }
  return { min, max };
};

export const toObj = (arr) =>
  arr.reduce((acc, el) => ((acc[el.col] = el), acc), {});

export const toObjSingle = (arr, key) =>
  arr.reduce((acc, el) => ((acc[el.col] = el[key]), acc), {});

export const toObjArr = (arr) =>
  arr.reduce((acc, el) => ((acc[el.col] = []), acc), {});

export const fmt = (val, places = 0) =>
  val && parseFloat(parseFloat(val).toFixed(places)).toLocaleString("en");

export const zip = (a, b) => a.map((k, i) => [k, b[i]]);

const zipflat = (a, b) =>
  zip(a, b)
    .reduce((k, i) => k.concat(i))
    .concat(b.slice(-1));

export const updatePaint = (attr, map, scaleColors, hex) => {
  if ("cats" in attr) {
    map.setPaintProperty(
      "hex",
      "fill-color",
      ["match"]
        .concat([["get", attr.col]])
        .concat(zipflat(attr.cats, attr.colors))
    );
  } else {
    const minMax = getColorByMinMax(attr, scaleColors, hex);
    map.setPaintProperty("hex", "fill-color", [
      "interpolate",
      ["linear"],
      ["get", attr.col],
      minMax.min,
      attr.minCol,
      minMax.max,
      attr.maxCol,
    ]);
  }
};

const extendProp = (ids, dist, col, hexOrig, hexSize) => {
  let hex = hexOrig;
  const neis = [];
  ids.forEach((i) => {
    try {
      if (hex.features[i].properties[col] > dist) {
        hex.features[i].properties[col] = dist;
        const p = hex.features[i].properties;
        const nei = [p.n0, p.n1, p.n2, p.n3, p.n4, p.n5];
        neis.push(nei);
      }
    } catch (e) {} // eslint-disable-line
  });
  if (neis.length > 0) {
    const idsSet = new Set(ids);
    const newIds = [...new Set(neis.flat(1))].filter((x) => !idsSet.has(x));
    hex = extendProp(newIds, dist + hexSize, col, hex, hexSize);
  }
  return hex;
};

export const emptyFc = () => turf.featureCollection([]);

export const layerPaint = (i) =>
  i.type === "line"
    ? {
        "line-color": i.color,
        "line-width": 3,
        "line-opacity": 0.9,
      }
    : {
        "circle-radius": 7,
        "circle-color": i.color,
      };

export const downloadHex = (hex, path) => {
  downloadFc(hex, path, "spider_hex");
};

export const downloadLines = (drawnLines, path) => {
  const lines = Object.entries(drawnLines).map(([type, arr]) => {
    const feats = arr.map((ft) => {
      ft.properties.type = type;
      return ft;
    });
    return feats;
  });
  const fc = turf.featureCollection(lines.flat());
  downloadFc(fc, path, "spider_lines");
};

const downloadFc = (fc, path, name) => {
  const str = JSON.stringify(fc);
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(str);
  const downloadAnchorNode = document.createElement("a");
  downloadAnchorNode.setAttribute("href", dataStr);
  downloadAnchorNode.setAttribute("download", name + "_" + path + ".geojson");
  document.body.appendChild(downloadAnchorNode);
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
};

const getPointsFromGeom = (newGeom) => {
  if (newGeom.type === "Point") {
    return turf.featureCollection([turf.point(newGeom.coordinates)]);
  } else {
    const length = Math.floor(turf.lineDistance(newGeom, "km"));
    const features = [];
    for (let step = 0; step < length + 6; step += 5) {
      features.push(turf.along(newGeom, step, "km"));
    }
    return turf.featureCollection(features);
  }
};

const joinLineToHex = (newGeom, hex) => {
  const points = getPointsFromGeom(newGeom);
  const tagged = turf
    .tag(points, hex, "index", "hexId")
    .features.map((f) => f.properties.hexId);
  const ids = [...new Set(tagged)].filter(Number);
  return ids;
};

export const updateLine = (
  feats,
  app,
  map,
  model,
  mapLoaded,
  hexSize,
  drawnLines
) => {
  const drawing = app.drawing;
  if (drawing) {
    drawnLines[drawing] = drawnLines[drawing].concat(feats);
    map
      .getSource(`drawn_${drawing}`)
      .setData(turf.featureCollection(drawnLines[drawing]));
    const ids = feats.map((f) => joinLineToHex(f.geometry, app.hex)).flat(1);
    extendProp(ids, 0, drawing, app.hex, hexSize);
    app.hex = updateHex(app.parVals, app.hex, model);
    reloadHex(map, app.hex, mapLoaded);
  }
};

const drawModes = {
  line: "draw_line_string",
  point: "draw_point",
};

export const keepDrawing = (mode, app, draw, infra) => {
  if (mode === "simple_select" && app.drawing)
    setTimeout(() => {
      draw.changeMode(drawModes[toObj(infra)[app.drawing].type]);
    }, 100);
};

export const setDrawing = (drawing, draw, infra) => {
  if (drawing) {
    draw.changeMode(drawModes[toObj(infra)[drawing].type]);
  } else {
    draw.changeMode("static");
  }
};

export const deleteDrawing = (
  col,
  map,
  app,
  draw,
  drawnLines,
  mapLoaded,
  model
) => {
  map.getSource(`drawn_${col}`).setData(turf.featureCollection([]));
  draw.deleteAll();
  drawnLines[col] = [];
  app.hex = resetProp(app.hex, col);
  app.hex = updateHex(app.parVals, app.hex, model);
  reloadHex(map, app.hex, mapLoaded);
};
