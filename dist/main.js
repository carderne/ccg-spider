/* global mapboxgl Vue hex */

import hex from "./hex.js";

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
    message: "Hello Vue!",
    pars: [
      {
        name: "grid",
        label: "Grid cost per km",
        min: 1,
        max: 1000,
        val: 200,
        unit: "$",
      },
      {
        name: "road",
        label: "Road cost per km",
        min: 1,
        max: 1000,
        val: 500,
        unit: "$",
      },
      {
        name: "pop",
        label: "Cost per person",
        min: 0,
        max: 10,
        val: 3,
        unit: "$",
      },
    ],
    filts: [
      {
        name: "lake",
        label: "Max lake dist",
        min: 0,
        max: 10,
        val: 3,
        unit: "km",
      },
    ],
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
      updateHex(this.parVals, this.filtVals);
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

let mapLoaded = false;
map.on("load", () => {
  mapLoaded = true;
  map.addSource("hex", {
    type: "geojson",
    data: hex,
  });

  map.addLayer({
    id: "hex",
    type: "fill",
    source: "hex",
    paint: {
      "fill-color": [
        "interpolate",
        ["linear"],
        ["get", "Cost"],
        0,
        "hsl(0, 29%, 93%)",
        400000,
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
  updateHex(app.parVals, app.filtVals);
});

const objective = (props, parVals) => {
  return (
    props.grid * parVals.grid +
    props.road * parVals.road +
    props.pop * parVals.pop
  );
};

const filter = (filtVals) => {
  return ["all", ["<", ["get", "lake"], parseInt(filtVals["lake"])]];
};

const updateHex = (parVals, filtVals) => {
  if (mapLoaded) {
    hex.features.forEach((ft, i) => {
      hex.features[i].properties.Cost = objective(ft.properties, parVals);
    });
    map.getSource("hex").setData(hex);
    map.setFilter("hex", filter(filtVals));
  }
};
