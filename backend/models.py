from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any
from enum import Enum
from datetime import datetime

class DataSource(str, Enum):
    REAL = "REAL"
    SIMULATED = "SIMULATED"
    ESTIMATED = "ESTIMATED"
    PREDICTED = "PREDICTED"

class AlertSeverity(str, Enum):
    CRITICAL = "CRITICAL"
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"

class AlertStatus(str, Enum):
    ACTIVE = "ACTIVE"
    ACKNOWLEDGED = "ACKNOWLEDGED"
    RESOLVED = "RESOLVED"

class BuildingType(str, Enum):
    ACADEMIC = "ACADEMIC"
    RESEARCH = "RESEARCH"
    ADMINISTRATIVE = "ADMINISTRATIVE"
    RESIDENTIAL = "RESIDENTIAL"
    RECREATION = "RECREATION"
    UTILITY = "UTILITY"
    AMENITY = "AMENITY"

class AssetCategory(str, Enum):
    ELECTRICAL = "ELECTRICAL"
    MECHANICAL = "MECHANICAL"
    IT = "IT"
    SECURITY = "SECURITY"
    PLUMBING = "PLUMBING"
    RENEWABLE = "RENEWABLE"

# --- SPATIAL & INFRASTRUCTURE MODELS ---

class Room(BaseModel):
    id: str
    name: str
    code: str
    floor_id: str
    building_id: str
    type: str # classroom, lab, office, washroom, server_room, common
    area_sqm: float
    capacity: int
    current_occupancy: int
    energy_kw: float
    hvac_temp_c: float
    hvac_setpoint_c: float
    hvac_status: str # active, standby, off
    lighting_status: str # on, dim, off
    co2_ppm: float
    light_lux: float
    noise_db: float
    assets_count: int
    data_source: DataSource = DataSource.SIMULATED

class Floor(BaseModel):
    id: str
    building_id: str
    floor_number: int # 0=Ground, 1=1st, etc.
    name: str
    area_sqm: float
    rooms_count: int
    current_occupancy: int
    max_capacity: int
    energy_kw: float
    hvac_load_kw: float
    lighting_kw: float
    plug_load_kw: float
    water_flow_lpm: float
    average_temp_c: float
    rooms: List[Room] = []
    data_source: DataSource = DataSource.SIMULATED

class Building(BaseModel):
    id: str
    name: str
    code: str
    type: BuildingType
    construction_year: int
    floors_count: int
    total_area_sqm: float
    footprint_area_sqm: float
    roof_area_sqm: float
    solar_area_sqm: float
    solar_capacity_kw: float
    current_solar_gen_kw: float
    classroom_count: int
    lab_count: int
    office_count: int
    washroom_count: int
    max_capacity: int
    current_occupancy: int
    occupancy_rate_pct: float
    energy_consumption_kw: float
    daily_energy_kwh: float
    energy_efficiency_score: int # 0-100
    water_consumption_lpm: float
    daily_water_liters: float
    hvac_load_kw: float
    lighting_load_kw: float
    equipment_load_kw: float
    carbon_emissions_kg_hr: float
    operating_hours: str
    maintenance_status: str # OPTIMAL, ATTENTION, CRITICAL
    asset_count: int
    position_3d: Dict[str, float] # {x, y, z}
    dimensions_3d: Dict[str, float] # {width, height, depth}
    color_hex: str
    data_source: DataSource = DataSource.SIMULATED
    floors: List[Floor] = []

class Asset(BaseModel):
    id: str
    name: str
    category: AssetCategory
    type: str # Transformer, Chiller, AHU, Inverter, Pump, Switch, CCTV, Access Point, Elevator
    building_id: str
    floor_id: Optional[str] = None
    room_id: Optional[str] = None
    location_description: str
    position_3d: Dict[str, float]
    status: str # NORMAL, WARNING, FAULT, OFFLINE
    health_score: int # 0 - 100
    installation_year: int
    last_service_date: str
    next_service_date: str
    power_kw: float
    runtime_hours: float
    metrics: Dict[str, Any] = {} # e.g. {"temp_c": 64.2, "vibration_mms": 1.4, "power_factor": 0.96}
    data_source: DataSource = DataSource.SIMULATED

class Sensor(BaseModel):
    id: str
    name: str
    metric_type: str # power, water, temp, co2, occupancy, solar, aqi, pressure
    asset_id: Optional[str] = None
    building_id: str
    room_id: Optional[str] = None
    unit: str
    current_value: float
    min_threshold: Optional[float] = None
    max_threshold: Optional[float] = None
    status: str # OK, WARNING, ALERT
    data_source: DataSource = DataSource.SIMULATED
    last_updated: str

class Alert(BaseModel):
    id: str
    title: str
    severity: AlertSeverity
    status: AlertStatus
    building_id: str
    building_name: str
    asset_id: Optional[str] = None
    asset_name: Optional[str] = None
    position_3d: Dict[str, float]
    message: str
    timestamp: str
    metric_type: str
    current_value: float
    threshold_value: float
    unit: str
    estimated_impact: str
    recommended_action: str
    data_source: DataSource = DataSource.SIMULATED

class WastageItem(BaseModel):
    id: str
    building_id: str
    building_name: str
    location: str
    category: str # HVAC, LIGHTING, WATER, STANDBY, NIGHT_CONSUMPTION
    description: str
    wasted_quantity_per_hour: float
    unit: str
    estimated_monthly_kwh: float
    estimated_monthly_cost_inr: float
    estimated_monthly_co2_kg: float
    primary_cause: str
    recommended_action: str
    priority: str
    data_source: DataSource = DataSource.ESTIMATED

class Recommendation(BaseModel):
    id: str
    title: str
    category: str # ENERGY, WATER, SOLAR, HVAC, MAINTENANCE
    building_id: Optional[str] = None
    building_name: Optional[str] = None
    problem: str
    evidence: str
    recommended_action: str
    expected_energy_savings_kwh_yr: float
    expected_financial_savings_inr_yr: float
    expected_co2_reduction_tons_yr: float
    implementation_difficulty: str # LOW, MEDIUM, HIGH
    payback_period_months: int
    priority: str # CRITICAL, HIGH, MEDIUM, LOW
    confidence_score: int # 0-100%
    data_source: DataSource = DataSource.PREDICTED

class CampusSpatialMetrics(BaseModel):
    total_area_sqm: float
    total_area_sqft: float
    total_area_hectares: float
    total_area_acres: float
    built_up_area_sqm: float
    green_area_sqm: float
    parking_area_sqm: float
    road_pathway_area_sqm: float
    roof_area_sqm: float
    solar_panel_area_sqm: float
    water_body_area_sqm: float
    total_buildings_count: int
    total_floors_count: int
    total_rooms_count: int
    total_assets_count: int
    total_sensors_count: int
    data_source: DataSource = DataSource.REAL

class CampusHealthScore(BaseModel):
    overall_score: int # 0-100
    grade: str # A+, A, B, etc.
    status: str # OPTIMAL, GOOD, MODERATE, ATTENTION
    energy_efficiency: int
    water_efficiency: int
    infrastructure_health: int
    occupancy_efficiency: int
    environmental_quality: int
    sustainability: int
    maintenance: int
    safety: int
    explanation: List[str]
    data_source: DataSource = DataSource.ESTIMATED

class CampusSummary(BaseModel):
    campus_name: str
    location_coordinates: Dict[str, float] # lat, lng
    spatial_metrics: CampusSpatialMetrics
    health_score: CampusHealthScore
    live_metrics: Dict[str, Any]
    active_alerts_count: int
    critical_alerts_count: int
    simulation_mode: bool
    data_source: DataSource = DataSource.SIMULATED

class WhatIfRequest(BaseModel):
    lighting_led_upgrade_pct: float = 0.0 # 0 to 100%
    hvac_setpoint_adjustment_c: float = 0.0 # -3.0 to +3.0
    hvac_runtime_reduction_pct: float = 0.0 # 0 to 50%
    solar_capacity_increase_kw: float = 0.0 # 0 to 2000 kW
    operating_hours_limit: Optional[int] = None # e.g. 10 hrs
    occupancy_shift_pct: float = 0.0 # -50% to +50%
    rainwater_harvesting_expansion_pct: float = 0.0 # 0 to 100%
    replace_inefficient_equipment: bool = False

class WhatIfResponse(BaseModel):
    scenario_name: str
    baseline_energy_mwh_yr: float
    projected_energy_mwh_yr: float
    energy_savings_mwh_yr: float
    energy_savings_pct: float
    financial_savings_inr_yr: float
    co2_reduction_tons_yr: float
    water_savings_kiloliters_yr: float
    estimated_capex_inr: float
    payback_period_years: float
    grid_dependency_reduction_pct: float
    detailed_breakdown: Dict[str, Any]
    data_source: DataSource = DataSource.PREDICTED

class AIQueryRequest(BaseModel):
    query: str
    context_building_id: Optional[str] = None

class AIQueryResponse(BaseModel):
    query: str
    answer: str
    confidence: float
    grounded_data: Dict[str, Any]
    citations: List[str]
    suggested_actions: List[str]
    data_source: DataSource = DataSource.PREDICTED
