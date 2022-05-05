/* global mapboxgl MapboxDraw */

import {
  updateHex,
  reloadHex,
  fmt,
  updatePaint,
  layerPaint,
  updateLine,
  keepDrawing,
  emptyFc,
} from "./funcs.js";

export const makeMap = (config, app, model) => {
  mapboxgl.accessToken =
    "pk.eyJ1IjoiY2FyZGVybmUiLCJhIjoiY2puMXN5cnBtNG53NDN2bnhlZ3h4b3RqcCJ9.eNjrtezXwvM7Ho1VSxo06w";
  const map = new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/carderne/cl0rvsxn200ce14jz3q5j5hco?fresh=true",
    center: config.loc.center,
    zoom: config.loc.zoom,
  });

  map.on("load", () => {
    app.mapLoaded = true;
    onMapLoaded(map, app.infra, config.popup, app, model);
  });
  return map;
};

export const makeDraw = (map, app, config, model) => {
  const draw = setupDrawing();
  map.addControl(draw);

  map.on("draw.create", (e) =>
    updateLine(
      e.features,
      app,
      map,
      model,
      app.mapLoaded,
      config.hexSize,
      app.drawnLines
    )
  );

  map.on("draw.modechange", (e) => keepDrawing(e.mode, app, draw, app.infra));
  return draw;
};

export const onMapLoaded = (map, infra, popup, app, model) => {
  infra.forEach((i) => {
    const id = `drawn_${i.col}`;
    map.addSource(id, {
      type: "geojson",
      data: emptyFc(),
    });

    const layerType = i.type === "line" ? "line" : "circle";
    map.addLayer({
      id: id,
      type: layerType,
      source: id,
      paint: layerPaint(i),
    });
  });

  map.addSource("hex", {
    type: "geojson",
    data: app.hex,
  });

  const filt = ["!=", ["get", "tech"], "none"];

  map.addLayer({
    id: "hex",
    type: "fill",
    source: "hex",
    filter: filt,
    paint: {
      "fill-color": "rgba(0, 0, 0, 0)",
      "fill-opacity": ["interpolate", ["linear"], ["zoom"], 5, 0.6, 13, 0.2],
      "fill-outline-color": [
        "interpolate",
        ["linear"],
        ["zoom"],
        5,
        "hsla(0, 0%, 11%, 0)",
        13,
        "hsl(0, 0%, 11%)",
      ],
    },
  });
  map.addLayer({
    id: "hex_label",
    type: "symbol",
    source: "hex",
    filter: filt,
    layout: {
      "text-field": "{index}",
      "text-size": 10,
      "visibility": app.idLabelsText,
    },
    paint: {
      "text-halo-width": 1,
      "text-halo-color": "#fff",
      "text-halo-blur": 1,
      "text-color": "#000",
    },
  });
  app.hex = updateHex(app.parVals, app.hex, model);
  reloadHex(map, app.hex, true);
  updatePaint(app.colorByObj, map, app.scaleColors, app.hex);

  const pointer = () => {
    if (!app.drawing) map.getCanvas().style.cursor = "pointer";
  };
  const nopointer = () => {
    if (!app.drawing) map.getCanvas().style.cursor = "";
  };

  map.on("mouseenter", "hex", pointer);
  map.on("mouseleave", "hex", nopointer);

  map.on("click", "hex", (e) => {
    if (!app.drawing) {
      const props = e.features[0].properties;
      const rows = popup.map((p) => {
        const val =
          parseInt(p.fmt) >= 0 ? fmt(props[p.col], p.fmt) : props[p.col];
        const unit = p.unit ? ` ${p.unit}` : "";
        return `<div>${p.label}: ${val} ${unit}</div>`;
      });
      const description =
        `<div><strong>ID: ${props.index}</strong></div>` + rows.join("");
      const pop = new mapboxgl.Popup().setLngLat(e.lngLat).setHTML(description);
      pop.addTo(map);
    }
  });
};

export const setupDrawing = () => {
  const StaticMode = {};
  StaticMode.onSetup = function () {
    this.setActionableState();
    return {};
  };
  StaticMode.toDisplayFeatures = function (state, geojson, display) {
    display(geojson);
  };

  return new MapboxDraw({
    displayControlsDefault: false,
    modes: { ...MapboxDraw.modes, static: StaticMode },
    styles: [
      {
        id: "gl-draw",
        type: "line",
        filter: ["==", "$type", "LineString"],
        layout: {
          "line-cap": "round",
          "line-join": "round",
        },
        paint: {
          "line-color": "#000000",
          "line-width": 2,
          "line-opacity": 1,
        },
      },
      {
        id: "highlight-active-points",
        type: "circle",
        filter: ["all", ["==", "$type", "Point"], ["==", "meta", "feature"]],
        paint: {
          "circle-radius": 7,
          "circle-color": "#000000",
        },
      },
    ],
  });
};
