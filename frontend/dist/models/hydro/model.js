export default (town, pars) => {
  const price_elec = ((pars.pv_capex/20/town.pv/365) * 1000);
  const pv_radiation = town.pv


  return {
    price_elec: Math.max(0, price_elec),
    pv_radiation: Math.max(0, pv_radiation),
  };
};
