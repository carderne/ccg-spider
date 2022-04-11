export default (town, pars) => {

  //Fixed parameter declaration
  const pv_lifetime = 20
  const pv_opex = 9.3                 //€/kWp*a

  const wind_lifetime = 20
  const wind_opex = 40                //€/kWp*a
  const cp = 0.45                     //Coefficient of performance wind turbine 
  const den_air = 1.14                //Air density in kg/m3
  const d_rot = 100                   //Diameter of rotor in kg/m3

  const ely_capex = 1280                                            // €/kW
  const ely_opex = 0.02                                             // % CAPEX/a
  const ely_lt = 10                                                 // a
  const ely_eff = 0.6                                               
  const ely_cap = 0.6

  const h2_en_den = 33.33                                           //kWh/kgh2



  
  function pvf(interestrate,lifetime) {
    return (((1+interestrate)**lifetime)-1)/(((1+interestrate)**lifetime)*interestrate)
  }

  function cheapest_electricity_option (option1, option2){
    if (option1>option2) {
      return option2;
    }else{
      return option1
    }
  }
  
  const price_elec_pv = (((pars.pv_capex/pvf((pars.interest_rate/100),pv_lifetime)+pv_opex)/town.pv/365) * 1000);
  const pv_radiation = town.pv
  
  const wind_speed = town.wind
  const turbine_output = 0.5 * cp * den_air * ((d_rot**2)*Math.PI/4) * (town.wind ** 3) * 8760 / 1000 / 3000   //yearly power output per turbine
  const price_elec_wind = (((pars.wind_capex/pvf(pars.interest_rate/100,wind_lifetime) +  wind_opex)) / turbine_output)*1000

  const price_elec = cheapest_electricity_option(price_elec_pv,price_elec_wind)

  const price_ely = (((ely_capex/pvf(pars.interest_rate/100,ely_lt))/(ely_cap*8760))*(h2_en_den/ely_eff))*(1 + ely_opex)
  const price_elec_h2 = (price_elec/1000) * (h2_en_den/ely_eff)
  const price_h2 = price_elec_h2 + price_ely




  return {
    price_elec_pv: Math.max(0, price_elec_pv),
    price_elec_wind: Math.max(0, price_elec_wind),
    price_elec: Math.max(0,price_elec),
    price_h2: Math.max(0, price_h2),
    turbine_output: Math.max(0, turbine_output),
    pv_radiation: Math.max(0, pv_radiation),
    wind_speed: Math.max(0, wind_speed)
  };
};
