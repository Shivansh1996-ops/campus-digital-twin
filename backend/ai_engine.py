from typing import Dict, Any, List
from models import AIQueryRequest, AIQueryResponse, DataSource
from simulation import simulation_instance

def handle_ai_query(req: AIQueryRequest) -> AIQueryResponse:
    q = req.query.lower().strip()
    sim = simulation_instance
    snap = sim.get_live_snapshot()
    buildings = sim.buildings
    wastage = sim.wastage_items
    alerts = sim.alerts
    recs = sim.recommendations

    grounded_data: Dict[str, Any] = {}
    citations: List[str] = []
    suggested_actions: List[str] = []
    answer = ""
    confidence = 0.95

    if "waste" in q or "wasting" in q or "avoidable" in q:
        top_waste = sorted(wastage, key=lambda w: w.estimated_monthly_kwh, reverse=True)
        top_item = top_waste[0]
        answer = (
            f"Based on real-time anomaly detection, the **{top_item.building_name}** ({top_item.location}) "
            f"exhibits the largest energy wastage footprint, consuming an estimated **{top_item.wasted_quantity_per_hour} kWh/hr** "
            f"({top_item.estimated_monthly_kwh:,.0f} kWh/month) of avoidable power.\n\n"
            f"**Primary Cause:** {top_item.primary_cause}\n"
            f"**Financial Impact:** Estimated ₹{top_item.estimated_monthly_cost_inr:,.0f}/month with {top_item.estimated_monthly_co2_kg:,.1f} kg CO2 emissions.\n\n"
            f"Additionally, **Hostel Alpha** is experiencing a continuous potable water leak of ~7,200 L/hr (~₹52,800/mo impact)."
        )
        grounded_data = {
            "top_energy_wastage": top_item.dict(),
            "all_wastage_items": [w.dict() for w in wastage]
        }
        citations = [
            f"[ESTIMATED DATA] Wastage telemetry audit record #{top_item.id}",
            "[SIMULATED SENSOR] IoT Sub-meter reading in Engineering Room 204",
            "[SIMULATED SENSOR] Hostel Alpha Hydro-pneumatic booster flow sensor P-01"
        ]
        suggested_actions = [
            "Trigger automated BMS HVAC setback for Room 204",
            "Dispatch plumbing work order to isolate Hostel Alpha Wing B riser",
            "View Wastage Intelligence dashboard"
        ]

    elif "engineering" in q or "b-eng" in q:
        eng_b = next((b for b in buildings if b.id == "b-eng"), None)
        if eng_b:
            answer = (
                f"**Apex Engineering & Computing Complex** is currently drawing **{eng_b.energy_consumption_kw:.1f} kW** "
                f"(HVAC: {eng_b.hvac_load_kw:.1f} kW, Lighting: {eng_b.lighting_load_kw:.1f} kW, Lab Equipment: {eng_b.equipment_load_kw:.1f} kW).\n\n"
                f"**Root Causes for High Draw:**\n"
                f"1. **Rooftop Chiller CH-01 Condenser Fouling:** Approach temperature has increased by 1.2°C, degrading COP efficiency by 4.2%.\n"
                f"2. **Room 204 Anomaly:** HVAC active at 20.5°C and 480 Lux lighting energized despite 0 occupancy.\n"
                f"3. **High Density Computing:** AI and Robotics clusters in floors 1 and 2 account for ~180 kW continuous baseline.\n\n"
                f"On-site rooftop solar is currently mitigating **{eng_b.current_solar_gen_kw:.1f} kW** of this load."
            )
            grounded_data = {
                "building": eng_b.dict(),
                "related_alerts": [a.dict() for a in alerts if a.building_id == "b-eng"]
            }
            citations = [
                "[SIMULATED DATA] Building Digital Twin sub-panel EDP-1",
                "[SIMULATED DATA] Rooftop Chiller CH-01 telemetry (600 TR)",
                "[ESTIMATED DATA] Energy Wastage Record WST-01"
            ]
            suggested_actions = [
                "Open Engineering Block Digital Twin 3D view",
                "Execute Chiller condenser cleaning schedule",
                "Inspect Floor 2 Room 204 in 3D"
            ]

    elif "low occupancy" in q or "overcrowded" in q or "utilization" in q:
        discrepancies = []
        for b in buildings:
            if b.occupancy_rate_pct < 25.0 and b.energy_consumption_kw > 150.0:
                discrepancies.append(b)
        
        disc_text = "\n".join([f"- **{b.name}**: Occupancy at only **{b.occupancy_rate_pct}%** ({b.current_occupancy}/{b.max_capacity} people), yet drawing **{b.energy_consumption_kw:.1f} kW**." for b in discrepancies])
        answer = (
            f"The following facilities show high energy consumption despite low occupancy levels:\n\n"
            f"{disc_text}\n\n"
            f"**System Recommendation:** Implementing automated occupancy-based setbacks across these blocks will recover an estimated **142,000 kWh/year**."
        )
        grounded_data = {"discrepancies": [b.dict() for b in discrepancies]}
        citations = [
            "[SIMULATED DATA] Campus PIR and Optical Occupancy Matrix",
            "[SIMULATED DATA] Substation 11kV Feeder telemetry"
        ]
        suggested_actions = [
            "Enable Auto-Setback Schedule in Simulation",
            "Filter 3D view by Occupancy Heatmap"
        ]

    elif "hvac" in q and ("15%" in q or "save" in q or "reduce" in q):
        # 15% reduction calculation
        hvac_total_kw = sum(b.hvac_load_kw for b in buildings)
        saved_kw = hvac_total_kw * 0.15
        saved_kwh_yr = saved_kw * 14.0 * 365.0
        saved_cost = saved_kwh_yr * 9.0 # 9 INR/kWh
        saved_co2 = (saved_kwh_yr * 0.71) / 1000.0

        answer = (
            f"Reducing campus HVAC runtime or load by **15%** yields the following estimated results:\n\n"
            f"- **Instantaneous Power Reduction:** **{saved_kw:.1f} kW** (from current {hvac_total_kw:.1f} kW)\n"
            f"- **Annual Energy Avoided:** **{saved_kwh_yr:,.0f} kWh** ({saved_kwh_yr/1000:,.1f} MWh)\n"
            f"- **Financial Savings:** **₹{saved_cost:,.2f} / year**\n"
            f"- **Carbon Emissions Mitigated:** **{saved_co2:,.1f} metric tons of CO2 / year**\n\n"
            f"This can be accomplished without human discomfort by raising classroom chilled water setpoints from 21.5°C to 23.5°C and cycling AHU variable frequency drives."
        )
        grounded_data = {
            "total_hvac_kw": hvac_total_kw,
            "saved_kw": saved_kw,
            "annual_kwh": saved_kwh_yr,
            "annual_cost_inr": saved_cost
        }
        citations = [
            "[PREDICTED DATA] Digital Twin What-If Thermal Simulation Model",
            "[SIMULATED DATA] Active Chiller Plant telemetry"
        ]
        suggested_actions = [
            "Launch What-If Simulation Studio",
            "Adjust HVAC Setpoint slider in What-If Studio"
        ]

    elif "maintenance" in q or "asset" in q or "fault" in q:
        fault_assets = [a for a in sim.assets if a.status in ["WARNING", "FAULT"]]
        fault_text = "\n".join([f"- **{a.name}** ({a.building_id}) — Status: **{a.status}** (Health: {a.health_score}/100). Next Service was due: {a.next_service_date}." for a in fault_assets])
        answer = (
            f"Currently, **{len(fault_assets)} critical assets** require immediate maintenance intervention:\n\n"
            f"{fault_text}\n\n"
            f"**High Priority Alert:** Transformer T2 is experiencing high harmonic distortion (THD 5.8%) and 86.4°C winding temp. Booster Pump P-01 in Hostel Alpha shows 7.4 mm/s vibration and continuous unthrottled pumping."
        )
        grounded_data = {"fault_assets": [a.dict() for a in fault_assets]}
        citations = [
            "[SIMULATED DATA] Asset Maintenance Log & Vibration FFT Telemetry",
            "[SIMULATED DATA] Substation Diagnostic SCADA bus"
        ]
        suggested_actions = [
            "View Asset Inventory & Maintenance Records",
            "Locate Transformer T2 in 3D"
        ]

    elif "opportunity" in q or "recommendation" in q or "top" in q:
        top_recs = sorted(recs, key=lambda r: r.expected_financial_savings_inr_yr, reverse=True)[:4]
        rec_text = "\n".join([f"{i+1}. **{r.title}**\n   - Savings: ₹{r.expected_financial_savings_inr_yr:,.0f}/yr ({r.expected_energy_savings_kwh_yr:,.0f} kWh)\n   - Payback: {r.payback_period_months} months | Priority: {r.priority}" for i, r in enumerate(top_recs)])
        answer = (
            f"Here are the top campus optimization opportunities ranked by financial and carbon return:\n\n"
            f"{rec_text}\n\n"
            f"Combined potential: **₹22.1 Million annual savings** and **1,646 tons of CO2 reduction**."
        )
        grounded_data = {"top_recommendations": [r.dict() for r in top_recs]}
        citations = [
            "[PREDICTED DATA] AI Optimization Heuristics Engine v2.4",
            "[ESTIMATED DATA] Campus Energy Audit Tariff Standard @ ₹9.0/kWh"
        ]
        suggested_actions = [
            "Review AI Recommendations Panel",
            "Simulate these recommendations in What-If Studio"
        ]

    else:
        # General campus status query
        answer = (
            f"**Campus Intelligence Status Report ({snap['simulated_time']}):**\n\n"
            f"- **Overall Health Score:** {snap['health_score']['overall_score']}/100 ({snap['health_score']['grade']} - {snap['health_score']['status']})\n"
            f"- **Power Demand:** {snap['power']['total_consumption_kw']:.1f} kW (Solar Generating: {snap['power']['solar_generation_kw']:.1f} kW, covering {snap['power']['solar_coverage_pct']}% of load)\n"
            f"- **Water Flow:** {snap['water']['total_flow_lpm']:.1f} L/min (Overhead Tank: {snap['water']['overhead_tank_pct']}%)\n"
            f"- **Campus Occupancy:** {snap['occupancy']['total_occupancy']:,} / {snap['occupancy']['total_capacity']:,} people ({snap['occupancy']['utilization_pct']}%)\n"
            f"- **Active Alerts:** {snap['alerts']['total_active']} active ({snap['alerts']['critical']} Critical, {snap['alerts']['high']} High)\n\n"
            f"Ask me about specific buildings (e.g. 'Engineering Block'), energy wastage, solar generation, or what-if scenarios."
        )
        grounded_data = snap
        citations = [
            "[SIMULATED DATA] Central Campus Telemetry Aggregator",
            "[ESTIMATED DATA] Campus Health Index"
        ]
        suggested_actions = [
            "Ask: 'Which building wastes the most electricity?'",
            "Ask: 'Which assets require maintenance?'",
            "Ask: 'How much electricity could we save by reducing HVAC usage by 15%?'"
        ]

    return AIQueryResponse(
        query=req.query,
        answer=answer,
        confidence=confidence,
        grounded_data=grounded_data,
        citations=citations,
        suggested_actions=suggested_actions,
        data_source=DataSource.PREDICTED
    )
