export default (town, pars) => {

  //Fixed parameter declaration
  const pv_lifetime = 20
  const pv_opex = 9.3                 //€/kWp*a

  const wind_lifetime = 20
  const wind_opex = 40                //€/kWp*a
  const cp = 0.45                     //Coefficient of performance wind turbine 
  const den_air = 1.14                //Air density in kg/m3
  const d_rot = 100                   //Diameter of rotor in kg/m3

  const ely_capex = 1280              // €/kW
  const ely_opex = 0.02               // % CAPEX/a
  const ely_lt = 10                   // a
  const ely_eff = 0.6                                               
  const ely_cap = 0.6
  const ely_water = 10               //liter/kg

  const water_spec_cost = 1.2        // €/m3
  
  const h2_en_den = 33.33             //kWh/kgh2
  
  const energy_liquid = 9             //kWh/kgh2
  const ely_output_pressure = 30      //bar


  //Function present value facto
  function pvf(interestrate,lifetime) {
    return (((1+interestrate)**lifetime)-1)/(((1+interestrate)**lifetime)*interestrate)
  }

  //Function decide on chepeast energy
  function cheapest_option (option1, option2){
    if (option1>option2) {
      return option2;
    }else{
      return option1
    }
  }
 
  //Function handling costs (compression or liquification)
  function handling_costs(state){
    if (state.includes("Liquid")) {
      return energy_liquid*(price_elec/1000)
    }else{
      return ((0.003944*298.15*(((500/ely_output_pressure)**(0.4/1.4))-1))/0.8)*(price_elec/1000)
    }
  }

  //Electricity price calculation
  const price_elec_pv = (((pars.pv_capex/pvf((pars.interest_rate/100),pv_lifetime)+pv_opex)/town.pv/365) * 1000);
  const pv_radiation = town.pv
  const wind_speed = town.wind
  const turbine_output = 0.5 * cp * den_air * ((d_rot**2)*Math.PI/4) * (town.wind ** 3) * 8760 / 1000 / 3000   //yearly power output per turbine
  const price_elec_wind = (((pars.wind_capex/pvf(pars.interest_rate/100,wind_lifetime) +  wind_opex)) / turbine_output)*1000
  const price_elec = cheapest_option(price_elec_pv,price_elec_wind)
  const price_ely = (((ely_capex/pvf(pars.interest_rate/100,ely_lt))/(ely_cap*8760))*(h2_en_den/ely_eff))*(1 + ely_opex)

  //Water costs
  function water_costs(resource){
    if (resource.includes("Domestic")) {
      return ((water_spec_cost + (pars.water_tran_cost/100)*town.water_dist + pars.elec_water_treatment*price_elec)*ely_water/1000)
    }
    else if (resource.includes("Ocean")) {
      return ((water_spec_cost + (pars.water_tran_cost/100)*town.ocean_dist + pars.elec_ocean_water_treatment*price_elec)*ely_water/1000)

    }
    else {
      water_costs_h2_water_bodies = (water_spec_cost + (pars.water_tran_cost/100)*town.water_dist + pars.elec_water_treatment*price_elec)*ely_water/1000
      water_costs_h2_ocean = (water_spec_cost + (pars.water_tran_cost/100)*town.ocean_dist + pars.elec_ocean_water_treatment*price_elec)*ely_water/1000
      return cheapest_option(water_costs_h2_water_bodies,water_costs_h2_ocean)
    }
  }

  //h2_price_ocean = ((water_spec_cost + (pars.water_tran_cost/100)*town.ocean_dist + pars.elec_ocean_water_treatment*price_elec)*ely_water/1000)
  
  //Take grid distance in account 

  
  //LCOH price calculation
  const price_elec_h2 = (price_elec/1000) * (h2_en_den/ely_eff)
  const price_h2 = price_elec_h2 + price_ely + handling_costs(pars.h2_state) + water_costs(pars.water_resource)
  const price_h2_ocean = price_elec_h2 + price_ely + handling_costs(pars.h2_state) + ((water_spec_cost + (pars.water_tran_cost/100)*town.ocean_dist + pars.elec_ocean_water_treatment*price_elec)*ely_water/1000)

  //Distance to port in mombasa --> demand center due to export
  const port_dist = town.mombasa_dist
  
  const h2_cost_to_demand = price_h2 + (pars.h2_trans_cost * port_dist/100)

  
  return {
    price_elec_pv: Math.max(0, price_elec_pv),
    price_elec_wind: Math.max(0, price_elec_wind),
    price_elec: Math.max(0,price_elec),
    price_h2: Math.max(0, price_h2),
    price_h2_ocean: Math.max(0,price_h2_ocean),
    turbine_output: Math.max(0, turbine_output),
    pv_radiation: Math.max(0, pv_radiation),
    wind_speed: Math.max(0, wind_speed),
    h2_cost_to_demand: Math.max(0, h2_cost_to_demand),
    water_dist: Math.max(0, town.water_dist),
    ocean_dist: Math.max(0, town.ocean_dist),
    grid_dist: Math.max(0,town.grid_dist)
  };
};
