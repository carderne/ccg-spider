const center = [37.7, 0.31];
const zoom = 6;
const loc = { center, zoom };

const hexSize = 0.5; // km

const popup = [
  {
    col: "WTDmean",
    label: "Groundwater depth",
    unit: "m",
    fmt: 0, // this should be the number of decimal places
            // or false for categorical labels
  },
  {
    col: "GridDist",
    label: "Grid dist",
    unit: "km",
    fmt: 0,
  },
  {
    col: "MarketDist",
    label: "Market dist",
    unit: "km",
    fmt: 0,
  },
  {
    col: "cropyield",
    label: "Crop yield",
    unit: "tons",
    fmt: 0,
  },
  {
    col: "DP_nowDist",
    label: "Distance to diesel pump",
    unit: "km",
    fmt: 0,
  },
  {
    col: "crop_production",
    label: "Crop Production",
    unit: "tonne/year",
    fmt: 0,
  },
  {
    col: "profit",
    label: "Profit",
    unit: "($/year)",
    fmt: 0,
  },
  {
    col: "optimal_solution",
    label: "Optimal solution",
    unit: "",
    fmt: false,
  },
];

const infra = [
  {
    col: "GridDist",
    label: "Grid line",
    type: "line",
    color: "#FF0000",
  },
  {
    col: "road_dist",
    label: "Road",
    type: "line",
    color: "#0000FF",
  },
  {
    col: "DP_nowDist",
    label: "Diesel pump",
    type: "point",
    color: "#0000FF",
  },
];

const pars = [
  {
    col: "tcostperton_km",
    label: "Freight cost",
    min: 0.1,
    max: 0.9,
    val: 0.2,
    unit: "$/ton_km",
  },
  {
    col: "crop_price",
    label: "Producers price",
    min: 100,
    max: 500,
    val: 200,
    unit: "$/tonne",
  },
  {
    col: "Tech_type",
    label: "Irrigation Technology",
    cats: ["pump", "rain", "bore"],
    val: "pump",
  },
  {
    col: "pumpenergyint",
    label: "Pump energy intensity",
    min: 0.005,
    max: 0.05,
    val: 0.08,
    unit: "kWh/m3 per m lifted",
  },
];

const attrs = [
  {
    col: "crop_production",
    label: "Production (t/y)",
    min: 0,
    max: 5,
    minCol: "hsl(90, 29%, 93%)",
    maxCol: "hsl(90, 100%, 23%)",
  },
  {
    col: "transp_cost",
    label: "Transportation cost ($)",
    min: 0,
    max: 100,
    minCol: "hsl(60, 29%, 93%)",
    maxCol: "hsl(60, 100%, 23%)",
  },
  {
    col: "irrig_cost",
    label: "Irrigation Cost ($)",
    min: 0,
    max: 1,
    minCol: "hsl(250, 29%, 93%)",
    maxCol: "hsl(250, 100%, 23%)",
  },
  {
    col: "revenue",
    label: "Revenue ($)",
    min: 0,
    max: 150,
    minCol: "hsl(30, 29%, 93%)",
    maxCol: "hsl(30, 100%, 23%)",
  },
  {
    col: "profit",
    label: "Profit ($)",
    min: 0,
    max: 150,
    minCol: "hsl(300, 29%, 93%)",
    maxCol: "hsl(300, 100%, 23%)",
  },
  {
    col: "GridDist",
    label: "Grid dist (km)",
    min: 0,
    max: 5,
    minCol: "hsl(190, 29%, 93%)",
    maxCol: "hsl(190, 100%, 23%)",
  },
  {
    col: "DP_nowDist",
    label: "Diesel pump dist (km)",
    min: 0,
    max: 5,
    minCol: "hsl(290, 29%, 93%)",
    maxCol: "hsl(290, 100%, 23%)",
  },
  {
    col: "tech",
    label: "Irrigation Technology",
    cats: [
      "profit_ds_EV",
      "profit_ds_IC",
      "profit_gr_EV",
      "profit_gr_IC",
      "profit_no_irr_EV",
      "profit_no_irr_IC",
      "profit_so_EV",
      "profit_so_IC",
    ],
    colors: [
      "hsla(0, 60%, 60%, 1)",
      "hsla(50, 60%, 60%, 1)",
      "hsla(130, 60%, 60%, 1)",
      "hsla(240, 10%, 60%, 1)",
      "hsla(150, 60%, 60%, 1)",
      "hsla(160, 60%, 60%, 1)",
      "hsla(300, 60%, 60%, 1)",
      "hsla(320, 60%, 60%, 1)",
    ],
  },
];

export default { loc, hexSize, popup, infra, pars, attrs };
