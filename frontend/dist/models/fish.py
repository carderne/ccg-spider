from typing import TypedDict


class Town(TypedDict):
    pop: float
    precip: float
    grid_dist: float
    lake_dist: float
    water_dist: float
    river_dist: float
    road_dist: float
    urban_dist: float
    city_dist: float
    adm1: str
    hhs: float


class Pars(TypedDict):
    grid_cost: float
    road_cost: float
    duration: float
    interest_rate: float
    fish_price: float
    max_fish_output: float
    labor_per_hh: float
    min_pop: float
    max_pop: float
    max_lake_dist: float
    max_water_dist: float
    min_precip: float
    truck_econ_multi: float
    traffic_pp: float
    mg_cost_pkw: float
    elec_ice: float
    ice_power: float
    aeration_power: float


class C:
    # Key counties that are always included
    # (bypassing water/precip requirements)
    key_counties: list[str] = [
        "homa bay",
        "migori",
        "kakamega",
        "kirinyaga",
        "nyeri",
        "meru",
        "tharaka nithi",
        "kisii",
        "kisumu",
        "siaya",
        "busia",
        "embu",
        "kiambu",
        "machakos",
        "kajiado",
        "kitui",
    ]


class Result(TypedDict):
    tech: str
    fish_output: float
    revenue: float
    profit: float
    gov_costs: float
    gov_annual: float
    social: float


def constrain_output(town: Town, pars: Pars) -> tuple[float, str]:
    """
    Calculate output and farm_type.
    All major constraints and decisions about technology should be here.

    Returns:
      fish_output in ton/yr
      farm_type as a string
    """
    farm_type = "none"
    if town["lake_dist"] < pars["max_lake_dist"]:
        farm_type = "cage"
    elif (
        town["water_dist"] < pars["max_water_dist"]
        or town["river_dist"] < pars["max_water_dist"]
        or town["precip"] > pars["min_precip"]
        or town["adm1"].lower() in C.key_counties
    ):
        farm_type = "pond"
    fish_output = 0.0
    if (
        town["precip"] > pars["min_precip"]
        and town["pop"] > pars["min_pop"]
        and town["pop"] < pars["max_pop"]
    ):
        max_from_farm = 0.0
        if farm_type == "cage":
            max_from_farm = pars["max_fish_output"]
        elif farm_type == "pond":
            max_from_farm = town["precip"] * 20

        labor = town["hhs"] * pars["labor_per_hh"]  # number of laborers available
        labor_needed = 3 if farm_type == "cage" else 1
        # worker/ton/yr
        max_fish_from_labor = labor / labor_needed  # ton/yr

        fish_output = min(
            pars["max_fish_output"], max_fish_from_labor, max_from_farm
        )  # ton/yr

    if fish_output == 0:
        farm_type = "none"
    if farm_type == "none":
        fish_output = 0
    return fish_output, farm_type


def calc_npv(yrs: float, r: float) -> float:
    """
    Calculate NPV multiplier for given number of years and rate.

    Returns: NPV in USD/yr
    """
    tot = 0.0
    for i in range(int(yrs)):
        tot += 1 / (1 + r) ** i
    return tot


def get_road_type(town: Town, pars: Pars, farm_type: str, fish_output: float) -> str:
    """
    Get road type.

    Returns: road_type as string, one of: paved, gravel, earth
    """
    # type
    traffic = town["pop"] / pars["traffic_pp"]  # vehicles/day
    fish_vehicles = 7.7 if farm_type == "cage" else 10.2  # num/ton of fish/yr
    total_traffic = traffic + fish_vehicles * fish_output * pars["truck_econ_multi"]
    if total_traffic > 200 * 365:
        return "paved"
    elif total_traffic > 50 * 365:
        return "gravel"
    else:
        return "earth"


def get_road_cap_cost(town: Town, needed: str) -> float:
    """
    Returns: USD/km
    """
    # TODO
    # hex doesn't have 'road_type' property
    # cost = 0
    # if town["road_type"] == "earth" and needed == "gravel":
    # cost = 92_266
    # elif town["road_type"] == "gravel" and needed == "paved":
    # cost = 414_962
    # elif town["road_type"] == "earth" and needed == "paved":
    # cost = 507_228
    cost = 92_266.0  # this is just because of the missing data above!

    if town["road_dist"] < 10:
        cost *= 1.3
    return cost


def get_road_maintenance(needed: str) -> float:
    """
    Returns: USD/km/yr
    """
    maintenance = 0
    if needed == "gravel":
        maintenance = 5_822
    elif needed == "paved":
        maintenance = 7_526
    return maintenance


def get_land_required(farm_type: str) -> float:
    """
    Returns: acres/ton
    """
    if farm_type == "cage":
        return 0.01
    else:
        return 0.83


def get_land_rent(pars: Pars, farm_type: str) -> float:
    """
    Returns: USD/ton/yr
    """
    land_required = get_land_required(farm_type)
    land_value = 4000  # USD/acre
    land_cost = land_required * land_value  # USD/ton
    land_rent = land_cost * pars["interest_rate"]  # USD/ton/yr
    return land_rent


def get_elec_capex(town: Town, pars: Pars) -> float:
    """
    Returns: USD
    """
    if town["grid_dist"] < 1:
        # already grid-connected
        return 0
    elif town["grid_dist"] < 20:
        # close enough to extend grid
        mv_cost_pkm = 15_000  # USD/km2
        conn_cost_phh = 4800  # USD/hh
        mv_cost = mv_cost_pkm * town["grid_dist"]  # USD
        conn_cost = conn_cost_phh * town["hhs"]  # USD
        return mv_cost + conn_cost
    else:
        kw_needed = town["hhs"] * 0.2  # kW
        conn_cost_phh = 500  # USD/hh
        mg_cost = pars["mg_cost_pkw"] * kw_needed  # USD
        conn_cost = conn_cost_phh * town["hhs"]  # USD
        return mg_cost + conn_cost


def get_elec_cost_for_farm(town: Town, pars: Pars, npv: float) -> float:
    """
    Returns: USD/ton/yr
    """
    total_power_req = max(2, pars["ice_power"] + pars["aeration_power"])  # kW/ton
    if town["grid_dist"] < 1:
        # already grid-connected
        return 0
    elif town["grid_dist"] < 20:
        # close enough to extend grid
        return 0
    else:
        mg_cap_cost = pars["mg_cost_pkw"] * total_power_req
        mg_repayment = mg_cap_cost / npv
        return mg_repayment


def get_farm_cap_cost_annual(pars: Pars, farm_type: str, npv: float) -> float:
    """
    Returns: USD/ton/yr
    """
    farm_cap_cost = 138.89 if farm_type == "cage" else 1950
    farm_annual = farm_cap_cost / npv  # USD/ton/yr
    return farm_annual


def get_transport_costs(town: Town) -> float:
    """
    Returns: USD/ton/yr
    """
    urban_to_city = town["city_dist"] - town["urban_dist"]
    short_dist_flat = 7.88  # USD/ton
    short_dist_spec = 1.214  # USD/ton/km
    long_dist_flat = 13.54  # USD/ton
    long_dist_spec = 0.086  # USD/ton/km
    transport_to_urban = (
        short_dist_flat + short_dist_spec * town["urban_dist"]
    )  # USD/ton
    transport_to_city = long_dist_flat + long_dist_spec * urban_to_city  # USD/ton
    short_dist_transport_multiplier = 1.5  # to account for ice and fish
    long_dist_transport_multiplier = 2  # ditto
    transport_cost_urban = (
        transport_to_urban * short_dist_transport_multiplier
    )  # USD/ton/yr
    transport_cost_city = (
        transport_to_city * long_dist_transport_multiplier
    )  # USD/ton/yr
    return transport_cost_urban + transport_cost_city  # USD/ton/yr


def get_revenue(pars: Pars, farm_type: str) -> float:
    fish_price = pars["fish_price"]
    if farm_type == "pond":
        fish_price *= 0.75
    return fish_price


def get_equipment_costs(pars: Pars, npv: float) -> float:
    """
    Returns: USD/ton/yr
    """
    capex_ice = 1000  # USD/ton capacity
    capex_aeration = 200  # USD/ton capacity
    capex_equipment = capex_ice + capex_aeration  # USD/ton capacity
    equipment_annual = capex_equipment / npv  # USD/ton/yr
    return equipment_annual


def get_running_costs(pars: Pars, farm_type: str) -> float:
    """
    Returns: USD/ton
    """
    aeration_use = 10  # hours
    elec_aeration = aeration_use * pars["aeration_power"] * 365  # kWh/ton/yr of fish

    elec_cost_to_farm = 0.25  # USD/kWh
    cost_feed = 1375  # USD/ton
    cost_labor = 150.7  # USD/ton
    cost_fingerlings = 500  # USD/ton
    cost_misc = 48.02 if farm_type == "cage" else 226.67  # USD/ton
    cost_ice = elec_cost_to_farm * pars["elec_ice"]  # USD/ton
    cost_aeration = elec_cost_to_farm * elec_aeration  # USD/ton
    total_running_costs = (
        cost_feed + cost_labor + cost_fingerlings + cost_misc + cost_ice + cost_aeration
    )  # USD/ton
    return total_running_costs


def get_gov_costs(town: Town, pars: Pars, road_type_needed: str) -> tuple[float, float]:
    """
    Returns:
      costs in USD
      annual in USD/yr
    """
    elec_capex = get_elec_capex(town, pars)
    road_cap_cost = get_road_cap_cost(town, road_type_needed)  # USD/km
    road_capex = road_cap_cost * town["road_dist"]  # USD
    road_maintenance_cost = get_road_maintenance(road_type_needed)  # USD/km/yr
    road_maintenance = road_maintenance_cost * town["road_dist"]  # USD/yr
    gov_costs = elec_capex + road_capex  # USD
    gov_annual = road_maintenance  # USD/yr
    return gov_costs, gov_annual


def get_social_benefit(town: Town) -> float:
    """
    Returns: USD/yr
    """
    energy_cooking = 1875  # kWh/yr
    energy_lights = 21.9  # kWh/yr
    energy_phh = energy_cooking + energy_lights  # kWh/yr
    energy_total = energy_phh * town["hhs"]  # kWh
    cooking_co2_saved = 1.47  # kgCO2/kWh
    social_carbon_cost = 0.15  # USD/kgCO2/yr
    health_benefits = 0.1  # USD/kgCO2/yr
    social_benefit = social_carbon_cost + health_benefits  # USD/kgCO2/yr
    total_social_benefit = social_benefit * cooking_co2_saved * energy_total  # USD/yr
    return total_social_benefit


def model(town: Town, pars: Pars) -> Result:
    """
    Main modelling entrypoint.
    Other functions in this file should not be called directly.
    """

    # Some decisions
    fish_output, farm_type = constrain_output(town, pars)  # ton/yr

    if farm_type != "none":
        # Costs
        land_rent = get_land_rent(pars, farm_type)  # USD/ton/yr
        npv = calc_npv(pars["duration"], pars["interest_rate"])
        elec_cost_for_farm = get_elec_cost_for_farm(town, pars, npv)  # USD/ton/yr
        farm_annual = get_farm_cap_cost_annual(pars, farm_type, npv)  # USD/ton/yr
        equipment_annual = get_equipment_costs(pars, npv)  # USD/ton/yr
        running_costs = get_running_costs(pars, farm_type)  # USD/ton/yr
        transport_costs = get_transport_costs(town)  # USD/ton/yr
        # Total costs
        costs_per_ton = (
            land_rent
            + elec_cost_for_farm
            + running_costs
            + farm_annual
            + equipment_annual
            + transport_costs
        )  # USD/ton/yr

        # Revenue
        revenue_per_ton = get_revenue(pars, farm_type)  # USD/ton/yr

        # Profit
        profit_per_ton = revenue_per_ton - costs_per_ton  # USD/ton/yr

        # Non-specific costs
        grid_cost = pars["grid_cost"] * town["grid_dist"]  # USD/year
        road_cost = pars["road_cost"] * town["road_dist"]  # USD/year
        infra_cost = grid_cost + road_cost  # USD/year

        # Absolute revenue and profit
        revenue = revenue_per_ton * fish_output  # USD/year
        profit = profit_per_ton * fish_output - infra_cost  # USD/yr

        # Gov costs
        road_type_needed = get_road_type(town, pars, farm_type, fish_output)
        gov_costs, gov_annual = get_gov_costs(town, pars, road_type_needed)

        # Household elec
        total_social_benefit = get_social_benefit(town)
        return Result(
            tech=farm_type,
            fish_output=max(0, fish_output),
            revenue=max(0, revenue),
            profit=max(0, profit),
            gov_costs=max(0, gov_costs),
            gov_annual=max(0, gov_annual),
            social=max(0, total_social_benefit),
        )

    return Result(
        tech="none",
        fish_output=0,
        revenue=0,
        profit=0,
        gov_costs=0,
        gov_annual=0,
        social=0,
    )
