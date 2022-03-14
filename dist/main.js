/* global mapboxgl Vue hex */

import hex from "./hex.js";
import { pars, filts } from "./config.js";

const toObj = (arr) =>
  arr.reduce((acc, el) => ((acc[el.name] = el.val), acc), {});

Vue.component("slider", {
  props: ["obj"],
  template: `
  <div>
    <div>{{ obj.label }}: {{ obj.val }} {{ obj.unit }}</div>
    <input type="range" :min="obj.min" :max="obj.max"
           class="slider" v-model="obj.val">
  </div>
  `,
});

// eslint-disable-next-line no-unused-vars
const app = new Vue({
  el: "#sidebar",
  data: {
    pars: pars,
    filts: filts,
  },
  watch: {
    parVals: function () {
      this.debouncedUpdate();
    },
    filtVals: function () {
      this.debouncedUpdate();
    },
  },
  computed: {
    parVals: function () {
      return toObj(this.pars);
    },
    filtVals: function () {
      return toObj(this.filts);
    },
  },
  created: function () {
    this.debouncedUpdate = _.debounce(this.update, 500);
  },
  methods: {
    update: function () {
      updateHex(this.parVals, this.filts);
    },
  },
});

mapboxgl.accessToken =
  "pk.eyJ1IjoiY2FyZGVybmUiLCJhIjoiY2puMXN5cnBtNG53NDN2bnhlZ3h4b3RqcCJ9.eNjrtezXwvM7Ho1VSxo06w";
const map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/mapbox/light-v10",
  center: [37.7, 0.31],
  zoom: 6,
});

const draw = new MapboxDraw({
  displayControlsDefault: false,
  controls: {
    line_string: true,
    trash: true,
  },
});
map.addControl(draw);
const updateLine = (e) => {
  const line = draw.getAll().features[0].geometry;
  const length = Math.floor(turf.lineDistance(line, "km"));
  let points = {
    type: "FeatureCollection",
    features: [],
  };
  for (let step = 0; step < length + 6; step += 5) {
    points.features.push(turf.along(line, step, "km"));
  }
  const tagged = turf
    .tag(points, hex, "index", "hexId")
    .features.map((f) => f.properties.hexId);
  const ids = [...new Set(tagged)];
  console.log(ids);
};

map.on("draw.create", updateLine);
map.on("draw.delete", updateLine);
map.on("draw.update", updateLine);

let mapLoaded = false;
map.on("load", () => {
  mapLoaded = true;
  map.addSource("hex", {
    type: "geojson",
    data: hex,
  });

  updateHex(app.parVals, app.filts, false);
  map.addLayer({
    id: "hex",
    type: "fill",
    source: "hex",
    paint: {
      "fill-color": [
        "interpolate",
        ["linear"],
        ["get", "profit"],
        0,
        "hsl(0, 29%, 93%)",
        40000,
        "hsl(0, 100%, 23%)",
      ],
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
    layout: {
      "text-field": "{index}",
      "text-size": 10,
    },
    paint: {
      "text-halo-width": 1,
      "text-halo-color": "#fff",
      "text-halo-blur": 1,
      "text-color": "#000",
    },
  });
  updateHex(app.parVals, app.filts);
});

const objective = (props, parVals) => {
  return (
    props.grid_dist * parVals.grid +
    props.road_dist * parVals.road +
    props.pop * parVals.pop
  );
};

const filter = (filts) => {
  return ["all"].concat(
    filts.map((f) => [f.op, ["get", f.name], parseInt(f.val)])
  );
};

const updateHex = (parVals, filts, updateMap = true) => {
  if (mapLoaded) {
    hex.features.forEach((ft, i) => {
      hex.features[i].properties.profit = objective(ft.properties, parVals);
    });
    if (updateMap) {
      map.getSource("hex").setData(hex);
      map.setFilter("hex", filter(filts));
      map.setFilter("hex_label", filter(filts));
    }
  }
};
