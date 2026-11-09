from models import WhatIfRequest, WhatIfResponse, DataSource
from simulation import simulation_instance
from typing import Dict, Any

def run_what_if_simulation(req: WhatIfRequest) -> WhatIfResponse:
    # Baseline campus parameters
    # Annual consumption ~ 18,250 MWh (50 MWh/day baseline)
    baseline_energy_mwh_yr = 18250.0
    baseline_solar_gen_mwh_yr = 5600.0
    electricity_tariff_per_kwh = 9.0 # INR per kWh
    co2_factor_kg_per_kwh = 0.71 # kg CO2 per kWh grid
    water_tariff_per_kl = 65.0 # INR per kL
    
    # 1. LED upgrade savings
    # Total lighting is ~ 25% of baseline energy = 4,562 MWh
    # Converting fluorescent/halogen to LED saves up to 55% of lighting power
    lighting_savings_mwh = (4562.5 * (req.lighting_led_upgrade_pct / 100.0) * 0.52)
    led_capex = req.lighting_led_upgrade_pct * 35000.0 # ~3.5M INR for 100% campus retrofit

    # 2. HVAC setpoint adjustment & runtime reduction
    # Each +1°C setpoint adjustment saves ~6.5% of cooling energy
    # HVAC is ~ 48% of total energy = 8,760 MWh
    hvac_base_mwh = 8760.0
    setpoint_savings_pct = max(0.0, req.hvac_setpoint_adjustment_c * 0.065)
    runtime_savings_pct = (req.hvac_runtime_reduction_pct / 100.0)
    total_hvac_reduction_pct = min(0.45, setpoint_savings_pct + runtime_savings_pct)
    hvac_savings_mwh = hvac_base_mwh * total_hvac_reduction_pct
    hvac_capex = 450000.0 if req.hvac_runtime_reduction_pct > 0 else 0.0 # Smart thermostat/BMS programming

    # 3. Solar capacity expansion
    # 1 kWp of solar yields ~ 1,450 kWh/year in India/tropics = 1.45 MWh/yr
    additional_solar_gen_mwh = req.solar_capacity_increase_kw * 1.45
    solar_capex = req.solar_capacity_increase_kw * 42000.0 # ~42,000 INR per kWp installed

    # 4. Equipment replacement (Chiller VFDs, IE4 motors)
    equipment_savings_mwh = 820.0 if req.replace_inefficient_equipment else 0.0
    equipment_capex = 4800000.0 if req.replace_inefficient_equipment else 0.0

    # 5. Occupancy shift impact (-50% to +50%)
    # Plug and ventilation load scales with occupancy (~15% of total)
    occ_impact_mwh = 2737.5 * (req.occupancy_shift_pct / 100.0) * 0.40

    # 6. Operating hours restriction
    operating_hours_savings_mwh = 0.0
    if req.operating_hours_limit and req.operating_hours_limit < 14:
        hours_saved = max(0, 14 - req.operating_hours_limit)
        operating_hours_savings_mwh = (hours_saved / 14.0) * 1250.0

    # 7. Rainwater harvesting
    water_savings_kl_yr = (req.rainwater_harvesting_expansion_pct / 100.0) * 48000.0 # up to 48,000 kL/yr
    water_capex = (req.rainwater_harvesting_expansion_pct / 100.0) * 2200000.0 # 2.2M INR
    water_financial_savings = water_savings_kl_yr * water_tariff_per_kl

    # Total energy savings & new projected energy
    total_energy_savings_mwh = max(0.0, lighting_savings_mwh + hvac_savings_mwh + equipment_savings_mwh + operating_hours_savings_mwh - occ_impact_mwh)
    projected_energy_mwh = max(6000.0, baseline_energy_mwh_yr - total_energy_savings_mwh)
    energy_savings_pct = round((total_energy_savings_mwh / baseline_energy_mwh_yr * 100.0), 2)

    # Net grid power needed
    new_solar_total_mwh = baseline_solar_gen_mwh_yr + additional_solar_gen_mwh
    baseline_grid_mwh = max(0.0, baseline_energy_mwh_yr - baseline_solar_gen_mwh_yr)
    projected_grid_mwh = max(0.0, projected_energy_mwh - new_solar_total_mwh)
    grid_reduction_pct = round(((baseline_grid_mwh - projected_grid_mwh) / baseline_grid_mwh * 100.0) if baseline_grid_mwh > 0 else 0, 2)

    # Financial and CO2 calculations
    financial_savings_inr = (total_energy_savings_mwh * 1000.0 * electricity_tariff_per_kwh) + (additional_solar_gen_mwh * 1000.0 * electricity_tariff_per_kwh) + water_financial_savings
    co2_reduction_tons = ((total_energy_savings_mwh + additional_solar_gen_mwh) * 1000.0 * co2_factor_kg_per_kwh) / 1000.0

    total_capex = led_capex + hvac_capex + solar_capex + equipment_capex + water_capex
    payback_years = round((total_capex / financial_savings_inr), 2) if financial_savings_inr > 0 else 0.0

    scenario_parts = []
    if req.lighting_led_upgrade_pct > 0:
        scenario_parts.append(f"LED Upgrade ({req.lighting_led_upgrade_pct:.0f}%)")
    if req.hvac_setpoint_adjustment_c > 0 or req.hvac_runtime_reduction_pct > 0:
        scenario_parts.append(f"HVAC Optimization (+{req.hvac_setpoint_adjustment_c}°C, -{req.hvac_runtime_reduction_pct:.0f}% run)")
    if req.solar_capacity_increase_kw > 0:
        scenario_parts.append(f"Solar +{req.solar_capacity_increase_kw:.0f} kWp")
    if req.rainwater_harvesting_expansion_pct > 0:
        scenario_parts.append(f"Rainwater Harvest ({req.rainwater_harvesting_expansion_pct:.0f}%)")
    if req.replace_inefficient_equipment:
        scenario_parts.append("VFD & Motor Retrofit")

    scenario_name = " + ".join(scenario_parts) if scenario_parts else "Default Baseline Scenario"

    return WhatIfResponse(
        scenario_name=scenario_name,
        baseline_energy_mwh_yr=round(baseline_energy_mwh_yr, 1),
        projected_energy_mwh_yr=round(projected_energy_mwh, 1),
        energy_savings_mwh_yr=round(total_energy_savings_mwh, 1),
        energy_savings_pct=energy_savings_pct,
        financial_savings_inr_yr=round(financial_savings_inr, 2),
        co2_reduction_tons_yr=round(co2_reduction_tons, 1),
        water_savings_kiloliters_yr=round(water_savings_kl_yr, 1),
        estimated_capex_inr=round(total_capex, 2),
        payback_period_years=payback_years,
        grid_dependency_reduction_pct=grid_reduction_pct,
        detailed_breakdown={
            "lighting_savings_mwh": round(lighting_savings_mwh, 1),
            "hvac_savings_mwh": round(hvac_savings_mwh, 1),
            "solar_generated_extra_mwh": round(additional_solar_gen_mwh, 1),
            "equipment_savings_mwh": round(equipment_savings_mwh, 1),
            "occupancy_impact_mwh": round(occ_impact_mwh, 1),
            "water_financial_savings_inr": round(water_financial_savings, 2),
            "capex_breakdown": {
                "lighting_led_inr": round(led_capex, 2),
                "hvac_controls_inr": round(hvac_capex, 2),
                "solar_pv_inr": round(solar_capex, 2),
                "equipment_inr": round(equipment_capex, 2),
                "rainwater_inr": round(water_capex, 2)
            }
        },
        data_source=DataSource.PREDICTED
    )
