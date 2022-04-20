const center = [37.7, 0.31];
const zoom = 6;
const loc = { center, zoom };

const hexSize = 9; // km

const popup = [
  {
    col: "price_h2",
    label: "Hydrogen costs",
    unit: "€/kg",
    fmt: 2, // this should be the number of decimal places
            // or false for categorical labels
  },
  {
    col: "pv",
    label: "PV",
    unit: "kWh/kWp per day",
    fmt: 2, // this should be the number of decimal places
            // or false for categorical labels
  },
  {
    col: "wind",
    label: "Mean wind speed (150m)",
    unit: "m/s",
    fmt: 2,
  },
  {
    col: "price_elec",
    label: "Electricity price (cheapest)",
    unit: "€/MWh",
    fmt: 2,
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
    col: "interest_rate",
    label: "Interest rate",
    min: 0,
    max: 100,
    val: 4,
    unit: "%",
  },
  {
    col: "h2_state",
    label: "Hydrogen state",
    cats: ["500 bar", "Liquid"],
    val: "500 bar",
  },
  {
    col: "water_tran_cost",
    label: "Water Transportation Costs",
    min: 0,
    max: 1,
    val: 0.1,
    unit: "€/100km/m3",
  },
  {
    col: "elec_water_treatment",
    label: "Energy demand water treatment",
    min: 0,
    max: 1,
    val: 0.2,                 //random assumption so far [kWh/m3] see: https://www.researchgate.net/publication/289707090_Energy_consumption_and_economic_cost_of_typical_wastewater_treatment_systems_in_Shenzhen_China
    unit: "€/100km/m3",
  },
];

const attrs = [
  {
    col: "price_h2",
    label: "H2 production price [€/kg]",
    min: 1,
    max: 6,
    minCol: "hsl(90, 100%, 23%)",
    maxCol: "hsl(90, 29%, 93%)",
  },
  {
    col: "price_elec",
    label: "Cheapest electricity price",
    min: 0,
    max: 50,
    minCol: "hsl(90, 29%, 93%)",
    maxCol: "hsl(90, 100%, 23%)",
  },
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
    minCol: "hsl(55, 29%, 93%)",
    maxCol: "hsl(55, 100%, 57%)",
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
  {
    col: "port_dist",
    label: "Distance to port in Mombasa",
    min: 1,
    max: 100000,
    minCol: "hsl(255, 29%, 93%)",
    maxCol: "hsl(255, 100%, 23%)",
  },
];

export default { loc, hexSize, popup, infra, pars, attrs };
