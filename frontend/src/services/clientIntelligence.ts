import {
  WhatIfRequest, WhatIfResponse, TimelineYear, Alert
} from '../types/campus';
import {
  MOCK_TELEMETRY, MOCK_ALERTS, MOCK_RECOMMENDATIONS, MOCK_BUILDINGS, MOCK_WASTAGE
} from './mockData';

/** Client-side What-If engine (parity with backend) — works with or without API. */
export function runLocalWhatIf(req: WhatIfRequest): WhatIfResponse {
  const baseline_energy_mwh_yr = 18250;
  const baseline_solar_gen_mwh_yr = 5600;
  const tariff = 9;
  const co2_kg = 0.71;
  const water_tariff = 65;

  const lighting_savings = 4562.5 * (req.lighting_led_upgrade_pct / 100) * 0.52;
  const led_capex = req.lighting_led_upgrade_pct * 35000;

  const hvac_base = 8760;
  const setpoint = Math.max(0, req.hvac_setpoint_adjustment_c * 0.065);
  const runtime = req.hvac_runtime_reduction_pct / 100;
  const hvac_savings = hvac_base * Math.min(0.45, setpoint + runtime);
  const hvac_capex = req.hvac_runtime_reduction_pct > 0 ? 450000 : 0;

  const solar_mwh = req.solar_capacity_increase_kw * 1.45;
  const solar_capex = req.solar_capacity_increase_kw * 42000;

  const equipment_savings = req.replace_inefficient_equipment ? 820 : 0;
  const equipment_capex = req.replace_inefficient_equipment ? 4800000 : 0;

  const occ_impact = 2737.5 * (req.occupancy_shift_pct / 100) * 0.4;

  let hours_savings = 0;
  if (req.operating_hours_limit && req.operating_hours_limit < 14) {
    hours_savings = ((14 - req.operating_hours_limit) / 14) * 1250;
  }

  const water_kl = (req.rainwater_harvesting_expansion_pct / 100) * 48000;
  const water_capex = (req.rainwater_harvesting_expansion_pct / 100) * 2200000;

  const energy_savings = Math.max(0, lighting_savings + hvac_savings + equipment_savings + hours_savings - occ_impact);
  const projected = Math.max(6000, baseline_energy_mwh_yr - energy_savings);
  const energy_pct = +(energy_savings / baseline_energy_mwh_yr * 100).toFixed(2);

  const baseline_grid = Math.max(0, baseline_energy_mwh_yr - baseline_solar_gen_mwh_yr);
  const projected_grid = Math.max(0, projected - (baseline_solar_gen_mwh_yr + solar_mwh));
  const grid_pct = baseline_grid > 0
    ? +(((baseline_grid - projected_grid) / baseline_grid) * 100).toFixed(2)
    : 0;

  const financial =
    energy_savings * 1000 * tariff +
    solar_mwh * 1000 * tariff +
    water_kl * water_tariff;

  const co2 = ((energy_savings + solar_mwh) * 1000 * co2_kg) / 1000;
  const capex = led_capex + hvac_capex + solar_capex + equipment_capex + water_capex;
  const payback = financial > 0 ? +(capex / financial).toFixed(2) : 0;

  const parts: string[] = [];
  if (req.lighting_led_upgrade_pct > 0) parts.push(`LED ${req.lighting_led_upgrade_pct}%`);
  if (req.hvac_setpoint_adjustment_c || req.hvac_runtime_reduction_pct)
    parts.push(`HVAC +${req.hvac_setpoint_adjustment_c}°C / -${req.hvac_runtime_reduction_pct}%`);
  if (req.solar_capacity_increase_kw > 0) parts.push(`Solar +${req.solar_capacity_increase_kw} kWp`);
  if (req.rainwater_harvesting_expansion_pct > 0) parts.push(`RWH ${req.rainwater_harvesting_expansion_pct}%`);
  if (req.replace_inefficient_equipment) parts.push('IE4 / VFD retrofit');

  return {
    scenario_name: parts.length ? parts.join(' · ') : 'Baseline (no interventions)',
    baseline_energy_mwh_yr,
    projected_energy_mwh_yr: +projected.toFixed(1),
    energy_savings_mwh_yr: +energy_savings.toFixed(1),
    energy_savings_pct: energy_pct,
    financial_savings_inr_yr: Math.round(financial),
    co2_reduction_tons_yr: +co2.toFixed(1),
    water_savings_kiloliters_yr: Math.round(water_kl),
    estimated_capex_inr: Math.round(capex),
    payback_period_years: payback,
    grid_dependency_reduction_pct: grid_pct,
    detailed_breakdown: {
      lighting_savings_mwh: +lighting_savings.toFixed(1),
      hvac_savings_mwh: +hvac_savings.toFixed(1),
      solar_addition_mwh: +solar_mwh.toFixed(1),
      equipment_savings_mwh: equipment_savings,
    },
    data_source: 'ESTIMATED',
  };
}

export function buildExecutiveReport() {
  const t = MOCK_TELEMETRY;
  return {
    report_id: `MLRIT-EXEC-${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`,
    generated_at: new Date().toLocaleString('en-IN', { dateStyle: 'full', timeStyle: 'short' }),
    executive_summary:
      'MLRIT Dundigal campus is operating at Health Score B+ (82/100). Rooftop solar covers ~50% of daytime load. Three actionable anomalies are driving avoidable cost of ~₹94,000/month: TR-02 thermal overload at the 33 kV substation, overnight water leak at Marri Nilayam, and idle Auditorium AV draw. Recommended near-term actions (LED retrofit + BMS occupancy controls + solar expansion) deliver multi-crore annual savings with sub-3-year paybacks.',
    kpi_overview: {
      power: t.power,
      water: t.water,
      occupancy: t.occupancy,
      health_score: t.health_score,
    },
    critical_anomalies: MOCK_ALERTS,
    top_roi_recommendations: MOCK_RECOMMENDATIONS,
    certifications: [
      { standard: 'ISO 50001 Energy', status: 'IN PROGRESS' },
      { standard: 'IGBC Campus', status: 'TARGET 2027' },
      { standard: 'Net-Zero Pathway', status: 'ROADMAPED TO 2028' },
    ],
  };
}

export function buildTimeline(): TimelineYear[] {
  return [
    {
      year: 2024, label: 'Baseline Year', status: 'Completed audit & twin bootstrap',
      energy_consumption_mwh: 19200, solar_generation_mwh: 4100, renewable_pct: 21.4,
      water_consumption_kl: 210000, carbon_emissions_tons: 10700, health_score: 71,
      total_capex_spent_inr: 12000000,
    },
    {
      year: 2025, label: 'Solar Phase-1', status: '4.2 MWp rooftop commissioned',
      energy_consumption_mwh: 18600, solar_generation_mwh: 5600, renewable_pct: 30.1,
      water_consumption_kl: 198000, carbon_emissions_tons: 9200, health_score: 78,
      total_capex_spent_inr: 98000000,
    },
    {
      year: 2026, label: 'Digital Twin Live', status: 'Campus intelligence platform operational',
      energy_consumption_mwh: 18250, solar_generation_mwh: 5600, renewable_pct: 30.7,
      water_consumption_kl: 190000, carbon_emissions_tons: 8900, health_score: 82,
      total_capex_spent_inr: 112000000,
    },
    {
      year: 2027, label: 'Efficiency Wave', status: 'LED + BMS + leak remediation',
      energy_consumption_mwh: 15800, solar_generation_mwh: 7200, renewable_pct: 45.6,
      water_consumption_kl: 165000, carbon_emissions_tons: 6100, health_score: 90,
      total_capex_spent_inr: 145000000,
    },
    {
      year: 2028, label: 'Net-Zero Daytime', status: 'Grid-independent daytime operations',
      energy_consumption_mwh: 14200, solar_generation_mwh: 9800, renewable_pct: 69.0,
      water_consumption_kl: 148000, carbon_emissions_tons: 3100, health_score: 96,
      total_capex_spent_inr: 198000000,
    },
  ];
}

function score(q: string, words: string[]) {
  return words.reduce((s, w) => s + (q.includes(w) ? 1 : 0), 0);
}

function buildingFromQuery(q: string) {
  const keys: Array<[string[], string]> = [
    [['ciet', 'cse', 'it tower', 'ai-ml', 'aiml'], 'ciet'],
    [['aero', 'drone', 'aeronautical', 'wind tunnel'], 'aero'],
    [['ece', 'mech', 'mechanical'], 'ece'],
    [['admin', 'principal'], 'admin'],
    [['library', 'lib '], 'lib'],
    [['auditorium', 'aud '], 'aud'],
    [['hostel', 'nilayam', 'boys'], 'hostelb'],
    [['parijatha', 'girls'], 'hostelg'],
    [['sports', 'stadium'], 'sports'],
    [['substation', 'tr-02', 'transformer', '33kv'], 'sub'],
  ];
  for (const [ws, id] of keys) {
    if (ws.some(w => q.includes(w))) return MOCK_BUILDINGS.find(b => b.id === id);
  }
  return undefined;
}

/** Faculty-demo AI grounded in twin telemetry. */
export function answerCampusQuery(query: string, contextBuildingId?: string): {
  answer: string;
  citations: string[];
  suggested_actions: string[];
  confidence: number;
  data_source: string;
} {
  const q = query.toLowerCase();
  const topWaste = [...MOCK_WASTAGE].sort((a, b) => b.estimated_monthly_cost_inr - a.estimated_monthly_cost_inr)[0];
  const topEnergy = [...MOCK_BUILDINGS].sort((a, b) => b.energy_consumption_kw - a.energy_consumption_kw)[0];
  const named = buildingFromQuery(q);
  const ctx = named || (contextBuildingId ? MOCK_BUILDINGS.find(b => b.id === contextBuildingId) : undefined);

  const intents = {
    waste: score(q, ['waste', 'wastage', 'leak', 'idle', 'avoidable', 'auditorium av']),
    energy: score(q, ['power', 'energy', 'kwh', 'consume', 'demand', 'grid', 'electric']),
    solar: score(q, ['solar', 'pv', 'rooftop', 'renewable', 'irradiance']),
    asset: score(q, ['maintenance', 'asset', 'transformer', 'tr-02', 'fault', 'service']),
    hvac: score(q, ['hvac', 'cooling', 'setpoint', 'save', '15%', '15 %', 'runtime', 'roi']),
    water: score(q, ['water', 'lpm', 'tank', 'sump', 'plumbing', 'rainwater']),
    occ: score(q, ['occupancy', 'students', 'crowd', 'capacity', 'heads']),
    health: score(q, ['health', 'score', 'status', 'overview', 'summary', 'campus']),
    whatif: score(q, ['what-if', 'what if', 'scenario', 'payback', 'capex', 'net-zero', 'net zero']),
    report: score(q, ['report', 'audit', 'faculty', 'principal', 'executive']),
  };
  const topIntent = (Object.entries(intents) as [keyof typeof intents, number][])
    .sort((a, b) => b[1] - a[1])[0];

  let answer = '';
  let actions: string[] = [];

  if (topIntent[1] > 0 && topIntent[0] === 'waste') {
    const total = MOCK_WASTAGE.reduce((s, w) => s + w.estimated_monthly_cost_inr, 0);
    answer =
      `Highest avoidable cost: **${topWaste.building_name}** — ${topWaste.description}.\n\n` +
      `• Rate: **${topWaste.wasted_quantity_per_hour} ${topWaste.unit}**\n` +
      `• Monthly impact: **₹${topWaste.estimated_monthly_cost_inr.toLocaleString('en-IN')}**\n` +
      `• Cause: ${topWaste.primary_cause}\n` +
      `• Action: ${topWaste.recommended_action}\n\n` +
      `All three wastage sources total **₹${total.toLocaleString('en-IN')}/month**. Campus avoidable power: **${MOCK_TELEMETRY.wastage.avoidable_power_kw} kW**.`;
    actions = ['Which building wastes the most electricity?', 'Open Wastage Detector', 'Show Marri Nilayam on 3D Twin'];
  } else if (topIntent[1] > 0 && topIntent[0] === 'solar') {
    answer =
      `Rooftop solar is generating **${MOCK_TELEMETRY.power.solar_generation_kw} kW** of **${MOCK_TELEMETRY.power.solar_capacity_kw} kWp** ` +
      `(**${MOCK_TELEMETRY.power.solar_coverage_pct}%** of live demand).\n\n` +
      `CO₂ avoided this hour: **${MOCK_TELEMETRY.environment.co2_avoided_by_solar_kg_hr} kg**. ` +
      `Largest arrays: CIET (${MOCK_BUILDINGS.find(b => b.id === 'ciet')?.solar_capacity_kw} kWp) and Sports (${MOCK_BUILDINGS.find(b => b.id === 'sports')?.solar_capacity_kw} kWp).\n\n` +
      `Expansion to ~6 MWp in What-If Studio typically pays back in ~2–3 years.`;
    actions = ['Open Solar PV view', 'How much could HVAC −15% save?', 'Show Net-Zero timeline'];
  } else if (topIntent[1] > 0 && topIntent[0] === 'asset') {
    answer =
      `Priority asset: **Transformer TR-02** (33 kV substation) — CRITICAL at **118°C** vs 95°C limit.\n\n` +
      `Also flagged:\n` +
      `• Marri Nilayam booster pump — overnight **138 LPM** leak signature\n` +
      `• Auditorium AV rack — **38.7 kW** with zero occupancy\n\n` +
      `Immediate: shed TR-02 load, inspect cooling/oil, IR thermography this shift.`;
    actions = ['Open Assets inventory', 'Acknowledge TR-02 alert', 'Fly to Substation'];
  } else if (topIntent[1] > 0 && topIntent[0] === 'hvac') {
    const sim = runLocalWhatIf({
      lighting_led_upgrade_pct: 0, hvac_setpoint_adjustment_c: 0, hvac_runtime_reduction_pct: 15,
      solar_capacity_increase_kw: 0, occupancy_shift_pct: 0, rainwater_harvesting_expansion_pct: 0,
      replace_inefficient_equipment: false,
    });
    answer =
      `HVAC runtime **−15%** campus-wide saves about **${sim.energy_savings_mwh_yr.toLocaleString('en-IN')} MWh/yr** ` +
      `(**₹${sim.financial_savings_inr_yr.toLocaleString('en-IN')}/yr**, **${sim.co2_reduction_tons_yr} tCO₂e**).\n\n` +
      `Estimated BMS programming CAPEX **₹${sim.estimated_capex_inr.toLocaleString('en-IN')}**, payback **~${sim.payback_period_years} years**.\n` +
      `Open What-If Studio to stack LED + solar + rainwater for a Net-Zero 2028 package.`;
    actions = ['Open What-If Studio', 'Apply Net-Zero blueprint', 'View Optimization'];
  } else if (topIntent[1] > 0 && topIntent[0] === 'water') {
    answer =
      `Live water: **${MOCK_TELEMETRY.water.total_flow_lpm} LPM**. Overhead tanks **${MOCK_TELEMETRY.water.overhead_tank_pct}%**, ` +
      `sump **${MOCK_TELEMETRY.water.underground_sump_pct}%**, rainwater harvested **${MOCK_TELEMETRY.water.rainwater_harvested_kl} kL**.\n\n` +
      `Critical: Marri Nilayam overnight **138 LPM** vs ~12 LPM normal — about **₹24,600/month**. Hostels dominate daily draw.`;
    actions = ['Open Water view', 'Open Wastage Detector', 'Show Marri Nilayam on 3D Twin'];
  } else if (topIntent[1] > 0 && topIntent[0] === 'occ') {
    answer =
      `Campus occupancy **${MOCK_TELEMETRY.occupancy.total_occupancy.toLocaleString('en-IN')} / ${MOCK_TELEMETRY.occupancy.total_capacity.toLocaleString('en-IN')}** ` +
      `(**${MOCK_TELEMETRY.occupancy.utilization_pct}%**).\n\n` +
      `Highest: CIET ${MOCK_BUILDINGS.find(b => b.id === 'ciet')?.current_occupancy} and Marri Nilayam ${MOCK_BUILDINGS.find(b => b.id === 'hostelb')?.current_occupancy}. ` +
      `Auditorium is empty but still drawing idle AV power.`;
    actions = ['Open Occupancy view', 'Why is the CSE CIET Tower consuming so much power?', 'Open Wastage Detector'];
  } else if (topIntent[1] > 0 && topIntent[0] === 'whatif') {
    const sim = runLocalWhatIf({
      lighting_led_upgrade_pct: 100, hvac_setpoint_adjustment_c: 2, hvac_runtime_reduction_pct: 15,
      solar_capacity_increase_kw: 1500, occupancy_shift_pct: 0, rainwater_harvesting_expansion_pct: 80,
      replace_inefficient_equipment: true,
    });
    answer =
      `Net-Zero 2028 blueprint (LED 100% + HVAC + 1.5 MWp solar + RWH + VFDs):\n\n` +
      `• Energy saved **${sim.energy_savings_mwh_yr.toLocaleString('en-IN')} MWh/yr (${sim.energy_savings_pct}%)**\n` +
      `• Savings **₹${sim.financial_savings_inr_yr.toLocaleString('en-IN')}/yr** · CO₂ **${sim.co2_reduction_tons_yr} t**\n` +
      `• CAPEX **₹${sim.estimated_capex_inr.toLocaleString('en-IN')}** · payback **${sim.payback_period_years} yr**\n` +
      `• Grid dependency **−${sim.grid_dependency_reduction_pct}%**`;
    actions = ['Open What-If Studio', 'Apply Net-Zero blueprint', 'Open Executive Report'];
  } else if (topIntent[1] > 0 && topIntent[0] === 'report') {
    answer =
      `Campus health **${MOCK_TELEMETRY.health_score.overall_score}/100 (${MOCK_TELEMETRY.health_score.grade})** — ${MOCK_TELEMETRY.health_score.status}.\n\n` +
      `${MOCK_TELEMETRY.health_score.explanation.join(' ')}\n\n` +
      `Print the Executive Report for circulation to Principal / Facilities.`;
    actions = ['Open Executive Report', 'Open Command Center', 'Which assets require maintenance?'];
  } else if (named || (topIntent[1] > 0 && topIntent[0] === 'energy' && ctx)) {
    const b = named || ctx || topEnergy;
    answer =
      `**${b.name}** (${b.code})\n` +
      `• Power **${b.energy_consumption_kw} kW** · Occupancy **${b.current_occupancy}/${b.max_capacity} (${b.occupancy_rate_pct}%)**\n` +
      `• HVAC ${b.hvac_load_kw} kW · Lighting ${b.lighting_load_kw} kW · Equipment ${b.equipment_load_kw} kW\n` +
      `• Solar **${b.current_solar_gen_kw}/${b.solar_capacity_kw} kW** · Efficiency **${b.energy_efficiency_score}/100**\n` +
      `• Maintenance **${b.maintenance_status}** · Hours ${b.operating_hours}`;
    actions = ['Fly to selected building', 'Enter building floors', 'Open Energy view'];
  } else if (topIntent[1] > 0 && topIntent[0] === 'energy') {
    answer =
      `**${topEnergy.name}** is the largest live consumer at **${topEnergy.energy_consumption_kw} kW** ` +
      `(occupancy ${topEnergy.occupancy_rate_pct}%, rooftop solar ${topEnergy.current_solar_gen_kw} kW).\n\n` +
      `Campus total **${MOCK_TELEMETRY.power.total_consumption_kw} kW** — grid **${MOCK_TELEMETRY.power.grid_draw_kw} kW**, solar **${MOCK_TELEMETRY.power.solar_generation_kw} kW**, ` +
      `BESS SoC **${MOCK_TELEMETRY.power.battery_soc_pct}%**.\n\n` +
      `Primary lever on CIET: occupancy-linked HVAC after lab hours.`;
    actions = ['Fly to CIET Tower', 'Open Energy view', 'How much could HVAC −15% save?'];
  } else if (ctx) {
    answer =
      `Context building **${ctx.name}** (${ctx.code}):\n` +
      `• Power **${ctx.energy_consumption_kw} kW** · Occupancy **${ctx.current_occupancy}/${ctx.max_capacity}**\n` +
      `• Solar **${ctx.current_solar_gen_kw}/${ctx.solar_capacity_kw} kW** · Efficiency **${ctx.energy_efficiency_score}**\n` +
      `• Maintenance: **${ctx.maintenance_status}**`;
    actions = ['Enter building floors', 'Open Energy view', 'Which building wastes the most electricity?'];
  } else {
    answer =
      `MLRIT Dundigal snapshot — **${MOCK_TELEMETRY.power.total_consumption_kw} kW** demand · ` +
      `**${MOCK_TELEMETRY.power.solar_generation_kw} kW** solar · **${MOCK_TELEMETRY.occupancy.total_occupancy.toLocaleString('en-IN')}** occupants · ` +
      `Health **${MOCK_TELEMETRY.health_score.overall_score}/100 (${MOCK_TELEMETRY.health_score.grade})**.\n\n` +
      `${MOCK_TELEMETRY.health_score.explanation.join(' ')}\n\n` +
      `Ask about wastage, CIET power, solar ROI, TR-02, water leaks, or HVAC savings.`;
    actions = [
      'Which building wastes the most electricity?',
      'Why is the CSE CIET Tower consuming so much power?',
      'How much could HVAC −15% save?',
    ];
  }

  return {
    answer,
    citations: [
      'MLRIT Digital Twin telemetry bus (live simulation)',
      'Campus energy & water physics model',
      'Facilities anomaly & ROI engine',
    ],
    suggested_actions: actions,
    confidence: 0.93,
    data_source: 'SIMULATED',
  };
}

export function acknowledgeLocalAlert(alerts: Alert[], id: string): Alert[] {
  return alerts.map(a => a.id === id ? { ...a, status: 'ACKNOWLEDGED' as const } : a);
}
