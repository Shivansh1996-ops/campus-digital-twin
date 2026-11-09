export type DataSource = 'REAL' | 'SIMULATED' | 'ESTIMATED' | 'PREDICTED';
export type AlertSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type AlertStatus = 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED';
export type BuildingType = 'ACADEMIC' | 'RESEARCH' | 'ADMINISTRATIVE' | 'RESIDENTIAL' | 'RECREATION' | 'UTILITY' | 'AMENITY';
export type AssetCategory = 'ELECTRICAL' | 'MECHANICAL' | 'IT' | 'SECURITY' | 'PLUMBING' | 'RENEWABLE';

export type ViewMode = 'PURE_SATELLITE' | '3D_ON_SATELLITE' | '3D_REALISTIC' | 'SATELLITE' | 'HYBRID' | 'HEATMAP_ENERGY' | 'HEATMAP_WATER' | 'HEATMAP_OCCUPANCY' | 'HEATMAP_HEALTH';

export interface GpsCoordinate {
  latitude: number;
  longitude: number;
  altitude_m: number;
  heading_deg: number;
  satellites: number;
  accuracy_m: number;
}


export interface Room {
  id: string;
  name: string;
  code: string;
  floor_id: string;
  building_id: string;
  type: string;
  area_sqm: number;
  capacity: number;
  current_occupancy: number;
  energy_kw: number;
  hvac_temp_c: number;
  hvac_setpoint_c: number;
  hvac_status: string;
  lighting_status: string;
  co2_ppm: number;
  light_lux: number;
  noise_db: number;
  assets_count: number;
  data_source: DataSource;
}

export interface Floor {
  id: string;
  building_id: string;
  floor_number: number;
  name: string;
  area_sqm: number;
  rooms_count: number;
  current_occupancy: number;
  max_capacity: number;
  energy_kw: number;
  hvac_load_kw: number;
  lighting_kw: number;
  plug_load_kw: number;
  water_flow_lpm: number;
  average_temp_c: number;
  rooms: Room[];
  data_source: DataSource;
}

export interface Building {
  id: string;
  name: string;
  code: string;
  type: BuildingType;
  construction_year: number;
  floors_count: number;
  total_area_sqm: number;
  footprint_area_sqm: number;
  roof_area_sqm: number;
  solar_area_sqm: number;
  solar_capacity_kw: number;
  current_solar_gen_kw: number;
  classroom_count: number;
  lab_count: number;
  office_count: number;
  washroom_count: number;
  max_capacity: number;
  current_occupancy: number;
  occupancy_rate_pct: number;
  energy_consumption_kw: number;
  daily_energy_kwh: number;
  energy_efficiency_score: number;
  water_consumption_lpm: number;
  daily_water_liters: number;
  hvac_load_kw: number;
  lighting_load_kw: number;
  equipment_load_kw: number;
  carbon_emissions_kg_hr: number;
  operating_hours: string;
  maintenance_status: string;
  asset_count: number;
  position_3d: { x: number; y: number; z: number };
  dimensions_3d: { width: number; height: number; depth: number };
  color_hex: string;
  data_source: DataSource;
  floors: Floor[];
}

export interface Asset {
  id: string;
  name: string;
  category: AssetCategory;
  type: string;
  building_id: string;
  floor_id?: string;
  room_id?: string;
  location_description: string;
  position_3d: { x: number; y: number; z: number };
  status: 'NORMAL' | 'WARNING' | 'FAULT' | 'OFFLINE';
  health_score: number;
  installation_year: number;
  last_service_date: string;
  next_service_date: string;
  power_kw: number;
  runtime_hours: number;
  metrics: Record<string, any>;
  data_source: DataSource;
}

export interface Alert {
  id: string;
  title: string;
  severity: AlertSeverity;
  status: AlertStatus;
  building_id: string;
  building_name: string;
  asset_id?: string;
  asset_name?: string;
  position_3d: { x: number; y: number; z: number };
  message: string;
  timestamp: string;
  metric_type: string;
  current_value: number;
  threshold_value: number;
  unit: string;
  estimated_impact: string;
  recommended_action: string;
  data_source: DataSource;
}

export interface WastageItem {
  id: string;
  building_id: string;
  building_name: string;
  location: string;
  category: string;
  description: string;
  wasted_quantity_per_hour: number;
  unit: string;
  estimated_monthly_kwh: number;
  estimated_monthly_cost_inr: number;
  estimated_monthly_co2_kg: number;
  primary_cause: string;
  recommended_action: string;
  priority: string;
  data_source: DataSource;
}

export interface Recommendation {
  id: string;
  title: string;
  category: string;
  building_id?: string;
  building_name?: string;
  problem: string;
  evidence: string;
  recommended_action: string;
  expected_energy_savings_kwh_yr: number;
  expected_financial_savings_inr_yr: number;
  expected_co2_reduction_tons_yr: number;
  implementation_difficulty: 'LOW' | 'MEDIUM' | 'HIGH';
  payback_period_months: number;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  confidence_score: number;
  data_source: DataSource;
}

export interface CampusSpatialMetrics {
  total_area_sqm: number;
  total_area_sqft: number;
  total_area_hectares: number;
  total_area_acres: number;
  built_up_area_sqm: number;
  green_area_sqm: number;
  parking_area_sqm: number;
  road_pathway_area_sqm: number;
  roof_area_sqm: number;
  solar_panel_area_sqm: number;
  water_body_area_sqm: number;
  total_buildings_count: number;
  total_floors_count: number;
  total_rooms_count: number;
  total_assets_count: number;
  total_sensors_count: number;
  data_source: DataSource;
}

export interface CampusHealthScore {
  overall_score: number;
  grade: string;
  status: string;
  energy_efficiency: number;
  water_efficiency: number;
  infrastructure_health: number;
  occupancy_efficiency: number;
  environmental_quality: number;
  sustainability: number;
  maintenance: number;
  safety: number;
  explanation: string[];
  data_source: DataSource;
}

export interface LiveTelemetry {
  timestamp: string;
  simulated_time: string;
  simulated_hour: number;
  is_daylight: boolean;
  weather: {
    temperature_c: number;
    humidity_pct: number;
    solar_irradiance_wm2: number;
    air_quality_aqi: number;
    condition: string;
  };
  power: {
    total_consumption_kw: number;
    total_consumption_mw: number;
    grid_draw_kw: number;
    solar_generation_kw: number;
    solar_capacity_kw: number;
    solar_coverage_pct: number;
    battery_storage_kw: number;
    battery_soc_pct: number;
    grid_voltage_kv: number;
    grid_frequency_hz: number;
    power_factor: number;
    daily_energy_mwh: number;
    peak_demand_kw: number;
  };
  water: {
    total_flow_lpm: number;
    total_flow_m3_hr: number;
    overhead_tank_pct: number;
    underground_sump_pct: number;
    rainwater_harvested_kl: number;
    daily_consumption_kl: number;
  };
  occupancy: {
    total_occupancy: number;
    total_capacity: number;
    utilization_pct: number;
    active_buildings_count: number;
  };
  environment: {
    co2_emissions_kg_hr: number;
    co2_avoided_by_solar_kg_hr: number;
    avg_campus_co2_ppm: number;
    noise_avg_db: number;
  };
  wastage: {
    active_wastage_sources_count: number;
    avoidable_power_kw: number;
    monthly_cost_impact_inr: number;
  };
  alerts: {
    total_active: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  health_score: CampusHealthScore;
  data_source: DataSource;
}

export interface WhatIfRequest {
  lighting_led_upgrade_pct: number;
  hvac_setpoint_adjustment_c: number;
  hvac_runtime_reduction_pct: number;
  solar_capacity_increase_kw: number;
  operating_hours_limit?: number;
  occupancy_shift_pct: number;
  rainwater_harvesting_expansion_pct: number;
  replace_inefficient_equipment: boolean;
}

export interface WhatIfResponse {
  scenario_name: string;
  baseline_energy_mwh_yr: number;
  projected_energy_mwh_yr: number;
  energy_savings_mwh_yr: number;
  energy_savings_pct: number;
  financial_savings_inr_yr: number;
  co2_reduction_tons_yr: number;
  water_savings_kiloliters_yr: number;
  estimated_capex_inr: number;
  payback_period_years: number;
  grid_dependency_reduction_pct: number;
  detailed_breakdown: Record<string, any>;
  data_source: DataSource;
}

export interface TimelineYear {
  year: number;
  label: string;
  energy_consumption_mwh: number;
  solar_generation_mwh: number;
  renewable_pct: number;
  water_consumption_kl: number;
  carbon_emissions_tons: number;
  health_score: number;
  total_capex_spent_inr: number;
  status: string;
}

export interface EnergyFlowData {
  nodes: Array<{ id: string; label: string; category: string; value: number; color: string }>;
  links: Array<{ source: string; target: string; value: number }>;
}
