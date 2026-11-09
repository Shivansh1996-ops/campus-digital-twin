from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, Response
from typing import List, Optional, Dict, Any
import asyncio
import csv
import io
import json

from models import (
    Building, Asset, Alert, WastageItem, Recommendation,
    WhatIfRequest, WhatIfResponse, AIQueryRequest, AIQueryResponse,
    CampusSpatialMetrics, DataSource, AlertStatus
)
from simulation import simulation_instance
from what_if_engine import run_what_if_simulation
from ai_engine import handle_ai_query

app = FastAPI(
    title="Apex Smart Campus Digital Twin API",
    description="Enterprise-grade Digital Twin & Campus Intelligence Platform Backend",
    version="1.0.0"
)

# Enable CORS for frontend Vite dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Background tick loop
@app.on_event("startup")
async def startup_event():
    async def simulation_loop():
        while True:
            # Advance simulation by 1 second every real second
            simulation_instance.update_tick(1.0)
            await asyncio.sleep(1.0)
    asyncio.create_task(simulation_loop())

@app.get("/api/campus")
async def get_campus():
    sim = simulation_instance
    snap = sim.get_live_snapshot()
    return {
        "campus_name": "Marri Laxman Reddy Institute of Technology (MLRIT)",
        "campus_code": "MLRIT-HYD",
        "location": {
            "name": "Dundigal, Gandimaisamma, Hyderabad, Telangana",
            "lat": 17.5997,
            "lng": 78.4300,
            "altitude_m": 545.0
        },
        "spatial_metrics": sim.spatial_metrics.dict(),
        "live_metrics": snap,
        "active_alerts_count": snap["alerts"]["total_active"],
        "critical_alerts_count": snap["alerts"]["critical"],
        "simulation_mode": True,
        "data_source": DataSource.SIMULATED.value
    }

@app.get("/api/buildings", response_model=List[Building])
async def get_buildings():
    return simulation_instance.buildings

@app.get("/api/buildings/{building_id}")
async def get_building(building_id: str):
    for b in simulation_instance.buildings:
        if b.id == building_id:
            return b
    raise HTTPException(status_code=404, detail="Building not found")

@app.get("/api/assets", response_model=List[Asset])
async def get_assets(building_id: Optional[str] = None, category: Optional[str] = None):
    assets = simulation_instance.assets
    if building_id:
        assets = [a for a in assets if a.building_id == building_id]
    if category:
        assets = [a for a in assets if a.category.value == category]
    return assets

@app.get("/api/telemetry/live")
async def get_live_telemetry():
    return simulation_instance.get_live_snapshot()

@app.get("/api/telemetry/history")
async def get_telemetry_history():
    return simulation_instance.get_24h_history()

@app.get("/api/energy-flow")
async def get_energy_flow():
    return simulation_instance.get_energy_flow_graph()

@app.get("/api/alerts", response_model=List[Alert])
async def get_alerts():
    return simulation_instance.alerts

@app.post("/api/alerts/{alert_id}/acknowledge")
async def acknowledge_alert(alert_id: str):
    for a in simulation_instance.alerts:
        if a.id == alert_id:
            a.status = AlertStatus.ACKNOWLEDGED
            return {"status": "success", "alert": a}
    raise HTTPException(status_code=404, detail="Alert not found")

@app.post("/api/alerts/{alert_id}/resolve")
async def resolve_alert(alert_id: str):
    for a in simulation_instance.alerts:
        if a.id == alert_id:
            a.status = AlertStatus.RESOLVED
            return {"status": "success", "alert": a}
    raise HTTPException(status_code=404, detail="Alert not found")

@app.get("/api/wastage", response_model=List[WastageItem])
async def get_wastage():
    return simulation_instance.wastage_items

@app.get("/api/recommendations", response_model=List[Recommendation])
async def get_recommendations():
    return simulation_instance.recommendations

@app.post("/api/simulation/time")
async def set_simulation_time(payload: Dict[str, Any]):
    hour = payload.get("hour")
    multiplier = payload.get("multiplier")
    paused = payload.get("paused")
    
    if hour is not None:
        simulation_instance.set_time(float(hour))
    if multiplier is not None:
        simulation_instance.time_multiplier = float(multiplier)
    if paused is not None:
        simulation_instance.is_paused = bool(paused)
        
    return {
        "status": "updated",
        "hour": simulation_instance.simulated_hour,
        "multiplier": simulation_instance.time_multiplier,
        "is_paused": simulation_instance.is_paused
    }

@app.post("/api/simulation/what-if", response_model=WhatIfResponse)
async def simulate_what_if(req: WhatIfRequest):
    return run_what_if_simulation(req)

@app.post("/api/ai/query", response_model=AIQueryResponse)
async def ai_query_endpoint(req: AIQueryRequest):
    return handle_ai_query(req)

@app.get("/api/timeline")
async def get_timeline_data():
    """Historical and projected campus trends across 2024 to 2028."""
    return [
        {
            "year": 2024,
            "label": "2024 (Historical Baseline)",
            "energy_consumption_mwh": 21400.0,
            "solar_generation_mwh": 2100.0,
            "renewable_pct": 9.8,
            "water_consumption_kl": 640000.0,
            "carbon_emissions_tons": 13700.0,
            "health_score": 68,
            "total_capex_spent_inr": 12000000.0,
            "status": "Pre-Digital Twin"
        },
        {
            "year": 2025,
            "label": "2025 (Initial Retrofits)",
            "energy_consumption_mwh": 19800.0,
            "solar_generation_mwh": 3800.0,
            "renewable_pct": 19.2,
            "water_consumption_kl": 590000.0,
            "carbon_emissions_tons": 11360.0,
            "health_score": 77,
            "total_capex_spent_inr": 34000000.0,
            "status": "BMS Sensor Deployment"
        },
        {
            "year": 2026,
            "label": "2026 (Current Twin Operational)",
            "energy_consumption_mwh": 18250.0,
            "solar_generation_mwh": 5600.0,
            "renewable_pct": 30.7,
            "water_consumption_kl": 520000.0,
            "carbon_emissions_tons": 8980.0,
            "health_score": 86,
            "total_capex_spent_inr": 48000000.0,
            "status": "Autonomous AI Tuning"
        },
        {
            "year": 2027,
            "label": "2027 (Projected Roadmap)",
            "energy_consumption_mwh": 15900.0,
            "solar_generation_mwh": 7400.0,
            "renewable_pct": 46.5,
            "water_consumption_kl": 460000.0,
            "carbon_emissions_tons": 6035.0,
            "health_score": 92,
            "total_capex_spent_inr": 28000000.0,
            "status": "Target: Microgrid Self-Sufficiency"
        },
        {
            "year": 2028,
            "label": "2028 (Projected Net-Zero Target)",
            "energy_consumption_mwh": 14100.0,
            "solar_generation_mwh": 9200.0,
            "renewable_pct": 65.2,
            "water_consumption_kl": 410000.0,
            "carbon_emissions_tons": 3480.0,
            "health_score": 96,
            "total_capex_spent_inr": 22000000.0,
            "status": "Target: Zero-Carbon Campus"
        }
    ]

@app.get("/api/reports/executive")
async def generate_executive_report():
    sim = simulation_instance
    snap = sim.get_live_snapshot()
    return {
        "report_id": "REP-2026-Q4-CAMPUS-AUDIT",
        "generated_at": snap["timestamp"],
        "campus_title": "Apex Institute of Science & Technology — Digital Twin Audit",
        "executive_summary": (
            "Apex Global Campus operates 12 primary facilities spanning 142.5 hectares. "
            "Real-time digital twin analytics record a campus power demand of "
            f"{snap['power']['total_consumption_kw']} kW, with on-site solar PV generating "
            f"{snap['power']['solar_generation_kw']} kW ({snap['power']['solar_coverage_pct']}% daytime load coverage). "
            f"Overall campus health score stands at {snap['health_score']['overall_score']}/100 ({snap['health_score']['grade']}). "
            f"Key operational risks include Transformer T2 thermal warning and a 145 LPM potable water leak in Hostel Alpha Wing B."
        ),
        "kpi_overview": {
            "health_score": snap["health_score"],
            "power": snap["power"],
            "water": snap["water"],
            "occupancy": snap["occupancy"],
            "environment": snap["environment"],
            "spatial": sim.spatial_metrics.dict()
        },
        "critical_anomalies": [a.dict() for a in sim.alerts if a.status == AlertStatus.ACTIVE],
        "energy_wastage_summary": [w.dict() for w in sim.wastage_items],
        "top_roi_recommendations": [r.dict() for r in sim.recommendations],
        "certifications": [
            {"standard": "ISO 50001", "status": "Compliant (Energy Management)"},
            {"standard": "IGBC Green Campus", "status": "Platinum Rating Aspirant"},
            {"standard": "ASHRAE 90.1", "status": "Exceeded by 14%"}
        ]
    }

@app.get("/api/admin/export/csv")
async def export_buildings_csv():
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Building ID", "Name", "Code", "Type", "Area (sqm)", "Floors", "Solar kW", "Current Power kW", "Occupancy", "Max Capacity", "Efficiency Score"])
    for b in simulation_instance.buildings:
        writer.writerow([b.id, b.name, b.code, b.type.value, b.total_area_sqm, b.floors_count, b.solar_capacity_kw, b.energy_consumption_kw, b.current_occupancy, b.max_capacity, b.energy_efficiency_score])
    
    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=campus_buildings_inventory.csv"}
    )

@app.get("/api/admin/export/json")
async def export_full_twin_json():
    sim = simulation_instance
    snap = sim.get_live_snapshot()
    data = {
        "export_date": snap["timestamp"],
        "campus_metrics": sim.spatial_metrics.dict(),
        "buildings": [b.dict() for b in sim.buildings],
        "assets": [a.dict() for a in sim.assets],
        "alerts": [a.dict() for a in sim.alerts],
        "wastage": [w.dict() for w in sim.wastage_items],
        "recommendations": [r.dict() for r in sim.recommendations]
    }
    return JSONResponse(content=data)

# Real-time WebSocket feed
@app.websocket("/ws/telemetry")
async def websocket_telemetry(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            snap = simulation_instance.get_live_snapshot()
            await websocket.send_json(snap)
            await asyncio.sleep(1.0)
    except WebSocketDisconnect:
        pass
