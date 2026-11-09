import { Building, Alert, WastageItem, Recommendation, LiveTelemetry, EnergyFlowData, Asset, Floor, Room } from '../types/campus';

export const MOCK_TELEMETRY: LiveTelemetry = {
  timestamp: new Date().toISOString(), simulated_time: '14:30', simulated_hour: 14.5, is_daylight: true,
  weather: { temperature_c: 31.5, humidity_pct: 54, solar_irradiance_wm2: 840, air_quality_aqi: 42, condition: 'Sunny' },
  power: { total_consumption_kw: 2847, total_consumption_mw: 2.847, grid_draw_kw: 1427, solar_generation_kw: 1420,
    solar_capacity_kw: 4200, solar_coverage_pct: 49.9, battery_storage_kw: 280, battery_soc_pct: 76.5,
    grid_voltage_kv: 33.1, grid_frequency_hz: 50.02, power_factor: 0.97, daily_energy_mwh: 23.18, peak_demand_kw: 3840 },
  water: { total_flow_lpm: 482, total_flow_m3_hr: 28.9, overhead_tank_pct: 78.4, underground_sump_pct: 91.2,
    rainwater_harvested_kl: 240, daily_consumption_kl: 555 },
  occupancy: { total_occupancy: 4820, total_capacity: 8200, utilization_pct: 58.8, active_buildings_count: 10 },
  environment: { co2_emissions_kg_hr: 1013, co2_avoided_by_solar_kg_hr: 709, avg_campus_co2_ppm: 448, noise_avg_db: 46 },
  wastage: { active_wastage_sources_count: 3, avoidable_power_kw: 38.7, monthly_cost_impact_inr: 69452 },
  alerts: { total_active: 3, critical: 1, high: 1, medium: 1, low: 0 },
  health_score: { overall_score: 82, grade: 'B+', status: 'ATTENTION', energy_efficiency: 83, water_efficiency: 76,
    infrastructure_health: 72, occupancy_efficiency: 89, environmental_quality: 94, sustainability: 86,
    maintenance: 80, safety: 95,
    explanation: ['Solar covers 48% of daytime load.', 'Water leak in Marri Nilayam.', 'TR-02 thermal overload.'],
    data_source: 'ESTIMATED' },
  data_source: 'SIMULATED',
};

export const MOCK_BUILDINGS: Building[] = [
  { id:'admin',    name:'Administration Block',             code:'ADMIN',    type:'ADMINISTRATIVE', construction_year:2000, floors_count:3, total_area_sqm:3200,  footprint_area_sqm:1100, roof_area_sqm:1100,  solar_area_sqm:600,  solar_capacity_kw:150, current_solar_gen_kw:124, classroom_count:0,  lab_count:0,  office_count:24, washroom_count:12, max_capacity:350,  current_occupancy:220, occupancy_rate_pct:62.8, energy_consumption_kw:285, daily_energy_kwh:3420, energy_efficiency_score:81, water_consumption_lpm:48,  daily_water_liters:14200, hvac_load_kw:98,  lighting_load_kw:42, equipment_load_kw:145, carbon_emissions_kg_hr:202, operating_hours:'08:00–20:00', maintenance_status:'GOOD',      asset_count:22, position_3d:{x:0,   y:0, z:-85}, dimensions_3d:{width:52,height:18,depth:38}, color_hex:'#0891b2', data_source:'SIMULATED', floors:[] },
  { id:'aero',     name:'Aeronautical & Drone Lab Block',   code:'AERO',     type:'RESEARCH',       construction_year:2012, floors_count:4, total_area_sqm:5400,  footprint_area_sqm:1350, roof_area_sqm:1350,  solar_area_sqm:900,  solar_capacity_kw:280, current_solar_gen_kw:231, classroom_count:6,  lab_count:8,  office_count:10, washroom_count:16, max_capacity:820,  current_occupancy:610, occupancy_rate_pct:74.4, energy_consumption_kw:520, daily_energy_kwh:6240, energy_efficiency_score:78, water_consumption_lpm:85,  daily_water_liters:24800, hvac_load_kw:185, lighting_load_kw:78, equipment_load_kw:257, carbon_emissions_kg_hr:368, operating_hours:'08:00–22:00', maintenance_status:'GOOD',      asset_count:35, position_3d:{x:-70, y:0, z:-40}, dimensions_3d:{width:58,height:24,depth:44}, color_hex:'#7c3aed', data_source:'SIMULATED', floors:[] },
  { id:'ciet',     name:'CIET Tower (CSE / IT / AI-ML)',    code:'CIET',     type:'ACADEMIC',       construction_year:2016, floors_count:6, total_area_sqm:7200,  footprint_area_sqm:1200, roof_area_sqm:1200,  solar_area_sqm:800,  solar_capacity_kw:320, current_solar_gen_kw:265, classroom_count:18, lab_count:12, office_count:14, washroom_count:24, max_capacity:1400, current_occupancy:1050,occupancy_rate_pct:75.0, energy_consumption_kw:610, daily_energy_kwh:7320, energy_efficiency_score:84, water_consumption_lpm:96,  daily_water_liters:28800, hvac_load_kw:210, lighting_load_kw:95, equipment_load_kw:305, carbon_emissions_kg_hr:432, operating_hours:'07:30–22:30', maintenance_status:'GOOD',      asset_count:42, position_3d:{x:65,  y:0, z:-40}, dimensions_3d:{width:44,height:36,depth:36}, color_hex:'#059669', data_source:'SIMULATED', floors:[] },
  { id:'ece',      name:'ECE & Mechanical Block',           code:'ECE',      type:'ACADEMIC',       construction_year:2008, floors_count:4, total_area_sqm:5800,  footprint_area_sqm:1450, roof_area_sqm:1450,  solar_area_sqm:750,  solar_capacity_kw:220, current_solar_gen_kw:182, classroom_count:14, lab_count:10, office_count:12, washroom_count:16, max_capacity:1100, current_occupancy:780, occupancy_rate_pct:70.9, energy_consumption_kw:480, daily_energy_kwh:5760, energy_efficiency_score:79, water_consumption_lpm:72,  daily_water_liters:21600, hvac_load_kw:168, lighting_load_kw:68, equipment_load_kw:244, carbon_emissions_kg_hr:340, operating_hours:'08:00–21:00', maintenance_status:'GOOD',      asset_count:30, position_3d:{x:10,  y:0, z:20},  dimensions_3d:{width:60,height:24,depth:45}, color_hex:'#d97706', data_source:'SIMULATED', floors:[] },
  { id:'lib',      name:'Central Library',                  code:'LIB',      type:'AMENITY',        construction_year:2005, floors_count:3, total_area_sqm:3600,  footprint_area_sqm:1200, roof_area_sqm:1200,  solar_area_sqm:500,  solar_capacity_kw:120, current_solar_gen_kw:99,  classroom_count:0,  lab_count:0,  office_count:8,  washroom_count:8,  max_capacity:800,  current_occupancy:480, occupancy_rate_pct:60.0, energy_consumption_kw:210, daily_energy_kwh:2520, energy_efficiency_score:87, water_consumption_lpm:32,  daily_water_liters:9600,  hvac_load_kw:74,  lighting_load_kw:55, equipment_load_kw:81,  carbon_emissions_kg_hr:149, operating_hours:'07:30–22:00', maintenance_status:'GOOD',      asset_count:18, position_3d:{x:-5,  y:0, z:-130},dimensions_3d:{width:50,height:18,depth:36}, color_hex:'#0369a1', data_source:'SIMULATED', floors:[] },
  { id:'aud',      name:'MLR Auditorium',                   code:'AUD',      type:'RECREATION',     construction_year:2010, floors_count:2, total_area_sqm:2800,  footprint_area_sqm:1400, roof_area_sqm:1400,  solar_area_sqm:600,  solar_capacity_kw:140, current_solar_gen_kw:0,   classroom_count:0,  lab_count:0,  office_count:4,  washroom_count:8,  max_capacity:1200, current_occupancy:0,   occupancy_rate_pct:0,    energy_consumption_kw:42,  daily_energy_kwh:504,  energy_efficiency_score:72, water_consumption_lpm:18,  daily_water_liters:5400,  hvac_load_kw:0,   lighting_load_kw:12, equipment_load_kw:30,  carbon_emissions_kg_hr:30,  operating_hours:'Event-based', maintenance_status:'GOOD',      asset_count:12, position_3d:{x:75,  y:0, z:40},  dimensions_3d:{width:55,height:14,depth:42}, color_hex:'#be185d', data_source:'SIMULATED', floors:[] },
  { id:'hostelb',  name:'Marri Nilayam Boys Hostel',        code:'HOSTEL-B', type:'RESIDENTIAL',    construction_year:2006, floors_count:5, total_area_sqm:6200,  footprint_area_sqm:1240, roof_area_sqm:1240,  solar_area_sqm:400,  solar_capacity_kw:110, current_solar_gen_kw:91,  classroom_count:0,  lab_count:0,  office_count:4,  washroom_count:40, max_capacity:800,  current_occupancy:720, occupancy_rate_pct:90.0, energy_consumption_kw:320, daily_energy_kwh:3840, energy_efficiency_score:68, water_consumption_lpm:185, daily_water_liters:55500, hvac_load_kw:110, lighting_load_kw:48, equipment_load_kw:162, carbon_emissions_kg_hr:227, operating_hours:'24/7',        maintenance_status:'ATTENTION', asset_count:28, position_3d:{x:-135,y:0, z:-15}, dimensions_3d:{width:44,height:30,depth:36}, color_hex:'#0f766e', data_source:'SIMULATED', floors:[] },
  { id:'hostelg',  name:'Parijatha Nilayam Girls Hostel',   code:'HOSTEL-G', type:'RESIDENTIAL',    construction_year:2009, floors_count:5, total_area_sqm:5800,  footprint_area_sqm:1160, roof_area_sqm:1160,  solar_area_sqm:360,  solar_capacity_kw:100, current_solar_gen_kw:83,  classroom_count:0,  lab_count:0,  office_count:4,  washroom_count:36, max_capacity:720,  current_occupancy:640, occupancy_rate_pct:88.9, energy_consumption_kw:290, daily_energy_kwh:3480, energy_efficiency_score:71, water_consumption_lpm:165, daily_water_liters:49500, hvac_load_kw:98,  lighting_load_kw:44, equipment_load_kw:148, carbon_emissions_kg_hr:206, operating_hours:'24/7',        maintenance_status:'GOOD',      asset_count:24, position_3d:{x:-80, y:0, z:90},  dimensions_3d:{width:42,height:30,depth:34}, color_hex:'#9d174d', data_source:'SIMULATED', floors:[] },
  { id:'sports',   name:'MLR Sports Complex & Stadium',     code:'SPORTS',   type:'RECREATION',     construction_year:2014, floors_count:1, total_area_sqm:18000, footprint_area_sqm:18000,roof_area_sqm:2200,  solar_area_sqm:1200, solar_capacity_kw:300, current_solar_gen_kw:248, classroom_count:0,  lab_count:0,  office_count:6,  washroom_count:16, max_capacity:3000, current_occupancy:320, occupancy_rate_pct:10.7, energy_consumption_kw:95,  daily_energy_kwh:1140, energy_efficiency_score:88, water_consumption_lpm:120, daily_water_liters:36000, hvac_load_kw:0,   lighting_load_kw:65, equipment_load_kw:30,  carbon_emissions_kg_hr:67,  operating_hours:'06:00–21:00', maintenance_status:'GOOD',      asset_count:15, position_3d:{x:135, y:0, z:90},  dimensions_3d:{width:80,height:10,depth:80}, color_hex:'#15803d', data_source:'SIMULATED', floors:[] },
  { id:'sub',      name:'TSSPDCL 33kV Grid Substation',     code:'SUB',      type:'UTILITY',        construction_year:2003, floors_count:1, total_area_sqm:800,   footprint_area_sqm:800,  roof_area_sqm:800,   solar_area_sqm:0,    solar_capacity_kw:0,   current_solar_gen_kw:0,   classroom_count:0,  lab_count:0,  office_count:2,  washroom_count:2,  max_capacity:10,   current_occupancy:4,   occupancy_rate_pct:40,   energy_consumption_kw:5,   daily_energy_kwh:60,   energy_efficiency_score:95, water_consumption_lpm:2,   daily_water_liters:600,   hvac_load_kw:2,   lighting_load_kw:3,  equipment_load_kw:0,   carbon_emissions_kg_hr:4,   operating_hours:'24/7',        maintenance_status:'ATTENTION', asset_count:8,  position_3d:{x:140, y:0, z:-75}, dimensions_3d:{width:45,height:8, depth:35}, color_hex:'#dc2626', data_source:'SIMULATED', floors:[] },
];

function synthesizeFloors(b: Building): Floor[] {
  const n = Math.max(1, b.floors_count);
  return Array.from({ length: n }, (_, i) => {
    const roomN = Math.min(6, Math.max(3, Math.round((b.classroom_count + b.lab_count + b.office_count) / n) || 4));
    const occ = Math.round(b.current_occupancy / n);
    const cap = Math.round(b.max_capacity / n);
    const energy = +(b.energy_consumption_kw / n).toFixed(1);
    const rooms: Room[] = Array.from({ length: roomN }, (_, r) => ({
      id: `${b.id}-f${i}-r${r}`,
      name: r === 0 ? `${b.code} Core ${i}` : `${b.code}-${i}${r}0`,
      code: `${b.code}-${i}${r}`,
      floor_id: `${b.id}-f${i}`,
      building_id: b.id,
      type: r % 3 === 0 ? 'LAB' : r % 3 === 1 ? 'CLASSROOM' : 'OFFICE',
      area_sqm: Math.round((b.total_area_sqm / n) / roomN),
      capacity: Math.round(cap / roomN),
      current_occupancy: Math.max(0, Math.round(occ / roomN) + (r === 1 && b.id === 'aud' ? -10 : 0)),
      energy_kw: +(energy / roomN).toFixed(1),
      hvac_temp_c: 23.5 + (r % 3) * 0.4,
      hvac_setpoint_c: 24,
      hvac_status: occ > 0 ? 'COOLING' : 'STANDBY',
      lighting_status: occ > 0 || (b.id === 'aud' && r === 2) ? 'on' : 'off',
      co2_ppm: 420 + occ * 2,
      light_lux: occ > 0 ? 380 : 40,
      noise_db: 38 + (r % 4) * 3,
      assets_count: 2 + r,
      data_source: 'SIMULATED',
    }));
    return {
      id: `${b.id}-f${i}`,
      building_id: b.id,
      floor_number: i,
      name: i === 0 ? 'Ground' : `Level ${i}`,
      area_sqm: Math.round(b.total_area_sqm / n),
      rooms_count: rooms.length,
      current_occupancy: occ,
      max_capacity: cap,
      energy_kw: energy,
      hvac_load_kw: +(b.hvac_load_kw / n).toFixed(1),
      lighting_kw: +(b.lighting_load_kw / n).toFixed(1),
      plug_load_kw: +(b.equipment_load_kw / n).toFixed(1),
      water_flow_lpm: +(b.water_consumption_lpm / n).toFixed(1),
      average_temp_c: 24.1,
      rooms,
      data_source: 'SIMULATED',
    };
  });
}

MOCK_BUILDINGS.forEach(b => { b.floors = synthesizeFloors(b); });

export const MOCK_ALERTS: Alert[] = [
  { id:'alert-001', title:'Transformer TR-02 Thermal Overload', severity:'CRITICAL', status:'ACTIVE',
    building_id:'sub', building_name:'33kV Substation', position_3d:{x:140,y:12,z:-75},
    message:'TR-02 at 118°C vs 95°C limit — cooling system failure suspected.',
    timestamp: new Date().toISOString(), metric_type:'temperature', current_value:118, threshold_value:95, unit:'°C',
    estimated_impact:'Grid instability risk', recommended_action:'Reduce load, inspect cooling immediately.', data_source:'SIMULATED' },
  { id:'alert-002', title:'Water Leak — Marri Nilayam Hostel', severity:'HIGH', status:'ACTIVE',
    building_id:'hostelb', building_name:'Marri Nilayam Boys Hostel', position_3d:{x:-135,y:14,z:-15},
    message:'138 LPM flow at 03:00 AM (normal: 12 LPM). Possible pipe burst Level-1.',
    timestamp: new Date().toISOString(), metric_type:'water_flow', current_value:138, threshold_value:20, unit:'LPM',
    estimated_impact:'₹24,600/month wastage', recommended_action:'Emergency plumbing inspection.', data_source:'SIMULATED' },
  { id:'alert-003', title:'Standby Power — Auditorium AV Systems', severity:'MEDIUM', status:'ACTIVE',
    building_id:'aud', building_name:'MLR Auditorium', position_3d:{x:75,y:10,z:40},
    message:'AV & stage lights drawing 38.7 kW with 0% occupancy.',
    timestamp: new Date().toISOString(), metric_type:'power', current_value:38.7, threshold_value:5, unit:'kW',
    estimated_impact:'₹69,452/month', recommended_action:'Power down via BMS panel.', data_source:'SIMULATED' },
];

export const MOCK_WASTAGE: WastageItem[] = [
  { id:'w-001', building_id:'aud',     building_name:'MLR Auditorium',          location:'Stage Level', category:'POWER', description:'AV & Stage Lights ON — Zero Occupancy', wasted_quantity_per_hour:38.7, unit:'kW', estimated_monthly_kwh:27864, estimated_monthly_cost_inr:69452, estimated_monthly_co2_kg:826, primary_cause:'No BMS automation', recommended_action:'Auto power-off on zero occupancy.', priority:'HIGH',     data_source:'SIMULATED' },
  { id:'w-002', building_id:'hostelb', building_name:'Marri Nilayam Boys Hostel',location:'Level 1 Pipes',category:'WATER',description:'Continuous Flow — Possible Pipe Burst',   wasted_quantity_per_hour:138,  unit:'LPM', estimated_monthly_kwh:0,     estimated_monthly_cost_inr:24600, estimated_monthly_co2_kg:0,   primary_cause:'Aging pipes',        recommended_action:'Emergency plumbing inspection.', priority:'CRITICAL', data_source:'SIMULATED' },
  { id:'w-003', building_id:'ece',     building_name:'ECE & Mechanical Block',   location:'Room 204',    category:'POWER', description:'HVAC Running — Empty Lab Room 204',       wasted_quantity_per_hour:12.4, unit:'kW', estimated_monthly_kwh:8928,  estimated_monthly_cost_inr:22320, estimated_monthly_co2_kg:264, primary_cause:'No occupancy sensor', recommended_action:'Install PIR-linked HVAC.',       priority:'MEDIUM',   data_source:'SIMULATED' },
];

export const MOCK_RECOMMENDATIONS: Recommendation[] = [
  { id:'r-001', title:'LED Retrofit — All Buildings',        category:'ENERGY', problem:'2,400 fluorescent tubes still in use.', evidence:'Energy audit Feb 2024.', recommended_action:'Replace with LED across all 10 buildings.', expected_energy_savings_kwh_yr:1607040, expected_financial_savings_inr_yr:3974400, expected_co2_reduction_tons_yr:47, implementation_difficulty:'LOW',  payback_period_months:8,  priority:'HIGH',   confidence_score:0.95, data_source:'ESTIMATED' },
  { id:'r-002', title:'Expand Rooftop Solar to 6 MWp',       category:'ENERGY', problem:'Grid dependency 50% daytime.',          evidence:'Solar simulation model.',   recommended_action:'Add 1,760 kWp on ECE, Library, Hostel rooftops.', expected_energy_savings_kwh_yr:2640000, expected_financial_savings_inr_yr:6336000, expected_co2_reduction_tons_yr:451, implementation_difficulty:'HIGH', payback_period_months:28, priority:'HIGH',   confidence_score:0.90, data_source:'ESTIMATED' },
  { id:'r-003', title:'Smart Water Sub-Metering',             category:'WATER',  problem:'No flow visibility at circuit level.',  evidence:'Manual inspection log.',    recommended_action:'Install sub-meters on 42 plumbing circuits.',    expected_energy_savings_kwh_yr:0,       expected_financial_savings_inr_yr:216000,  expected_co2_reduction_tons_yr:0,   implementation_difficulty:'LOW',  payback_period_months:27, priority:'MEDIUM', confidence_score:0.85, data_source:'ESTIMATED' },
];

export const MOCK_ENERGY_FLOW: EnergyFlowData = {
  nodes: [
    { id:'grid',    label:'TSSPDCL Grid 33kV', category:'input',    value:1427, color:'#ef4444' },
    { id:'solar',   label:'Rooftop Solar PV',  category:'input',    value:1420, color:'#f59e0b' },
    { id:'battery', label:'BESS Storage',      category:'storage',  value:280,  color:'#8b5cf6' },
    { id:'main',    label:'Main Distribution', category:'dist',     value:2847, color:'#64748b' },
    { id:'admin',   label:'Admin Block',        category:'building', value:285,  color:'#0891b2' },
    { id:'aero',    label:'Aero Block',         category:'building', value:520,  color:'#7c3aed' },
    { id:'ciet',    label:'CIET Tower',         category:'building', value:610,  color:'#059669' },
    { id:'ece',     label:'ECE & Mech',         category:'building', value:480,  color:'#d97706' },
    { id:'others',  label:'Other Buildings',    category:'building', value:952,  color:'#475569' },
  ],
  links: [
    { source:'grid',    target:'main',   value:1427 },
    { source:'solar',   target:'main',   value:1420 },
    { source:'main',    target:'admin',  value:285  },
    { source:'main',    target:'aero',   value:520  },
    { source:'main',    target:'ciet',   value:610  },
    { source:'main',    target:'ece',    value:480  },
    { source:'main',    target:'others', value:952  },
  ],
};

export const MOCK_ASSETS: Asset[] = [
  { id:'tr-02', name:'Transformer TR-02', category:'ELECTRICAL', type:'33kV Transformer', building_id:'sub', location_description:'Substation bay 2', position_3d:{x:140,y:4,z:-75}, status:'FAULT', health_score:42, installation_year:2008, last_service_date:'2025-11-12', next_service_date:'2026-05-12', power_kw:0, runtime_hours:64200, metrics:{temp_c:118}, data_source:'SIMULATED' },
  { id:'pv-ciet', name:'CIET Rooftop Array A', category:'RENEWABLE', type:'Solar PV String', building_id:'ciet', location_description:'CIET roof south', position_3d:{x:65,y:36,z:-40}, status:'NORMAL', health_score:94, installation_year:2019, last_service_date:'2026-01-20', next_service_date:'2026-07-20', power_kw:265, runtime_hours:28100, metrics:{irradiance:840}, data_source:'SIMULATED' },
  { id:'hvac-204', name:'Lab 204 AHU', category:'MECHANICAL', type:'Air Handling Unit', building_id:'ece', location_description:'ECE Room 204', position_3d:{x:10,y:12,z:20}, status:'WARNING', health_score:68, installation_year:2015, last_service_date:'2025-09-01', next_service_date:'2026-03-01', power_kw:12.4, runtime_hours:18400, metrics:{setpoint_c:24}, data_source:'SIMULATED' },
  { id:'pump-mn', name:'Marri Nilayam Booster Pump', category:'PLUMBING', type:'Water Pump', building_id:'hostelb', location_description:'Hostel Level-1 plant room', position_3d:{x:-135,y:2,z:-15}, status:'WARNING', health_score:55, installation_year:2011, last_service_date:'2025-08-14', next_service_date:'2026-02-14', power_kw:7.5, runtime_hours:42000, metrics:{flow_lpm:138}, data_source:'SIMULATED' },
  { id:'av-aud', name:'Auditorium AV Rack', category:'IT', type:'AV Controllers', building_id:'aud', location_description:'Stage control booth', position_3d:{x:75,y:6,z:40}, status:'WARNING', health_score:71, installation_year:2018, last_service_date:'2025-12-02', next_service_date:'2026-06-02', power_kw:38.7, runtime_hours:9600, metrics:{occupancy:0}, data_source:'SIMULATED' },
  { id:'wt-aero', name:'Subsonic Wind Tunnel', category:'MECHANICAL', type:'Aero Test Rig', building_id:'aero', location_description:'Aero Lab Bay 3', position_3d:{x:-70,y:4,z:-40}, status:'NORMAL', health_score:91, installation_year:2014, last_service_date:'2026-02-10', next_service_date:'2026-08-10', power_kw:85, runtime_hours:11200, metrics:{mach:0.3}, data_source:'SIMULATED' },
  { id:'cctv-gate', name:'Main Gate Camera Cluster', category:'SECURITY', type:'IP Camera NVR', building_id:'admin', location_description:'Admin perimeter', position_3d:{x:0,y:8,z:-85}, status:'NORMAL', health_score:96, installation_year:2021, last_service_date:'2026-01-05', next_service_date:'2026-07-05', power_kw:0.4, runtime_hours:38000, metrics:{cameras:12}, data_source:'SIMULATED' },
  { id:'bess-01', name:'Campus BESS Pack', category:'ELECTRICAL', type:'Battery Storage', building_id:'sub', location_description:'Substation BESS shelter', position_3d:{x:145,y:3,z:-70}, status:'NORMAL', health_score:88, installation_year:2022, last_service_date:'2025-10-18', next_service_date:'2026-04-18', power_kw:280, runtime_hours:8600, metrics:{soc_pct:76.5}, data_source:'SIMULATED' },
];

// Live mock stream
let _interval: ReturnType<typeof setInterval> | null = null;
const _cbs: Set<(t: LiveTelemetry) => void> = new Set();

export function startMockTelemetryStream(cb: (t: LiveTelemetry) => void): () => void {
  _cbs.add(cb);
  if (!_interval) {
    _interval = setInterval(() => {
      const n = () => (Math.random() - 0.5) * 0.04;
      const t: LiveTelemetry = {
        ...MOCK_TELEMETRY,
        timestamp: new Date().toISOString(),
        power: { ...MOCK_TELEMETRY.power, total_consumption_kw: +(MOCK_TELEMETRY.power.total_consumption_kw*(1+n())).toFixed(1), solar_generation_kw: +(MOCK_TELEMETRY.power.solar_generation_kw*(1+n())).toFixed(1), grid_draw_kw: +(MOCK_TELEMETRY.power.grid_draw_kw*(1+n())).toFixed(1) },
        water: { ...MOCK_TELEMETRY.water, total_flow_lpm: +(MOCK_TELEMETRY.water.total_flow_lpm*(1+n())).toFixed(0) as unknown as number },
      };
      _cbs.forEach(fn => fn(t));
    }, 3000);
  }
  return () => {
    _cbs.delete(cb);
    if (_cbs.size === 0 && _interval) { clearInterval(_interval); _interval = null; }
  };
}
