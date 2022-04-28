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
    col: "price_h2_ocean",
    label: "Hydrogen costs ocean",
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
  //{
  //  col: "grid_dist",
  //  label: "Grid",
  //  type: "line",
  //  color: "#FF0000",
  //},
  //{
  //  col: "road_dist",
  //  label: "Road",
  //  type: "line",
  //  color: "#0000FF",
  //},
  {
    col: "mombasa_dist",
    label: "Demand",
    type: "point",
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
    col: "water_resource",
    label: "Water resource considered for H2 production",
    cats: ["Domestic water bodies", "Ocean", "Cheapest option"],
    val: "Domestic water bodies",
  },
  {
    col: "water_tran_cost",
    label: "Water Transpot costs",
    min: 0,
    max: 1,
    val: 0.1,
    unit: "€/100km/m3",
  },
  {
    col: "h2_trans_cost",
    label: "H2 Transport costs",
    min: 0,
    max: 2,
    val: 0.9,
    unit: "€/100km/kg",
  }, 
  {
    col: "elec_water_treatment",
    label: "Energy demand water treatment",
    min: 0,
    max: 1,
    val: 0.2,                 //random assumption so far [kWh/m3] see: https://www.researchgate.net/publication/289707090_Energy_consumption_and_economic_cost_of_typical_wastewater_treatment_systems_in_Shenzhen_China
    unit: "kWh/m3",
  },
  {
    col: "elec_ocean_water_treatment",
    label: "Energy demand ocean water treatment",
    min: 1,
    max: 6,
    val: 3.7,                 //https://www.pnas.org/doi/epdf/10.1073/pnas.1902335116
    unit: "kWh/m3",
  },
];

const attrs = [
  {
    col: "price_h2",
    label: "H2 production costs [€/kg]",
    min: 1.0,
    max: 6.0,
    minCol: "hsl(90, 100%, 23%)",
    maxCol: "hsl(90, 29%, 93%)",
  },
  {
    col: "h2_cost_to_demand",
    label: "LCOH to closest demand",
    min: 1.0,
    max: 6.0,
    minCol: "hsl(90, 100%, 23%)",
    maxCol: "hsl(90, 29%, 93%)",
  },
  {
    col: "price_elec",
    label: "Cheapest electricity costs",
    min: 0,
    max: 50,
    minCol: "hsl(90, 29%, 93%)",
    maxCol: "hsl(90, 100%, 23%)",
  },
  {
    col: "price_elec_pv",
    label: "PV Electricity costs",
    min: 20,
    max: 25,
    minCol: "hsl(90, 29%, 93%)",
    maxCol: "hsl(90, 100%, 23%)",
  },
  {
    col: "price_elec_wind",
    label: "Wind Electricity costs",
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
    col: "water_dist",
    label: "Distance to water",
    min: 1,
    max: 10000,
    minCol: "hsl(255, 29%, 93%)",
    maxCol: "hsl(255, 100%, 23%)",
  },
  {
    col: "mombasa_dist",
    label: "Distance to mombasa",
    min: 1,
    max: 10000,
    minCol: "hsl(255, 29%, 93%)",
    maxCol: "hsl(255, 100%, 23%)",
  },
  {
    col: "ocean_dist",
    label: "Distance to ocean",
    min: 1,
    max: 10000,
    minCol: "hsl(255, 29%, 93%)",
    maxCol: "hsl(255, 100%, 23%)",
  },
  {
    col: "grid_dist",
    label: "Distance to grid",
    min: 1,
    max: 10000,
    minCol: "hsl(255, 29%, 93%)",
    maxCol: "hsl(255, 100%, 23%)",
  },
];

export default { loc, hexSize, popup, infra, pars, attrs };
