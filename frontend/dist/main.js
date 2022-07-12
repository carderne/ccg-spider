/* global Vue _ */

import * as models from "./models/index.js";
import {
  getPath,
  getHex,
  updateHex,
  reloadHex,
  deleteDrawing,
  toObj,
  toObjSingle,
  toObjArr,
  fmt,
  zip,
  updatePaint,
  getColorByMinMax,
  downloadHex,
  downloadLines,
  setDrawing,
} from "./funcs.js";

import { makeMap, makeDraw } from "./map.js";

const init = (path, config) => {
  Vue.createApp({
    data() {
      return {
        hex: {},
        path,
        pars: config.pars,
        infra: config.infra,
        mapLoaded: false,
        idLabels: false,
        scaleColors: true,
        attrs: toObj(config.attrs),
        colorBy: config.attrs[0].col,
        drawing: null,
        drawnLines: toObjArr(config.infra),
      };
    },
    computed: {
      idLabelsText: function () {
        return this.idLabels ? "visible" : "none";
      },
      parVals: function () {
        return toObjSingle(this.pars, "val");
      },
      colorByObj: function () {
        return this.attrs[this.colorBy];
      },
      colorByMinMax: function () {
        const minMax = getColorByMinMax(
          this.colorByObj,
          this.scaleColors,
          this.hex
        );
        return { min: fmt(minMax.min), max: fmt(minMax.max) };
      },
      colorBarStyle: function () {
        const from = this.colorByObj.minCol;
        const to = this.colorByObj.maxCol;
        return `linear-gradient(to right, ${from}, ${to})`;
      },
    },
    watch: {
      idLabels: function () {
        this.map.setLayoutProperty(
          "hex_label",
          "visibility",
          this.idLabelsText
        );
      },
      scaleColors: function () {
        updatePaint(this.colorByObj, this.map, this.scaleColors, this.hex);
      },
      parVals: function () {
        this.debouncedUpdate();
      },
      colorBy: function () {
        updatePaint(this.colorByObj, this.map, this.scaleColors, this.hex);
      },
    },
    created: async function () {
      this.debouncedUpdate = _.debounce(this.update, 500);
      this.model = await getModel(path);
      this.hex = await getHex(path, this.infra, this.parVals, this.model);
      this.map = makeMap(config, this, this.model);
      this.draw = makeDraw(this.map, this, config, this.model);
    },
    methods: {
      zip: function (a, b) {
        return zip(a, b);
      },
      doDraw: function (col) {
        if (this.drawing == col) {
          this.drawing = null;
        } else {
          this.drawing = col;
        }
        setDrawing(this.drawing, this.draw, this.infra);
      },
      deleteDraw: function (col) {
        deleteDrawing(
          col,
          this.map,
          this,
          this.draw,
          this.drawnLines,
          this.mapLoaded,
          this.model
        );
        this.drawing = null;
      },
      update: function () {
        this.hex = updateHex(this.parVals, this.hex, this.model);
        reloadHex(this.map, this.hex, this.mapLoaded);
      },
      downloadHex: function () {
        downloadHex(this.hex, path);
      },
      downloadLines: function () {
        downloadLines(this.drawnLines, path);
      },
    },
  }).mount("#sidebar");
};

const getModel = async (path) => {
  if (path != "hydro") {
    return models[path].model;
  } else {
    const modelName = `pymodel_${path}`;
    while (!Object.prototype.hasOwnProperty.call(window, modelName))
      await new Promise((resolve) => setTimeout(resolve, 1000));
    return window[modelName];
  }
};

const path = getPath(models);
const config = models[path].config;
init(path, config);
