export const pars = [
  {
    var: "duration",
    label: "Duration",
    min: 5,
    max: 20,
    val: 10,
    unit: "years",
  },
  {
    var: "interest_rate",
    label: "Interest rate",
    min: 0,
    max: 100,
    val: 6,
    unit: "%",
  },
  {
    var: "fish_price",
    label: "Fish sale price",
    min: 0,
    max: 10000,
    val: 6000,
    unit: "USD/ton",
  },
  {
    var: "max_fish_output",
    label: "Max fish output",
    min: 0,
    max: 100000,
    val: 10000,
    unit: "ton/yr",
  },
  {
    var: "labor_per_hh",
    label: "Labour available",
    min: 0,
    max: 10,
    val: 0.5,
    unit: "people per hh",
  },
  {
    var: "min_pop",
    label: "Min pop",
    min: 0,
    max: 100000,
    val: 33000,
    unit: "people",
  },
  {
    var: "max_pop",
    label: "Max pop",
    min: 0,
    max: 1000000,
    val: 200000,
    unit: "people",
  },
  {
    var: "max_lake_dist",
    label: "Max Lake Vic dist",
    min: 0,
    max: 100,
    val: 9,
    unit: "km",
  },
  {
    var: "max_water_dist",
    label: "Max lake dist",
    min: 0,
    max: 100,
    val: 9,
    unit: "km",
  },
  {
    var: "min_precip",
    label: "Min precip",
    min: 0,
    max: 1000,
    val: 500,
    unit: "mm/year",
  },
  {
    var: "truck_econ_multi",
    label: "Truck traffic multiplier",
    min: 0,
    max: 10,
    val: 1,
    unit: "x",
  },
  {
    var: "traffic_pp",
    label: "Current traffic",
    min: 0,
    max: 1,
    val: 1 / 2000,
    unit: "vehicles/person",
  },
  {
    var: "mg_cost_pkw",
    label: "MG cost",
    min: 0,
    max: 10000,
    val: 6000,
    unit: "USD/kW",
  },
  {
    var: "elec_ice",
    label: "Energy for ice",
    min: 0,
    max: 500,
    val: 125,
    unit: "kWh/ton of fish/year",
  },
  {
    var: "ice_power",
    label: "Power for ice",
    min: 0,
    max: 1,
    val: 0.1,
    unit: "kW/ton capacity",
  },
  {
    var: "aeration_power",
    label: "Power for aeration",
    min: 0,
    max: 10,
    val: 1.25,
    unit: "kW/ton capacity",
  },
];

export const filts = [
  {
    var: "water_dist",
    label: "Max water dist",
    min: 0,
    max: 10,
    val: 5,
    op: "<",
    unit: "km",
  },
];

export const attrs = [
  {
    var: "profit",
    min: 0,
    max: 15_000_000,
    minCol: "hsl(0, 29%, 93%)",
    maxCol: "hsl(0, 100%, 23%)",
  },
  {
    var: "grid_dist",
    min: 0,
    max: 100,
    minCol: "hsl(90, 29%, 93%)",
    maxCol: "hsl(90, 100%, 23%)",
  },
  {
    var: "lake_dist",
    min: 0,
    max: 20,
    minCol: "hsl(150, 29%, 93%)",
    maxCol: "hsl(150, 100%, 23%)",
  },
];