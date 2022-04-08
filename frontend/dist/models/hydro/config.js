const center = [37.7, 0.31];
const zoom = 6;
const loc = {center, zoom};

const hexSize = 9; // km

const popup = [

  {
    col: "pv",
    label: "PV",
    unit: "kWh/kWp per day",
    fmt: true,
  },
  {
    col: "wind",
    label: "Mean wind speed (150m)",
    unit: "m/s",
    fmt: true,
  },
  {
    col: "price_elec_wind",
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
  {
    col: "wind_capex",
    label: "Wind CAPEX",
    min: 750,
    max: 1500,
    val: 1000,
    unit: "€/kW",
  },
  {
    col: "p_turbine",
    label: "Power size turbine [kW]",
    min: 1000,
    max: 5000,
    val: 3000,
    unit: "kW",
  },
  {
    col: "interest_rate",
    label: "Interest rate",
    min: 0,
    max: 100,
    val: 4,
    unit: "%",
  },

];

const attrs = [

  {
    col: "price_elec_pv",
    label: "PV Electricity price",
    min: 20,
    max: 25,
    minCol: "hsl(90, 29%, 93%)",
    maxCol: "hsl(90, 100%, 23%)",
  },
  {
    col: "price_elec_wind",
    label: "Wind Electricity price",
    min: 0,
    max: 50,
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
  {
    col: "wind_speed",
    label: "Mean wind speed",
    min: 1,
    max: 20,
    minCol: "hsl(255, 29%, 93%)",
    maxCol: "hsl(255, 100%, 23%)",
  },
  {
    col: "turbine_output",
    label: "Turbine output",
    min: 1,
    max: 20,
    minCol: "hsl(255, 29%, 93%)",
    maxCol: "hsl(255, 100%, 23%)",
  },
];

export default { loc, hexSize, popup, infra, pars, attrs };
