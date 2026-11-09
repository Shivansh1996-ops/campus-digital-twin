from models import (
    Building, Floor, Room, Asset, Sensor, Alert, WastageItem, Recommendation,
    CampusSpatialMetrics, CampusHealthScore, BuildingType, AssetCategory,
    AlertSeverity, AlertStatus, DataSource
)
from typing import List, Dict, Tuple
from datetime import datetime

# --- MLRIT HYDERABAD SPATIAL METRICS ---
# Marri Laxman Reddy Institute of Technology, Dundigal, Hyderabad
CAMPUS_SPATIAL_METRICS = CampusSpatialMetrics(
    total_area_sqm=101171.0, # ~25 Acres campus in Dundigal
    total_area_sqft=1089000.0,
    total_area_hectares=10.12,
    total_area_acres=25.0,
    built_up_area_sqm=65000.0,
    green_area_sqm=42000.0,
    parking_area_sqm=12000.0,
    road_pathway_area_sqm=18000.0,
    roof_area_sqm=22000.0,
    solar_panel_area_sqm=8500.0,
    water_body_area_sqm=4200.0,
    total_buildings_count=10,
    total_floors_count=42,
    total_rooms_count=320,
    total_assets_count=185,
    total_sensors_count=512,
    data_source=DataSource.REAL
)

def generate_rooms(building_id: str, floor_id: str, floor_num: int, b_type: BuildingType) -> List[Room]:
    rooms: List[Room] = []
    room_types_map = {
        BuildingType.ACADEMIC: ["Aero CAD Lab", "AI & ML Center", "Smart Classroom", "Faculty Cabin", "Robotics & Drone Bay", "Seminar Hall", "Restroom"],
        BuildingType.RESEARCH: ["Flight Simulator Lab", "Wind Tunnel Testing Bay", "Aerospace Prototyping", "Avionics Cleanroom", "Restroom"],
        BuildingType.ADMINISTRATIVE: ["Principal Office", "Director Secretariat", "Examination Cell", "Dean Academics", "T&P Cell", "Restroom"],
        BuildingType.RESIDENTIAL: ["Student Room", "Deluxe Quad", "Recreation Lounge", "Study Room", "Laundry Station", "Restroom"],
        BuildingType.RECREATION: ["Indoor Badminton Court", "Gymnasium", "Sports Office", "Locker Room", "Restroom"],
        BuildingType.UTILITY: ["TSSPDCL HT Switchgear", "11kV Transformer Bay", "UPS & Battery Room", "Borewell Pump Control"],
        BuildingType.AMENITY: ["Main Canteen", "Juice & Snacks Lounge", "Student Activity Center", "Health Center", "Restroom"]
    }
    
    types = room_types_map.get(b_type, ["Classroom", "Faculty Room", "Restroom"])
    count = 6
    for i in range(1, count + 1):
        rtype = types[(i - 1) % len(types)]
        code = f"{building_id.split('-')[1].upper()}-{floor_num}{i:02d}"
        r_id = f"r-{building_id}-{floor_num}-{i}"
        
        # Room 204 in CSE Block has AC on with 0 occupancy
        is_wastage_room = (building_id == "b-cse" and floor_num == 2 and i == 4)
        
        cap = 60 if "Classroom" in rtype or "Hall" in rtype else (35 if "Lab" in rtype else 12)
        curr_occ = 0 if is_wastage_room else int(cap * 0.70)
        
        rooms.append(Room(
            id=r_id,
            name=f"{rtype} {floor_num}{i:02d}",
            code=code,
            floor_id=floor_id,
            building_id=building_id,
            type=rtype.lower().replace(" ", "_"),
            area_sqm=110.0 if "Hall" in rtype or "Classroom" in rtype else (85.0 if "Lab" in rtype else 40.0),
            capacity=cap,
            current_occupancy=curr_occ,
            energy_kw=5.8 if is_wastage_room else (3.6 if curr_occ > 0 else 0.3),
            hvac_temp_c=20.5 if is_wastage_room else 23.5,
            hvac_setpoint_c=20.0 if is_wastage_room else 24.0,
            hvac_status="active" if (curr_occ > 0 or is_wastage_room) else "standby",
            lighting_status="on" if (curr_occ > 0 or is_wastage_room) else "off",
            co2_ppm=410.0 if curr_occ == 0 else (640.0 + curr_occ * 6.5),
            light_lux=500.0 if (curr_occ > 0 or is_wastage_room) else 20.0,
            noise_db=30.0 if curr_occ == 0 else 52.0,
            assets_count=4,
            data_source=DataSource.SIMULATED
        ))
    return rooms

def generate_floors(building_id: str, floors_count: int, b_type: BuildingType, total_area: float) -> List[Floor]:
    floors: List[Floor] = []
    floor_area = round(total_area / floors_count, 1)
    
    for f in range(floors_count):
        floor_id = f"fl-{building_id}-{f}"
        name = "Ground Floor" if f == 0 else f"Level {f}"
        rooms = generate_rooms(building_id, floor_id, f, b_type)
        occ = sum(r.current_occupancy for r in rooms)
        cap = sum(r.capacity for r in rooms)
        ekw = sum(r.energy_kw for r in rooms)
        
        floors.append(Floor(
            id=floor_id,
            building_id=building_id,
            floor_number=f,
            name=name,
            area_sqm=floor_area,
            rooms_count=len(rooms),
            current_occupancy=occ,
            max_capacity=cap,
            energy_kw=round(ekw, 2),
            hvac_load_kw=round(ekw * 0.50, 2),
            lighting_kw=round(ekw * 0.30, 2),
            plug_load_kw=round(ekw * 0.20, 2),
            water_flow_lpm=round(occ * 0.16 + 2.0, 1),
            average_temp_c=round(sum(r.hvac_temp_c for r in rooms) / len(rooms), 1),
            rooms=rooms,
            data_source=DataSource.SIMULATED
        ))
    return floors

# MLRIT Hyderabad 10 Major Campus Buildings
RAW_BUILDINGS = [
    {
        "id": "b-adm",
        "name": "MLRIT Administrative & Central Academic Block",
        "code": "MLRIT-ADMIN",
        "type": BuildingType.ADMINISTRATIVE,
        "year": 2005,
        "floors": 4,
        "area": 14000.0,
        "footprint": 3500.0,
        "solar_kw": 180.0,
        "solar_area": 1200.0,
        "pos": {"x": 0.0, "y": 0.0, "z": -85.0},
        "dim": {"width": 65.0, "height": 18.0, "depth": 42.0},
        "color": "#38bdf8",
        "hours": "08:30 - 17:30",
        "efficiency": 86
    },
    {
        "id": "b-aero",
        "name": "Aeronautical & Aerospace Engineering Block",
        "code": "MLRIT-AERO",
        "type": BuildingType.RESEARCH,
        "year": 2009,
        "floors": 5,
        "area": 18000.0,
        "footprint": 3600.0,
        "solar_kw": 240.0,
        "solar_area": 1600.0,
        "pos": {"x": -70.0, "y": 0.0, "z": -40.0},
        "dim": {"width": 55.0, "height": 22.0, "depth": 48.0},
        "color": "#0284c7",
        "hours": "08:30 - 18:30 (Labs 24/7)",
        "efficiency": 84
    },
    {
        "id": "b-cse",
        "name": "Computer Science & IT Innovation Tower (CIET)",
        "code": "MLRIT-CSE-IT",
        "type": BuildingType.ACADEMIC,
        "year": 2014,
        "floors": 6,
        "area": 24000.0,
        "footprint": 4000.0,
        "solar_kw": 320.0,
        "solar_area": 2200.0,
        "pos": {"x": 65.0, "y": 0.0, "z": -40.0},
        "dim": {"width": 60.0, "height": 26.0, "depth": 52.0},
        "color": "#8b5cf6",
        "hours": "08:00 - 20:00",
        "efficiency": 81
    },
    {
        "id": "b-ece-mech",
        "name": "ECE, EEE & Mechanical Engineering Complex",
        "code": "MLRIT-ECE-MECH",
        "type": BuildingType.ACADEMIC,
        "year": 2007,
        "floors": 5,
        "area": 20000.0,
        "footprint": 4000.0,
        "solar_kw": 260.0,
        "solar_area": 1800.0,
        "pos": {"x": -75.0, "y": 0.0, "z": 35.0},
        "dim": {"width": 58.0, "height": 22.0, "depth": 50.0},
        "color": "#06b6d4",
        "hours": "08:30 - 18:00",
        "efficiency": 83
    },
    {
        "id": "b-lib",
        "name": "Central Library & Digital Knowledge Hub",
        "code": "MLRIT-LIB",
        "type": BuildingType.ACADEMIC,
        "year": 2011,
        "floors": 3,
        "area": 12000.0,
        "footprint": 4000.0,
        "solar_kw": 160.0,
        "solar_area": 1100.0,
        "pos": {"x": 0.0, "y": 0.0, "z": 20.0},
        "dim": {"width": 48.0, "height": 14.0, "depth": 45.0},
        "color": "#34d399",
        "hours": "08:00 - 21:00",
        "efficiency": 89
    },
    {
        "id": "b-aud",
        "name": "Marri Laxman Reddy Auditorium & Convention Center",
        "code": "MLRIT-AUD",
        "type": BuildingType.AMENITY,
        "year": 2016,
        "floors": 3,
        "area": 15000.0,
        "footprint": 5000.0,
        "solar_kw": 210.0,
        "solar_area": 1400.0,
        "pos": {"x": 75.0, "y": 0.0, "z": 40.0},
        "dim": {"width": 62.0, "height": 16.0, "depth": 45.0},
        "color": "#f59e0b",
        "hours": "Event Driven (Capacity: 2,000)",
        "efficiency": 78
    },
    {
        "id": "b-hst-b",
        "name": "MLRIT Boys Residential Block (Marri Nilayam)",
        "code": "MLRIT-BHST",
        "type": BuildingType.RESIDENTIAL,
        "year": 2010,
        "floors": 6,
        "area": 22000.0,
        "footprint": 3600.0,
        "solar_kw": 280.0,
        "solar_area": 1900.0,
        "pos": {"x": -135.0, "y": 0.0, "z": -15.0},
        "dim": {"width": 45.0, "height": 26.0, "depth": 65.0},
        "color": "#64748b",
        "hours": "24/7 Residential",
        "efficiency": 72
    },
    {
        "id": "b-hst-g",
        "name": "MLRIT Girls Residential Block (Parijatha Nilayam)",
        "code": "MLRIT-GHST",
        "type": BuildingType.RESIDENTIAL,
        "year": 2012,
        "floors": 6,
        "area": 20000.0,
        "footprint": 3300.0,
        "solar_kw": 250.0,
        "solar_area": 1700.0,
        "pos": {"x": -135.0, "y": 0.0, "z": 75.0},
        "dim": {"width": 45.0, "height": 26.0, "depth": 60.0},
        "color": "#ec4899",
        "hours": "24/7 Residential",
        "efficiency": 85
    },
    {
        "id": "b-spr",
        "name": "MLR Sports Complex & Indoor Stadium",
        "code": "MLRIT-SPORTS",
        "type": BuildingType.RECREATION,
        "year": 2015,
        "floors": 2,
        "area": 18000.0,
        "footprint": 9000.0,
        "solar_kw": 220.0,
        "solar_area": 1500.0,
        "pos": {"x": 135.0, "y": 0.0, "z": 90.0},
        "dim": {"width": 70.0, "height": 14.0, "depth": 75.0},
        "color": "#10b981",
        "hours": "05:30 - 21:30",
        "efficiency": 87
    },
    {
        "id": "b-sub",
        "name": "MLRIT Electrical Substation & Solar Control Center",
        "code": "MLRIT-SUB-33KV",
        "type": BuildingType.UTILITY,
        "year": 2006,
        "floors": 2,
        "area": 8000.0,
        "footprint": 4000.0,
        "solar_kw": 380.0,
        "solar_area": 2500.0,
        "pos": {"x": 135.0, "y": 0.0, "z": -70.0},
        "dim": {"width": 50.0, "height": 12.0, "depth": 45.0},
        "color": "#ef4444",
        "hours": "24/7 Monitored",
        "efficiency": 92
    }
]

def build_seed_buildings() -> List[Building]:
    buildings: List[Building] = []
    for b in RAW_BUILDINGS:
        floors = generate_floors(b["id"], b["floors"], b["type"], b["area"])
        tot_occ = sum(f.current_occupancy for f in floors)
        tot_cap = sum(f.max_capacity for f in floors)
        tot_ekw = sum(f.energy_kw for f in floors)
        tot_water = sum(f.water_flow_lpm for f in floors)
        tot_hvac = sum(f.hvac_load_kw for f in floors)
        tot_light = sum(f.lighting_kw for f in floors)
        tot_plug = sum(f.plug_load_kw for f in floors)
        
        buildings.append(Building(
            id=b["id"],
            name=b["name"],
            code=b["code"],
            type=b["type"],
            construction_year=b["year"],
            floors_count=b["floors"],
            total_area_sqm=b["area"],
            footprint_area_sqm=b["footprint"],
            roof_area_sqm=b["footprint"],
            solar_area_sqm=b["solar_area"],
            solar_capacity_kw=b["solar_kw"],
            current_solar_gen_kw=round(b["solar_kw"] * 0.75, 1), # Hyderabad sunny afternoon
            classroom_count=16 if b["type"] == BuildingType.ACADEMIC else 6,
            lab_count=12 if b["type"] in [BuildingType.ACADEMIC, BuildingType.RESEARCH] else 2,
            office_count=20 if b["type"] == BuildingType.ADMINISTRATIVE else 10,
            washroom_count=b["floors"] * 2,
            max_capacity=tot_cap,
            current_occupancy=tot_occ,
            occupancy_rate_pct=round((tot_occ / tot_cap * 100) if tot_cap > 0 else 0, 1),
            energy_consumption_kw=round(tot_ekw, 1),
            daily_energy_kwh=round(tot_ekw * 13.5, 1),
            energy_efficiency_score=b["efficiency"],
            water_consumption_lpm=round(tot_water, 1),
            daily_water_liters=round(tot_water * 60 * 12, 1),
            hvac_load_kw=round(tot_hvac, 1),
            lighting_load_kw=round(tot_light, 1),
            equipment_load_kw=round(tot_plug, 1),
            carbon_emissions_kg_hr=round(tot_ekw * 0.72, 1),
            operating_hours=b["hours"],
            maintenance_status="CRITICAL" if b["id"] == "b-hst-b" else ("ATTENTION" if b["id"] == "b-cse" else "OPTIMAL"),
            asset_count=16,
            position_3d=b["pos"],
            dimensions_3d=b["dim"],
            color_hex=b["color"],
            data_source=DataSource.SIMULATED,
            floors=floors
        ))
    return buildings

# Assets for MLRIT Hyderabad
def build_seed_assets() -> List[Asset]:
    return [
        Asset(
            id="ast-tr-01",
            name="MLRIT Main Step-Down Transformer TR-01 (11kV/415V 1250kVA)",
            category=AssetCategory.ELECTRICAL,
            type="Transformer",
            building_id="b-sub",
            location_description="Dundigal 33kV Yard Feed Bay 1",
            position_3d={"x": 130.0, "y": 2.0, "z": -75.0},
            status="NORMAL",
            health_score=95,
            installation_year=2015,
            last_service_date="2026-08-10",
            next_service_date="2027-02-10",
            power_kw=680.0,
            runtime_hours=72400.0,
            metrics={"load_pct": 54.4, "oil_temp_c": 54.2, "winding_temp_c": 62.1, "power_factor": 0.98},
            data_source=DataSource.SIMULATED
        ),
        Asset(
            id="ast-tr-02",
            name="MLRIT Secondary Feeder Transformer TR-02 (1250kVA)",
            category=AssetCategory.ELECTRICAL,
            type="Transformer",
            building_id="b-sub",
            location_description="Dundigal 33kV Yard Feed Bay 2",
            position_3d={"x": 145.0, "y": 2.0, "z": -75.0},
            status="WARNING",
            health_score=71,
            installation_year=2015,
            last_service_date="2026-04-12",
            next_service_date="2026-10-12",
            power_kw=790.0,
            runtime_hours=71800.0,
            metrics={"load_pct": 79.2, "oil_temp_c": 75.4, "winding_temp_c": 87.1, "power_factor": 0.91, "harmonic_thd_pct": 6.1},
            data_source=DataSource.SIMULATED
        ),
        Asset(
            id="ast-aero-wind",
            name="Aeronautical Department Subsonic Wind Tunnel Facility (1.2m x 1.2m)",
            category=AssetCategory.MECHANICAL,
            type="Aerodynamic Tunnel",
            building_id="b-aero",
            location_description="Ground Floor Propulsion & Aero Testing Bay",
            position_3d={"x": -70.0, "y": 3.0, "z": -40.0},
            status="NORMAL",
            health_score=96,
            installation_year=2018,
            last_service_date="2026-07-15",
            next_service_date="2027-01-15",
            power_kw=110.0,
            runtime_hours=8450.0,
            metrics={"airspeed_mps": 45.0, "test_section_temp_c": 26.2, "fan_rpm": 1420},
            data_source=DataSource.SIMULATED
        ),
        Asset(
            id="ast-sol-cse",
            name="MLRIT CIET Tower Rooftop Solar PV System (320 kWp)",
            category=AssetCategory.RENEWABLE,
            type="Solar Inverter Array",
            building_id="b-cse",
            location_description="CIET Innovation Tower Rooftop",
            position_3d={"x": 65.0, "y": 27.0, "z": -40.0},
            status="NORMAL",
            health_score=97,
            installation_year=2021,
            last_service_date="2026-09-01",
            next_service_date="2027-03-01",
            power_kw=242.0,
            runtime_hours=21500.0,
            metrics={"capacity_kw": 320.0, "efficiency_pct": 20.1, "panel_temp_c": 43.5, "daily_gen_kwh": 1640.0},
            data_source=DataSource.SIMULATED
        ),
        Asset(
            id="ast-pmp-bhst",
            name="Marri Nilayam Boys Hostel Hydro-Pneumatic Booster Pump",
            category=AssetCategory.PLUMBING,
            type="Water Pump",
            building_id="b-hst-b",
            location_description="Hostel Basement Sump Station",
            position_3d={"x": -135.0, "y": 1.0, "z": -15.0},
            status="FAULT",
            health_score=46,
            installation_year=2016,
            last_service_date="2025-10-10",
            next_service_date="2026-04-10",
            power_kw=15.0,
            runtime_hours=58200.0,
            metrics={"pressure_bar": 3.1, "flow_rate_lpm": 138.0, "vibration_mms": 7.6, "continuous_leak_alert": True},
            data_source=DataSource.SIMULATED
        ),
        Asset(
            id="ast-drone-lab",
            name="Centre for Drone Technology & Avionics Telemetry Base",
            category=AssetCategory.IT,
            type="Drone Ground Station",
            building_id="b-aero",
            location_description="Level 4 Flight Control Room",
            position_3d={"x": -70.0, "y": 18.0, "z": -40.0},
            status="NORMAL",
            health_score=99,
            installation_year=2023,
            last_service_date="2026-08-05",
            next_service_date="2027-02-05",
            power_kw=2.4,
            runtime_hours=6200.0,
            metrics={"active_drones": 3, "telemetry_freq_ghz": 5.8, "gps_rtk_accuracy_cm": 1.2},
            data_source=DataSource.SIMULATED
        )
    ]

# MLRIT Hyderabad Alerts
def build_seed_alerts() -> List[Alert]:
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    return [
        Alert(
            id="alt-001",
            title="MLRIT Dundigal Substation Transformer TR-02 Overload Warning",
            severity=AlertSeverity.CRITICAL,
            status=AlertStatus.ACTIVE,
            building_id="b-sub",
            building_name="MLRIT Electrical Substation & Solar Control Center",
            asset_id="ast-tr-02",
            asset_name="MLRIT Secondary Feeder Transformer TR-02",
            position_3d={"x": 145.0, "y": 4.0, "z": -75.0},
            message="Winding temperature reached 87.1°C (TSSPDCL safety threshold: 80.0°C). Harmonics THD at 6.1% due to heavy lab non-linear loads.",
            timestamp=now_str,
            metric_type="temperature",
            current_value=87.1,
            threshold_value=80.0,
            unit="°C",
            estimated_impact="High risk of thermal trip interrupting power to CSE CIET Tower and Aeronautical Blocks.",
            recommended_action="Execute bus-tie load transfer to Transformer TR-01; trigger automated radiator cooling fans.",
            data_source=DataSource.SIMULATED
        ),
        Alert(
            id="alt-002",
            title="Continuous Water Leakage in Marri Nilayam Boys Hostel Riser",
            severity=AlertSeverity.HIGH,
            status=AlertStatus.ACTIVE,
            building_id="b-hst-b",
            building_name="MLRIT Boys Residential Block (Marri Nilayam)",
            asset_id="ast-pmp-bhst",
            asset_name="Marri Nilayam Boys Hostel Hydro-Pneumatic Booster Pump",
            position_3d={"x": -135.0, "y": 2.0, "z": -15.0},
            message="Overnight water flow detected at 138 LPM between 02:00 and 05:00 AM with zero student activity. Overhead tank draining rapidly.",
            timestamp=now_str,
            metric_type="water_flow",
            current_value=138.0,
            threshold_value=20.0,
            unit="L/min",
            estimated_impact="Wasting ~8,280 Liters of borewell treated water per hour (~₹3,900 / day).",
            recommended_action="Dispatch MLRIT estate maintenance plumber to inspect 2nd floor wing B flush valves.",
            data_source=DataSource.SIMULATED
        ),
        Alert(
            id="alt-003",
            title="CIET CSE Tower Room 204 AI Lab HVAC Energized with 0 Occupancy",
            severity=AlertSeverity.MEDIUM,
            status=AlertStatus.ACTIVE,
            building_id="b-cse",
            building_name="Computer Science & IT Innovation Tower (CIET)",
            asset_id=None,
            asset_name="CIET Room 204 AI Lab",
            position_3d={"x": 65.0, "y": 12.0, "z": -40.0},
            message="Split AC units set to 20.0°C and 500 Lux luminaires running for 3.5 hours with zero detected PIR presence.",
            timestamp=now_str,
            metric_type="energy_wastage",
            current_value=5.8,
            threshold_value=0.4,
            unit="kW",
            estimated_impact="Consuming 19.2 kWh of avoidable electricity daily (~₹5,180 / month TSSPDCL tariff).",
            recommended_action="Activate IoT smart setback via BMS relay: turn off lights and set AC to 26°C.",
            data_source=DataSource.SIMULATED
        ),
        Alert(
            id="alt-004",
            title="Wind Tunnel Testing Bay Vibration Spike During High-Speed Aerofoil Test",
            severity=AlertSeverity.LOW,
            status=AlertStatus.ACKNOWLEDGED,
            building_id="b-aero",
            building_name="Aeronautical & Aerospace Engineering Block",
            asset_id="ast-aero-wind",
            asset_name="Subsonic Wind Tunnel Facility",
            position_3d={"x": -70.0, "y": 3.0, "z": -40.0},
            message="Minor fan drive balancing deviation detected at 1420 RPM. Within permissible ISO 10816 limits.",
            timestamp=now_str,
            metric_type="vibration",
            current_value=3.8,
            threshold_value=4.5,
            unit="mm/s",
            estimated_impact="No immediate threat; routine calibration needed.",
            recommended_action="Inspect dynamic fan balancing weights during semester break maintenance.",
            data_source=DataSource.SIMULATED
        )
    ]

# Wastage Items for MLRIT
def build_seed_wastage() -> List[WastageItem]:
    return [
        WastageItem(
            id="wst-01",
            building_id="b-cse",
            building_name="Computer Science & IT Innovation Tower (CIET)",
            location="Floor 2, Room 204 (AI & ML Lab)",
            category="HVAC & LIGHTING",
            description="High-capacity precision split AC running at 20°C and lighting active while lab is vacant.",
            wasted_quantity_per_hour=5.5,
            unit="kWh/hr",
            estimated_monthly_kwh=1320.0,
            estimated_monthly_cost_inr=11880.0,
            estimated_monthly_co2_kg=950.4,
            primary_cause="Lab assistant manual override left active during lunch recess.",
            recommended_action="Deploy automated 15-minute inactivity PIR sensor auto-cutoff.",
            priority="HIGH",
            data_source=DataSource.ESTIMATED
        ),
        WastageItem(
            id="wst-02",
            building_id="b-hst-b",
            building_name="MLRIT Boys Residential Block (Marri Nilayam)",
            location="Basement & Wing B Secondary Riser",
            category="WATER",
            description="Continuous overnight leak from faulty toilet float valves and fractured underground PVC junction.",
            wasted_quantity_per_hour=8280.0,
            unit="Liters/hr",
            estimated_monthly_kwh=310.0,
            estimated_monthly_cost_inr=48500.0,
            estimated_monthly_co2_kg=223.2,
            primary_cause="Degraded rubber diaphragm on high-pressure float valve.",
            recommended_action="Install digital ultrasonic level sensor with auto shutoff solenoid valve.",
            priority="CRITICAL",
            data_source=DataSource.ESTIMATED
        ),
        WastageItem(
            id="wst-03",
            building_id="b-aud",
            building_name="Marri Laxman Reddy Auditorium",
            location="Main Hall Stage & Perimeter Rigs",
            category="STANDBY POWER",
            description="Stage spotlights, audio mixer banks, and peripheral amplifiers idling on standby power 24/7.",
            wasted_quantity_per_hour=4.2,
            unit="kWh/hr",
            estimated_monthly_kwh=1008.0,
            estimated_monthly_cost_inr=9072.0,
            estimated_monthly_co2_kg=725.7,
            primary_cause="Lack of centralized master power disconnect switch for AV racks.",
            recommended_action="Install automated master relay contactor linked to event calendar.",
            priority="MEDIUM",
            data_source=DataSource.ESTIMATED
        )
    ]

# Recommendations for MLRIT
def build_seed_recommendations() -> List[Recommendation]:
    return [
        Recommendation(
            id="rec-01",
            title="Expand Rooftop Solar PV by 500 kWp Across Aeronautical & Sports Complexes",
            category="SOLAR",
            building_id="b-aero",
            building_name="Aeronautical & Sports Complex Roofs",
            problem="MLRIT Dundigal receives over 5.5 kWh/m²/day of solar insolation with 3,100 m² unutilized shadow-free roof slab.",
            evidence="Annual campus grid purchase from TSSPDCL is ~1,850 MWh at ₹9.0/kWh commercial educational tariff.",
            recommended_action="Install 500 kWp Tier-1 TOPCon bifacial modules on elevated 12° south-facing mounting structures.",
            expected_energy_savings_kwh_yr=750000.0,
            expected_financial_savings_inr_yr=6750000.0,
            expected_co2_reduction_tons_yr=540.0,
            implementation_difficulty="MEDIUM",
            payback_period_months=32,
            priority="CRITICAL",
            confidence_score=95,
            data_source=DataSource.PREDICTED
        ),
        Recommendation(
            id="rec-02",
            title="Deploy Smart Occupancy-Based AC Setback in CIET CSE & Aero CAD Labs",
            category="HVAC",
            building_id="b-cse",
            building_name="CIET Tower & Aero Labs",
            problem="Split AC units operate at static 20°C throughout 10-hour college working day regardless of class schedules.",
            evidence="IoT telemetry identifies 31% of lab cooling energy occurs during 0-20% occupancy periods.",
            recommended_action="Install smart WiFi thermostats programmed with dynamic setback: 24.5°C during occupancy, 28°C standby.",
            expected_energy_savings_kwh_yr=88000.0,
            expected_financial_savings_inr_yr=792000.0,
            expected_co2_reduction_tons_yr=63.3,
            implementation_difficulty="LOW",
            payback_period_months=4,
            priority="HIGH",
            confidence_score=93,
            data_source=DataSource.PREDICTED
        ),
        Recommendation(
            id="rec-03",
            title="Install Rainwater Harvesting Percolation Pits along MLRIT Cricket Ground Perimeter",
            category="WATER",
            building_id="b-spr",
            building_name="MLR Sports Ground & Stadium",
            problem="Monsoon runoff from the 15-acre sports ground and auditorium drains out toward Dundigal village catchment.",
            evidence="Campus draws 80,000 Liters/day from 4 deep borewells, with groundwater table dropping by 1.8m annually.",
            recommended_action="Construct 4 interconnected recharge shafts with silt-trap chambers along the athletic boundary.",
            expected_energy_savings_kwh_yr=32000.0, # reduced pumping head
            expected_financial_savings_inr_yr=620000.0,
            expected_co2_reduction_tons_yr=23.0,
            implementation_difficulty="LOW",
            payback_period_months=14,
            priority="HIGH",
            confidence_score=91,
            data_source=DataSource.PREDICTED
        )
    ]

# Campus Health Score for MLRIT
def compute_campus_health_score(buildings: List[Building], alerts: List[Alert]) -> CampusHealthScore:
    crit_count = sum(1 for a in alerts if a.severity == AlertSeverity.CRITICAL and a.status == AlertStatus.ACTIVE)
    avg_eff = sum(b.energy_efficiency_score for b in buildings) / len(buildings)
    
    energy_score = int(avg_eff)
    water_score = 76 # impacted by boys hostel leak
    infra_score = 82 - (crit_count * 10)
    occ_score = 89
    env_score = 94
    sust_score = 86
    maint_score = 80
    safety_score = 95
    
    overall = int((energy_score * 0.20) + (water_score * 0.15) + (infra_score * 0.15) + 
                  (occ_score * 0.10) + (env_score * 0.10) + (sust_score * 0.15) + 
                  (maint_score * 0.10) + (safety_score * 0.05))
    
    explanations = [
        f"MLRIT Energy Efficiency rated at {energy_score}%: Rooftop solar generation across CIET, Aero, and Admin blocks covers 48% of daytime load.",
        f"Water Efficiency currently at {water_score}%: Active water leak in Marri Nilayam Boys Hostel reduces score by 12 points.",
        f"Infrastructure Health rated at {infra_score}%: Dundigal 33kV Substation Transformer TR-02 thermal overload requires load rebalancing.",
        f"Aeronautical & Drone Prototyping labs operate at 96% optimal health with zero sensor latency.",
        f"Dundigal Campus Air Quality averages 42 AQI (Clean Green Zone) due to expansive green landscaping and cricket grounds."
    ]
    
    grade = "A" if overall >= 85 else ("B+" if overall >= 75 else "B")
    status = "OPTIMAL" if overall >= 85 else ("ATTENTION" if overall >= 70 else "CRITICAL")
    
    return CampusHealthScore(
        overall_score=overall,
        grade=grade,
        status=status,
        energy_efficiency=energy_score,
        water_efficiency=water_score,
        infrastructure_health=infra_score,
        occupancy_efficiency=occ_score,
        environmental_quality=env_score,
        sustainability=sust_score,
        maintenance=maint_score,
        safety=safety_score,
        explanation=explanations,
        data_source=DataSource.ESTIMATED
    )
