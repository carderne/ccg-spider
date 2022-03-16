/* global Vue _ mapboxgl MapboxDraw turf */

import hex from "./hex.js";
import { pars, attrs } from "./config.js";
import model from "./model.js";

const toObj = (arr) => arr.reduce((acc, el) => ((acc[el.var] = el), acc), {});

const toObjSingle = (arr, key) =>
  arr.reduce((acc, el) => ((acc[el.var] = el[key]), acc), {});

const zip = (a, b) => a.map((k, i) => [k, b[i]]);

const zipflat = (a, b) =>
  zip(a, b)
    .reduce((k, i) => k.concat(i))
    .concat(b.slice(-1));

const Slider = {
  props: ["obj"],
  template: `
  <div class="bg-slate-300 my-2 -mx-2 p-1">
    <div class="text-sm">
      {{ obj.label }}:
      {{ obj.val }}
      {{ obj.unit }}
    </div>
    <input type="range"
           :min="obj.min"
           :max="obj.max"
           :step="(obj.max - obj.min)/100"
           class="slider"
           v-model="obj.val"
    >
  </div>
  `,
};

const attrsObj = toObj(attrs);

const app = Vue.createApp({
  components: {
    Slider,
  },
  data() {
    return {
      pars: pars,
      idLabels: false,
      attrs: attrsObj,
      colorBy: "profit",
    };
  },
  computed: {
    idLabelsText: function () {
      if (this.idLabels) {
        return "visible";
      } else {
        return "none";
      }
    },
    parVals: function () {
      return toObjSingle(this.pars, "val");
    },
    colorByObj: function () {
      return this.attrs[this.colorBy];
    },
  },
  watch: {
    idLabelsText: function () {
      map.setLayoutProperty("hex_label", "visibility", this.idLabelsText);
    },
    parVals: function () {
      this.debouncedUpdate();
    },
    filtVals: function () {
      this.debouncedUpdate();
    },
    colorBy: function () {
      this.debouncedUpdate();
    },
  },
  created: function () {
    this.debouncedUpdate = _.debounce(this.update, 500);
  },
  methods: {
    update: function () {
      updateHex(this.parVals);
      updatePaint(this.colorByObj);
    },
  },
}).mount("#sidebar");

mapboxgl.accessToken =
  "pk.eyJ1IjoiY2FyZGVybmUiLCJhIjoiY2puMXN5cnBtNG53NDN2bnhlZ3h4b3RqcCJ9.eNjrtezXwvM7Ho1VSxo06w";
const map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/carderne/cl0rvsxn200ce14jz3q5j5hco?fresh=true",
  center: [37.7, 0.31],
  zoom: 6,
});

const draw = new MapboxDraw({
  displayControlsDefault: false,
  controls: {
    line_string: true,
    trash: true,
  },
  styles: [
    {
      id: "gl-draw-line",
      type: "line",
      filter: ["all", ["==", "$type", "LineString"], ["!=", "mode", "static"]],
      layout: {
        "line-cap": "round",
        "line-join": "round",
      },
      paint: {
        "line-color": "#000000",
        "line-width": 3,
      },
    },
    {
      id: "gl-draw-line-static",
      type: "line",
      filter: ["all", ["==", "$type", "LineString"], ["==", "mode", "static"]],
      layout: {
        "line-cap": "round",
        "line-join": "round",
      },
      paint: {
        "line-color": "#000000",
        "line-width": 3,
      },
    },
  ],
});
map.addControl(draw);
const joinLineToHex = (line) => {
  const length = Math.floor(turf.lineDistance(line, "km"));
  const points = {
    type: "FeatureCollection",
    features: [],
  };
  for (let step = 0; step < length + 6; step += 5) {
    points.features.push(turf.along(line, step, "km"));
  }
  const tagged = turf
    .tag(points, hex, "index", "hexId")
    .features.map((f) => f.properties.hexId);
  const ids = [...new Set(tagged)].filter(Number);
  return ids;
};
const updateLine = () => {
  const lines = draw.getAll();
  const ids = lines.features.map((f) => joinLineToHex(f.geometry)).flat(1);
  extendGrid(ids, 0);
  updateHex(app.parVals, app.colorByObj);
};

const extendGrid = (ids, dist) => {
  const neis = [];
  ids.forEach((i) => {
    if (hex.features[i].properties.grid_dist > dist) {
      hex.features[i].properties.grid_dist = dist;
      const p = hex.features[i].properties;
      const nei = [p.n0, p.n1, p.n2, p.n3, p.n4, p.n5];
      neis.push(nei);
    }
  });
  if (neis.length > 0) {
    const idsSet = new Set(ids);
    const newIds = [...new Set(neis.flat(1))].filter((x) => !idsSet.has(x));
    extendGrid(newIds, dist + 10);
  }
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

  const filt = ["!=", ["get", "farm_type"], "none"];

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
  updateHex(app.parVals);
  updatePaint(app.colorByObj);

  const pointer = () => (map.getCanvas().style.cursor = "pointer");
  const nopointer = () => (map.getCanvas().style.cursor = "");

  map.on("mouseenter", "hex", pointer);
  map.on("mouseleave", "hex", nopointer);

  const fmt = (val) => val && Math.round(val).toLocaleString("en");

  const addPopup = (e) => {
    const props = e.features[0].properties;
    const description = `
    <div>Grid dist: ${fmt(props.profit)} USD</div>
    <div>Farm type: ${props.farm_type}</div>
    <div>Fish output: ${fmt(props.fish_output)} tons/year</div>
    <div>Profit: ${fmt(props.profit)} USD/year</div>
    <div>Gov costs: ${fmt(props.gov_costs)} USD/year</div>
    <div>Social: ${fmt(props.social)} USD/year</div>
    `;
    new mapboxgl.Popup().setLngLat(e.lngLat).setHTML(description).addTo(map);
  };
  map.on("click", "hex", (e) => addPopup(e));
});

const updatePaint = (attr) => {
  if ("cats" in attr) {
    map.setPaintProperty(
      "hex",
      "fill-color",
      ["match"]
        .concat([["get", attr.var]])
        .concat(zipflat(attr.cats, attr.colors))
    );
  } else {
    map.setPaintProperty("hex", "fill-color", [
      "interpolate",
      ["linear"],
      ["get", attr.var],
      attr.min,
      attr.minCol,
      attr.max,
      attr.maxCol,
    ]);
  }
};

const updateHex = (parVals) => {
  if (mapLoaded) {
    hex.features.forEach((ft) => {
      ft.properties = {
        ...ft.properties,
        ...model(ft.properties, parVals),
      };
    });
    map.getSource("hex").setData(hex);
  }
};
