def model(town, pars):
    pv_lifetime = 20
    pv_opex = 9.3  # €/kWp*a

    wind_lifetime = 20
    wind_opex = 40  # €/kWp*a
    cp = 0.45  # Coefficient of performance wind turbine
    den_air = 1.14  # Air density in kg/m3
    d_rot = 100  # Diameter of rotor in kg/m3

    ely_capex = 1280  # €/kW
    ely_opex = 0.02  # % CAPEX/a
    ely_lt = 10  # a
    ely_eff = 0.6
    ely_cap = 0.6
    ely_water = 10  # liter/kg

    water_spec_cost = 1.2  # €/m3
    h2_en_den = 33.33  # kWh/kgh2
    energy_liquid = 9  # kWh/kgh2
    ely_output_pressure = 30  # bar

    # Function present value facto
    def pvf(interestrate, lifetime):
        return (((1 + interestrate) ** lifetime) - 1) / (
            ((1 + interestrate) ** lifetime) * interestrate
        )

    # Function decide on chepeast energy
    def cheapest_option(option1, option2):
        if option1 > option2:
            return option2
        else:
            return option1

    def elec_tech(option1, option2):
        if option1 > option2:
            return "wind"
        else:
            return "pv"

    # Function handling costs (compression or liquification)
    def handling_costs(state):
        if "Liquid" in state:
            return energy_liquid * (cost_elec / 1000)
        else:
            return (
                (0.003944 * 298.15 * (((500 / ely_output_pressure) ** (0.4 / 1.4)) - 1))
                / 0.8
            ) * (cost_elec / 1000)

    # Electricity cost calculation
    cost_elec_pv = (
        (pars["pv_capex"] / pvf((pars["interest_rate"] / 100), pv_lifetime) + pv_opex)
        / town["pv"]
        / 365
    ) * 1000
    pv_radiation = town["pv"] * 365
    wind_speed = town["wind"]
    turbine_output = (
        0.5
        * cp
        * den_air
        * ((d_rot**2) * 3.14 / 4)
        * (town["wind"] ** 3)
        * 8760
        / 1000
        / 3000
    )  # yearly power output per turbine
    cost_elec_wind = (
        (
            (
                pars["wind_capex"] / pvf(pars["interest_rate"] / 100, wind_lifetime)
                + wind_opex
            )
        )
        / turbine_output
    ) * 1000
    cost_elec = cheapest_option(cost_elec_pv, cost_elec_wind)
    cost_ely = (
        ((ely_capex / pvf(pars["interest_rate"] / 100, ely_lt)) / (ely_cap * 8760))
        * (h2_en_den / ely_eff)
    ) * (1 + ely_opex)
    elec_technology = elec_tech(cost_elec_pv, cost_elec_wind)

    # Water costs
    def water_costs(resource):
        if "Domestic" in resource:
            return (
                (
                    water_spec_cost
                    + (pars["water_tran_cost"] / 100) * town["water_dist"]
                    + pars["elec_water_treatment"] * cost_elec
                )
                * ely_water
                / 1000
            )
        elif "Ocean" in resource:
            return (
                (
                    water_spec_cost
                    + (pars["water_tran_cost"] / 100) * town["ocean_dist"]
                    + pars["elec_ocean_water_treatment"] * cost_elec
                )
                * ely_water
                / 1000
            )
        elif "Cheapest option" in resource:
            water_costs_h2_water_bodies = (
                (
                    water_spec_cost
                    + (pars["water_tran_cost"] / 100) * town["water_dist"]
                    + pars["elec_water_treatment"] * cost_elec
                )
                * ely_water
                / 1000
            )
            water_costs_h2_ocean = (
                (
                    water_spec_cost
                    + (pars["water_tran_cost"] / 100) * town["ocean_dist"]
                    + pars["elec_ocean_water_treatment"] * cost_elec
                )
                * ely_water
                / 1000
            )
            if water_costs_h2_ocean > water_costs_h2_water_bodies:
                return water_costs_h2_water_bodies
            else:
                return water_costs_h2_ocean

    # LCOH cost calculation
    cost_elec_h2 = (cost_elec / 1000) * (h2_en_den / ely_eff)
    cost_h2_ocean = (
        cost_elec_h2
        + cost_ely
        + handling_costs(pars["h2_state"])
        + (
            (
                water_spec_cost
                + (pars["water_tran_cost"] / 100) * town["ocean_dist"]
                + pars["elec_ocean_water_treatment"] * cost_elec
            )
            * ely_water
            / 1000
        )
    )
    cost_h2 = (
        cost_elec_h2
        + cost_ely
        + handling_costs(pars["h2_state"])
        + water_costs(pars["water_resource"])
    )

    # Distance to port in mombasa --> demand center due to export
    port_dist = town["mombasa_dist"]

    # H2 costs including transport
    h2_cost_to_demand = cost_h2 + (pars["h2_trans_cost"] * port_dist / 100)

    # Including restricted surface area: Currently forest, agri and water
    tech = (
        "something"
        if (town["avail_area"] - town["rest_area"]) > pars["min_area"]
        else "none"
    )
    available_area = town["avail_area"] - town["rest_area"]

    # Adding PV GWh possible
    def pv_kwp(size):
        if available_area > pars["min_area"]:
            return ((available_area) * 1000000) / size
        else:
            return 0

    pv_kWp = pv_kwp(pars["pv_size"])
    pv_kWh = pv_kWp * town["pv"] / 1000000  # in GWh

    # Adding Wind GWh possible
    def wind_pc(distance):
        if available_area > pars["min_area"]:
            return ((available_area) * 1000000) / (
                (3.14 * ((distance * d_rot) ** 2)) / 4
            )
        else:
            return 0

    wind_pcs = wind_pc(pars["wind_dist"])
    wind_kWh = turbine_output * wind_pcs / 1000000  # in GWh

    return dict(
        cost_elec_pv=cost_elec_pv,
        cost_elec_wind=cost_elec_wind,
        cost_elec=cost_elec,
        cost_h2=cost_h2,
        cost_h2_ocean=cost_h2_ocean,
        turbine_output=turbine_output,
        pv_radiation=pv_radiation,
        wind_speed=wind_speed,
        h2_cost_to_demand=h2_cost_to_demand,
        water_dist=town["water_dist"],
        ocean_dist=town["ocean_dist"],
        grid_dist=town["grid_dist"],
        tech=tech,
        rest_area=town["rest_area"],
        pv_kWh=pv_kWh,
        wind_kWh=wind_kWh,
        elec_technology=elec_technology,
    )
