export default (town, pars) => {

  //Fixed parameter declaration
  const pv_lifetime = 20
  const wind_lifetime = 20
  const cp = 0.45                     //Coefficient of performance wind turbine 
  const den_air = 1.14                      //Air density in kg/m3
  const d_rot = 100                         //Diameter of rotor in kg/m3


  
  function pvf(interestrate,lifetime) {
    return (((1+interestrate)**lifetime)-1)/(((1+interestrate)**lifetime)*interestrate)
  }
  
  const price_elec_pv = ((pars.pv_capex/pvf((pars.interest_rate/100),pv_lifetime)/town.pv/365) * 1000);
  const pv_radiation = town.pv
  
  const wind_speed = town.wind
  const turbine_output = 0.5 * cp * den_air * ((d_rot**2)*Math.PI/4) * (town.wind ** 3) * 8760 / 1000 / pars.p_turbine    //yearly power output per turbine
  const price_elec_wind = ((pars.wind_capex/pvf(pars.interest_rate,wind_lifetime))/turbine_output)




  return {
    price_elec_pv: Math.max(0, price_elec_pv),
    price_elec_wind: Math.max(0, price_elec_wind),
    turbine_output: Math.max(0, turbine_output),
    pv_radiation: Math.max(0, pv_radiation),
    wind_speed: Math.max(0, wind_speed)
  };
};
