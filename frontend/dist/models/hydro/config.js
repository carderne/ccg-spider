const center = [37.7, 0.31];
const zoom = 6;
const loc = { center, zoom };

const hexSize = 9; // km

const popup = [
  {
    col: "cost_h2",
    label: "Hydrogen costs",
    unit: "€/kg",
    fmt: 2, // this should be the number of decimal places
            // or false for categorical labels
  },
  {
    col: "cost_h2_ocean",
    label: "Hydrogen costs ocean",
    unit: "€/kg",
    fmt: 2, // this should be the number of decimal places
            // or false for categorical labels
  },
  {
    col: "pv",
    label: "PV output",
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
    col: "cost_elec",
    label: "Electricity costs (cheapest)",
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
  //{
  //  col: "road_dist",
  //  label: "Road",
  //  type: "line",
  //  color: "#0000FF",
  //},
  {
    col: "mombasa_dist",
    label: "Demand site",
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
  {
    col: "pv_size",
    label: "PV Module size",
    min: 1,
    max: 10,
    val: 6,                 
    unit: "m2/kWp",
  },
  {
    col: "wind_dist",
    label: "Wind turbine distance",
    min: 1,
    max: 10,
    val: 6,                 
    unit: "* Rotor Diameter",  //https://energyfollower.com/wind-turbine-spacing/
  },
  {
    col: "min_area",
    label: "Min. available area to construct",
    min: 1,
    max: 100,
    val: 10,                 
    unit: "km2",  
  },
];

const attrs = [
  {
    col: "cost_h2",
    label: "H2 production costs [€/kg]",
    min: 1.0,
    max: 6.0,
    minCol: "hsl(90, 100%, 23%)",
    maxCol: "hsl(90, 29%, 93%)",
  },
  {
    col: "h2_cost_to_demand",
    label: "LCOH to demand [€/kg]",
    min: 1.0,
    max: 6.0,
    minCol: "hsl(90, 100%, 23%)",
    maxCol: "hsl(90, 29%, 93%)",
  },
  {
    col: "cost_elec",
    label: "Cheapest LCOE [€/MWh]",
    min: 0,
    max: 50,
    minCol: "hsl(183, 100%, 50%)",
    maxCol: "hsl(183, 100%, 95%)",
  },
  {
    col: "cost_elec_pv",
    label: "PV LCOE [€/MWh]",
    min: 20,
    max: 25,
    minCol: "hsl(10, 98%, 54%)",
    maxCol: "hsl(59, 98%, 86%)",
  },
  {
    col: "pv_radiation",
    label: "Solar radiation [kWh/kWp/a]",
    min: 2,
    max: 6,
    minCol: "hsl(55, 29%, 93%)",
    maxCol: "hsl(55, 100%, 57%)",
  },
  {
    col: "pv_kWh",
    label: "PV capacity [GWh/a]",
    min: 0,
    max: 250,
    minCol: "hsl(55, 29%, 93%)",
    maxCol: "hsl(55, 100%, 57%)",
  },
  {
    col: "cost_elec_wind",
    label: "Wind LCOE [€/MWh]",
    min: 0,
    max: 50,
    minCol: "hsl(255, 100%, 23%)",
    maxCol: "hsl(255, 29%, 93%)",
  },
  {
    col: "wind_speed",
    label: "Mean wind speed [m/s]",
    min: 1,
    max: 20,
    minCol: "hsl(255, 29%, 93%)",
    maxCol: "hsl(255, 100%, 23%)",
  },
  {
    col: "wind_kWh",
    label: "Wind capacity [GWh/a]",
    min: 1,
    max: 20,
    minCol: "hsl(255, 29%, 93%)",
    maxCol: "hsl(255, 100%, 23%)",
  },
  {
    col: "elec_technology",
    label: "Chepeast Technology",
    cats: ["pv", "wind"],
    colors: [
      "hsl(55, 100%, 57%)",
      "hsl(255, 100%, 23%)",
      "hsla(200, 60%, 60%, 0.2)",
    ],
  },
  {
    col: "grid_dist",
    label: "Grid dist [km]",
    min: 0,
    max: 1000,
    minCol: "hsl(30, 100%, 23%)",
    maxCol: "hsl(30, 29%, 93%)",
  },
  //{
  //  col: "turbine_output",
  //  label: "Turbine output",
  //  min: 1,
  //  max: 20,
  //  minCol: "hsl(255, 29%, 93%)",
  //  maxCol: "hsl(255, 100%, 23%)",
  //},

  //{
  //  col: "water_dist",
  //  label: "Distance to water",
  //  min: 1,
  //  max: 10000,
  //  minCol: "hsl(255, 29%, 93%)",
  //  maxCol: "hsl(255, 100%, 23%)",
  //},
  //{
  //  col: "mombasa_dist",
  //  label: "Distance to mombasa",
  //  min: 1,
  //  max: 10000,
  //  minCol: "hsl(255, 29%, 93%)",
  //  maxCol: "hsl(255, 100%, 23%)",
  //},
  //{
  //  col: "ocean_dist",
  //  label: "Distance to ocean",
  //  min: 1,
  //  max: 10000,
  //  minCol: "hsl(255, 29%, 93%)",
  //  maxCol: "hsl(255, 100%, 23%)",
  //},
  //{
  //  col: "grid_dist",
  //  label: "Distance to grid",
  //  min: 1,
  //  max: 10000,
  //  minCol: "hsl(255, 29%, 93%)",
  //  maxCol: "hsl(255, 100%, 23%)",
  //},
  //{
  //  col: "rest_area",
  //  label: "Restricted area [km2]",
  //  min: 1,
  //  max: 10000,
  //  minCol: "hsl(255, 29%, 93%)",
  //  maxCol: "hsl(255, 100%, 23%)",
  //},
];

export default { loc, hexSize, popup, infra, pars, attrs };
