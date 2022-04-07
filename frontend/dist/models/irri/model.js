export default (town, pars) => {
  const h3size = 0.7373276;
  const km2ha = 100;
  const CropWaterNeeds = 50; //m3 per t per year
  const pump_eff = 0.8;
  const kWh_cost = 0.8;

  const crop_production =
    ((town.crop_extentmajority * 0.5) / 100) * h3size * km2ha * town.cropyield;

  const transp_cost =
    ((town.MarketDist * 833) / 1000) *
    town.crop_extentmajority *
    pars.tcostperton_km;

  const irrig_cost =
    ((crop_production * CropWaterNeeds * town.WTDmean * pars.pumpenergyint) /
      pump_eff) *
    kWh_cost;

  const revenue = crop_production * pars.crop_price;
  const profit = revenue - transp_cost - irrig_cost;

  const tech = crop_production > 0.5 ? "agri" : "none";

  return {
    crop_production: Math.max(0, crop_production),
    transp_cost: Math.max(0, transp_cost),
    irrig_cost: Math.max(0, irrig_cost),
    revenue: Math.max(0, revenue),
    profit: Math.max(0, profit),
    tech: tech,
  };
};
