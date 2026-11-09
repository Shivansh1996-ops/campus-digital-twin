import math
import random
from datetime import datetime, timedelta
from typing import Dict, List, Any
from models import Building, Alert, WastageItem, Recommendation, DataSource, AlertSeverity, AlertStatus
import seed_data

class CampusSimulation:
    def __init__(self):
        self.buildings: List[Building] = seed_data.build_seed_buildings()
        self.assets = seed_data.build_seed_assets()
        self.alerts: List[Alert] = seed_data.build_seed_alerts()
        self.wastage_items: List[WastageItem] = seed_data.build_seed_wastage()
        self.recommendations: List[Recommendation] = seed_data.build_seed_recommendations()
        self.spatial_metrics = seed_data.CAMPUS_SPATIAL_METRICS
        
        # Simulation parameters
        self.simulated_hour: float = 14.5 # 2:30 PM default sunny afternoon
        self.time_multiplier: float = 1.0 # 1.0 = real-time, can be accelerated
        self.is_paused: bool = False
        
        # Water tanks state
        self.overhead_tank_level_pct: float = 78.4
        self.underground_sump_level_pct: float = 91.2
        self.water_pumps_active: bool = True
        
        # Grid parameters
        self.grid_voltage_kv: float = 33.1
        self.grid_frequency_hz: float = 50.02
        self.power_factor: float = 0.97
        
        # Weather
        self.outdoor_temp_c: float = 31.5
        self.outdoor_humidity_pct: float = 54.0
        self.solar_irradiance_wm2: float = 840.0
        self.air_quality_aqi: int = 42

    def set_time(self, hour: float):
        self.simulated_hour = max(0.0, min(24.0, hour))
        self.update_tick(0.0)

    def calculate_solar_factor(self, hour: float) -> float:
        """Calculates normalized solar generation factor (0.0 to 1.0) based on hour of day."""
        if hour < 6.0 or hour > 18.5:
            return 0.0
        # Peak around 12:30 PM
        solar_angle = (hour - 6.0) / 12.5 * math.pi
        base = math.sin(solar_angle)
        # Small random clouds fluctuation +/- 3%
        fluctuation = 1.0 + (random.uniform(-0.03, 0.03))
        return max(0.0, min(1.0, base * fluctuation))

    def calculate_outdoor_temp(self, hour: float) -> float:
        """Calculates outdoor temperature (°C) following diurnal cycle."""
        # Min ~21°C at 05:00, Max ~34°C at 14:30
        rad = (hour - 5.0) / 24.0 * 2 * math.pi
        return 27.5 + 6.5 * math.sin(rad - math.pi / 4)

    def calculate_occupancy_ratio(self, b_type: str, hour: float) -> float:
        """Calculates occupancy percentage based on building type and time."""
        if b_type == "ACADEMIC" or b_type == "RESEARCH":
            if 8.5 <= hour <= 17.5:
                # Bell peak around 11:30 - 15:00
                return 0.75 + 0.15 * math.sin((hour - 8.5) / 9.0 * math.pi)
            elif 17.5 < hour <= 21.5:
                return 0.25 * (1.0 - (hour - 17.5) / 4.0)
            elif 7.0 <= hour < 8.5:
                return 0.15 * (hour - 7.0) / 1.5
            else:
                return 0.03
        elif b_type == "RESIDENTIAL":
            # Hostels: high at night, dip during day
            if 0.0 <= hour <= 7.5 or hour >= 22.0:
                return 0.88 + random.uniform(-0.02, 0.04)
            elif 8.5 <= hour <= 17.0:
                return 0.18 + random.uniform(-0.02, 0.03)
            else:
                return 0.55
        elif b_type == "AMENITY":
            # Dining peaks at meal times
            if 7.5 <= hour <= 9.5:
                return 0.82
            elif 12.0 <= hour <= 14.5:
                return 0.92
            elif 19.0 <= hour <= 21.5:
                return 0.85
            else:
                return 0.15
        elif b_type == "RECREATION":
            # Gym/Sports: morning and evening
            if 6.0 <= hour <= 8.5 or 17.0 <= hour <= 21.0:
                return 0.78
            else:
                return 0.22
        elif b_type == "ADMINISTRATIVE":
            if 9.0 <= hour <= 17.5:
                return 0.85
            else:
                return 0.05
        return 0.30

    def update_tick(self, delta_seconds: float):
        """Advances simulation clock and updates all building and sensor parameters."""
        if not self.is_paused and delta_seconds > 0:
            self.simulated_hour += (delta_seconds * self.time_multiplier) / 3600.0
            if self.simulated_hour >= 24.0:
                self.simulated_hour -= 24.0

        hour = self.simulated_hour
        solar_factor = self.calculate_solar_factor(hour)
        self.outdoor_temp_c = round(self.calculate_outdoor_temp(hour), 1)
        self.solar_irradiance_wm2 = round(solar_factor * 960.0, 1)

        # Update each building
        for b in self.buildings:
            occ_ratio = self.calculate_occupancy_ratio(b.type.value, hour)
            curr_occ = int(b.max_capacity * occ_ratio)
            b.current_occupancy = curr_occ
            b.occupancy_rate_pct = round((curr_occ / b.max_capacity * 100) if b.max_capacity > 0 else 0, 1)

            # Solar generation
            b.current_solar_gen_kw = round(b.solar_capacity_kw * solar_factor * (1.0 - (self.outdoor_temp_c - 25.0) * 0.004), 1)

            # HVAC load depends on outdoor temp and indoor occupancy
            cooling_delta = max(0.0, self.outdoor_temp_c - 24.0)
            hvac_base = (b.total_area_sqm / 1000.0) * 3.5
            hvac_load = (hvac_base + cooling_delta * 4.2 + (curr_occ * 0.08)) * (1.1 if b.id == "b-eng" else 1.0)
            b.hvac_load_kw = round(hvac_load, 1)

            # Lighting load
            natural_daylight = solar_factor > 0.3
            lighting_intensity = 0.4 if natural_daylight else (0.85 if 7.0 <= hour <= 22.0 else 0.12)
            b.lighting_load_kw = round((b.total_area_sqm / 1000.0) * 2.8 * lighting_intensity, 1)

            # Equipment/plug load
            b.equipment_load_kw = round((curr_occ * 0.15) + (b.total_area_sqm / 1000.0) * 1.8, 1)

            # Total power
            b.energy_consumption_kw = round(b.hvac_load_kw + b.lighting_load_kw + b.equipment_load_kw, 1)
            b.carbon_emissions_kg_hr = round(b.energy_consumption_kw * 0.71, 1)

            # Water
            water_base = 2.0
            if b.type.value == "RESIDENTIAL":
                # Morning 6:30-9:00 and evening 18:30-21:00 shower spikes
                shower_spike = 4.5 if (6.5 <= hour <= 9.0 or 18.5 <= hour <= 21.0) else 1.0
                # Anomaly leak on Hostel Alpha adds 120 LPM
                leak = 120.0 if b.id == "b-res-a" else 0.0
                b.water_consumption_lpm = round((curr_occ * 0.25 * shower_spike) + leak + water_base, 1)
            else:
                b.water_consumption_lpm = round((curr_occ * 0.15) + water_base, 1)

        # Update water tank levels
        tot_water_lpm = sum(b.water_consumption_lpm for b in self.buildings)
        if tot_water_lpm > 300:
            self.overhead_tank_level_pct = max(20.0, self.overhead_tank_level_pct - 0.05)
        else:
            self.overhead_tank_level_pct = min(98.0, self.overhead_tank_level_pct + 0.04)

    def get_live_snapshot(self) -> Dict[str, Any]:
        """Returns the high-level live telemetry metrics of the campus."""
        total_power_kw = round(sum(b.energy_consumption_kw for b in self.buildings), 1)
        total_solar_kw = round(sum(b.current_solar_gen_kw for b in self.buildings), 1)
        total_water_lpm = round(sum(b.water_consumption_lpm for b in self.buildings), 1)
        total_occupancy = sum(b.current_occupancy for b in self.buildings)
        total_capacity = sum(b.max_capacity for b in self.buildings)
        total_co2_kg_hr = round(sum(b.carbon_emissions_kg_hr for b in self.buildings), 1)
        
        # Grid draw = total power - solar (can discharge battery if needed)
        grid_power_kw = round(max(0.0, total_power_kw - total_solar_kw), 1)
        solar_coverage_pct = round((total_solar_kw / total_power_kw * 100) if total_power_kw > 0 else 0, 1)
        
        # Format simulated time string
        h = int(self.simulated_hour)
        m = int((self.simulated_hour - h) * 60)
        time_str = f"{h:02d}:{m:02d}"

        # Wastage summary
        wasted_kw = round(sum(w.wasted_quantity_per_hour for w in self.wastage_items if "kWh" in w.unit or "kW" in w.unit), 1)
        wasted_cost_monthly = sum(w.estimated_monthly_cost_inr for w in self.wastage_items)

        health = seed_data.compute_campus_health_score(self.buildings, self.alerts)

        return {
            "timestamp": datetime.now().isoformat(),
            "simulated_time": time_str,
            "simulated_hour": round(self.simulated_hour, 2),
            "is_daylight": self.simulated_hour >= 6.0 and self.simulated_hour <= 18.5,
            "weather": {
                "temperature_c": self.outdoor_temp_c,
                "humidity_pct": self.outdoor_humidity_pct,
                "solar_irradiance_wm2": self.solar_irradiance_wm2,
                "air_quality_aqi": self.air_quality_aqi,
                "condition": "Clear Sky / Sunny" if self.solar_irradiance_wm2 > 400 else "Mild Evening"
            },
            "power": {
                "total_consumption_kw": total_power_kw,
                "total_consumption_mw": round(total_power_kw / 1000.0, 3),
                "grid_draw_kw": grid_power_kw,
                "solar_generation_kw": total_solar_kw,
                "solar_capacity_kw": 4200.0,
                "solar_coverage_pct": solar_coverage_pct,
                "battery_storage_kw": -420.0 if total_solar_kw > total_power_kw else 280.0,
                "battery_soc_pct": 76.5,
                "grid_voltage_kv": self.grid_voltage_kv,
                "grid_frequency_hz": self.grid_frequency_hz,
                "power_factor": self.power_factor,
                "daily_energy_mwh": round(total_power_kw * 12.8 / 1000.0, 2),
                "peak_demand_kw": 3840.0
            },
            "water": {
                "total_flow_lpm": total_water_lpm,
                "total_flow_m3_hr": round(total_water_lpm * 60.0 / 1000.0, 2),
                "overhead_tank_pct": round(self.overhead_tank_level_pct, 1),
                "underground_sump_pct": round(self.underground_sump_level_pct, 1),
                "rainwater_harvested_kl": 240.0,
                "daily_consumption_kl": round(total_water_lpm * 60 * 14 / 1000.0, 1)
            },
            "occupancy": {
                "total_occupancy": total_occupancy,
                "total_capacity": total_capacity,
                "utilization_pct": round((total_occupancy / total_capacity * 100) if total_capacity > 0 else 0, 1),
                "active_buildings_count": len([b for b in self.buildings if b.current_occupancy > 10])
            },
            "environment": {
                "co2_emissions_kg_hr": total_co2_kg_hr,
                "co2_avoided_by_solar_kg_hr": round(total_solar_kw * 0.71, 1),
                "avg_campus_co2_ppm": 448.0,
                "noise_avg_db": 46.2
            },
            "wastage": {
                "active_wastage_sources_count": len(self.wastage_items),
                "avoidable_power_kw": wasted_kw,
                "monthly_cost_impact_inr": wasted_cost_monthly
            },
            "alerts": {
                "total_active": len([a for a in self.alerts if a.status == AlertStatus.ACTIVE]),
                "critical": len([a for a in self.alerts if a.severity == AlertSeverity.CRITICAL and a.status == AlertStatus.ACTIVE]),
                "high": len([a for a in self.alerts if a.severity == AlertSeverity.HIGH and a.status == AlertStatus.ACTIVE]),
                "medium": len([a for a in self.alerts if a.severity == AlertSeverity.MEDIUM and a.status == AlertStatus.ACTIVE]),
                "low": len([a for a in self.alerts if a.severity == AlertSeverity.LOW and a.status == AlertStatus.ACTIVE])
            },
            "health_score": health.dict(),
            "data_source": DataSource.SIMULATED.value
        }

    def get_24h_history(self) -> List[Dict[str, Any]]:
        """Generates hourly 24h curve for telemetry charts."""
        history = []
        for h in range(24):
            hour_float = float(h)
            solar_fac = self.calculate_solar_factor(hour_float)
            temp = self.calculate_outdoor_temp(hour_float)
            
            # Aggregate building loads for that hour
            power_sum = 0.0
            solar_sum = 0.0
            water_sum = 0.0
            occ_sum = 0.0
            
            for b in self.buildings:
                occ_r = self.calculate_occupancy_ratio(b.type.value, hour_float)
                curr_occ = b.max_capacity * occ_r
                occ_sum += curr_occ
                
                # Solar
                solar_sum += b.solar_capacity_kw * solar_fac
                
                # HVAC + Lighting + Equipment
                cool_delta = max(0.0, temp - 24.0)
                hvac = (b.total_area_sqm / 1000.0) * 3.5 + cool_delta * 4.2 + (curr_occ * 0.08)
                light = (b.total_area_sqm / 1000.0) * 2.8 * (0.4 if solar_fac > 0.3 else (0.85 if 7 <= h <= 22 else 0.12))
                equip = curr_occ * 0.15 + (b.total_area_sqm / 1000.0) * 1.8
                power_sum += (hvac + light + equip)
                
                # Water
                water_base = 2.0
                if b.type.value == "RESIDENTIAL":
                    spike = 4.0 if (6 <= h <= 9 or 19 <= h <= 21) else 1.0
                    leak = 120.0 if b.id == "b-res-a" else 0.0
                    water_sum += (curr_occ * 0.25 * spike) + leak + water_base
                else:
                    water_sum += (curr_occ * 0.15) + water_base

            history.append({
                "hour": h,
                "time_label": f"{h:02d}:00",
                "power_kw": round(power_sum, 1),
                "grid_draw_kw": round(max(0.0, power_sum - solar_sum), 1),
                "solar_gen_kw": round(solar_sum, 1),
                "water_lpm": round(water_sum, 1),
                "occupancy": int(occ_sum),
                "temperature_c": round(temp, 1),
                "co2_emissions_kg": round(power_sum * 0.71, 1)
            })
        return history

    def get_energy_flow_graph(self) -> Dict[str, Any]:
        """Provides node-link energy flow topology from 33kV Grid down to Building Loads."""
        snap = self.get_live_snapshot()
        total_p = snap["power"]["total_consumption_kw"]
        solar_p = snap["power"]["solar_generation_kw"]
        grid_p = snap["power"]["grid_draw_kw"]

        nodes = [
            {"id": "grid", "label": "National Grid 33kV", "category": "SOURCE", "value": grid_p, "color": "#f59e0b"},
            {"id": "solar", "label": "Campus Solar PV (4.2 MWp)", "category": "SOURCE", "value": solar_p, "color": "#10b981"},
            {"id": "substation", "label": "Main Substation & Switchyard", "category": "DISTRIBUTION", "value": total_p, "color": "#38bdf8"},
            {"id": "bess", "label": "BESS Battery Storage (2MWh)", "category": "STORAGE", "value": 420.0, "color": "#8b5cf6"},
        ]

        # Add top building nodes
        for b in self.buildings:
            nodes.append({
                "id": f"flow-{b.id}",
                "label": b.name,
                "category": "BUILDING",
                "value": b.energy_consumption_kw,
                "color": b.color_hex
            })

        # Add end-use categories
        hvac_tot = sum(b.hvac_load_kw for b in self.buildings)
        light_tot = sum(b.lighting_load_kw for b in self.buildings)
        equip_tot = sum(b.equipment_load_kw for b in self.buildings)

        nodes.extend([
            {"id": "load-hvac", "label": "HVAC & Thermal", "category": "LOAD", "value": round(hvac_tot, 1), "color": "#06b6d4"},
            {"id": "load-lighting", "label": "Lighting & Façade", "category": "LOAD", "value": round(light_tot, 1), "color": "#eab308"},
            {"id": "load-equip", "label": "Lab & Computing Loads", "category": "LOAD", "value": round(equip_tot, 1), "color": "#ec4899"}
        ])

        links = [
            {"source": "grid", "target": "substation", "value": grid_p},
            {"source": "solar", "target": "substation", "value": max(0.0, solar_p - 420.0)},
            {"source": "solar", "target": "bess", "value": 420.0 if solar_p > 1000 else 0.0},
        ]

        for b in self.buildings:
            links.append({"source": "substation", "target": f"flow-{b.id}", "value": b.energy_consumption_kw})
            links.append({"source": f"flow-{b.id}", "target": "load-hvac", "value": b.hvac_load_kw})
            links.append({"source": f"flow-{b.id}", "target": "load-lighting", "value": b.lighting_load_kw})
            links.append({"source": f"flow-{b.id}", "target": "load-equip", "value": b.equipment_load_kw})

        return {"nodes": nodes, "links": links}

# Global singleton
simulation_instance = CampusSimulation()
