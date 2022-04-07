const center = [37.7, 0.31];
const zoom = 6;
const loc = {center, zoom};

const popup = [

  {
    col: "pv",
    label: "PV",
    unit: "kWh/kWp per day",
    fmt: true,
  },
  {
    col: "price_elec",
    label: "Electricity price",
    unit: "€/MWh",
    fmt: true,
  },
];

const infra = [
  {
    col: "grid_dist",
    label: "Grid",
    type: "line",
    color: "#FF0000",
  },
  {
    col: "road_dist",
    label: "Road",
    type: "line",
    color: "#0000FF",
  },
];

const pars = [
  {
    col: "pv_capex",
    label: "PV CAPEX",
    min: 500,
    max: 1000,
    val: 800,
    unit: "€/kWp",
  },
];

const attrs = [

  {
    col: "price_elec",
    label: "Electricity price",
    min: 20,
    max: 25,
    minCol: "hsl(90, 29%, 93%)",
    maxCol: "hsl(90, 100%, 23%)",
  },
  {
    col: "pv_radiation",
    label: "Solar radiation",
    min: 2,
    max: 6,
    minCol: "hsl(255, 29%, 93%)",
    maxCol: "hsl(255, 100%, 23%)",
  },
];

export default {loc, popup, infra, pars, attrs};
