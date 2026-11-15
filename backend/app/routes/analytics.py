from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from typing import Optional, List, Dict, Any
from datetime import date, datetime, timedelta
from ..database import get_db, get_db_status
from ..models import WasteRecord, FoodInventory, SurplusFood

router = APIRouter(prefix="/api/analytics", tags=["Waste Analytics & Dashboard"])

@router.get("/dashboard-stats")
def get_dashboard_stats(db: Session = Depends(get_db)):
    today = date.today()
    
    # Check if there are records for today. If not, use the latest recorded date from waste_records
    latest_record = db.query(WasteRecord).order_by(WasteRecord.recorded_date.desc()).first()
    target_date = latest_record.recorded_date if latest_record else today

    # Target date metrics
    today_records = db.query(WasteRecord).filter(WasteRecord.recorded_date == target_date).all()
    
    total_prep_today = sum(r.quantity_prepared for r in today_records)
    total_serv_today = sum(r.quantity_served for r in today_records)
    total_waste_today = sum(r.quantity_waste for r in today_records)
    waste_pct_today = round((total_waste_today / total_prep_today * 100), 2) if total_prep_today > 0 else 0.0

    # Baseline comparison (previous 7 days average waste percentage)
    prev_records = db.query(WasteRecord).filter(
        WasteRecord.recorded_date < target_date,
        WasteRecord.recorded_date >= target_date - timedelta(days=7)
    ).all()

    prev_prep = sum(r.quantity_prepared for r in prev_records)
    prev_waste = sum(r.quantity_waste for r in prev_records)
    prev_waste_pct = (prev_waste / prev_prep * 100) if prev_prep > 0 else 22.5 # benchmark average
    
    # Reduction rate: ((prev% - today%) / prev%) * 100
    waste_reduction_rate = round(max(0.0, prev_waste_pct - waste_pct_today), 1)

    # Surplus available
    active_surplus = db.query(SurplusFood).filter(SurplusFood.status == "Available").all()
    surplus_kg = sum(s.available_quantity for s in active_surplus)

    # All-time metrics
    all_records = db.query(WasteRecord).all()
    all_prep = sum(r.quantity_prepared for r in all_records)
    all_waste = sum(r.quantity_waste for r in all_records)
    overall_waste_pct = round((all_waste / all_prep * 100), 2) if all_prep > 0 else 0.0

    db_status = get_db_status()

    return {
        "target_date": target_date.isoformat(),
        "total_prepared_today": round(total_prep_today, 2),
        "total_served_today": round(total_serv_today, 2),
        "total_wasted_today": round(total_waste_today, 2),
        "waste_percentage_today": waste_pct_today,
        "waste_reduction_rate": waste_reduction_rate,
        "food_saved_kg": round(max(0.0, (prev_waste_pct / 100.0 * total_prep_today) - total_waste_today), 1),
        "surplus_available_kg": round(surplus_kg, 2),
        "surplus_items_count": len(active_surplus),
        "overall_prep_all_time": round(all_prep, 2),
        "overall_waste_all_time": round(all_waste, 2),
        "overall_waste_pct": overall_waste_pct,
        "db_engine": db_status["engine"]
    }

@router.get("/daily-trends")
def get_daily_trends(
    days: int = Query(7, ge=3, le=60, description="Number of days to analyze"),
    db: Session = Depends(get_db)
):
    """Returns daily prep vs served vs waste for chart rendering."""
    # Group by recorded_date
    results = (
        db.query(
            WasteRecord.recorded_date,
            func.sum(WasteRecord.quantity_prepared).label("prepared"),
            func.sum(WasteRecord.quantity_served).label("served"),
            func.sum(WasteRecord.quantity_waste).label("wasted")
        )
        .group_by(WasteRecord.recorded_date)
        .order_by(WasteRecord.recorded_date.asc())
        .all()
    )

    data = []
    # Take the latest N days
    recent = results[-days:] if len(results) > days else results
    for row in recent:
        p = round(float(row.prepared or 0), 2)
        s = round(float(row.served or 0), 2)
        w = round(float(row.wasted or 0), 2)
        pct = round((w / p * 100), 2) if p > 0 else 0.0
        data.append({
            "date": row.recorded_date.strftime("%b %d"),
            "full_date": row.recorded_date.isoformat(),
            "prepared": p,
            "served": s,
            "wasted": w,
            "waste_percentage": pct
        })

    return data

@router.get("/by-category")
def get_waste_by_category(db: Session = Depends(get_db)):
    """Category breakdown for Pie Chart."""
    results = (
        db.query(
            WasteRecord.category,
            func.sum(WasteRecord.quantity_waste).label("total_waste"),
            func.sum(WasteRecord.quantity_prepared).label("total_prepared")
        )
        .group_by(WasteRecord.category)
        .order_by(desc("total_waste"))
        .all()
    )

    data = []
    for r in results:
        waste = round(float(r.total_waste or 0), 2)
        prep = round(float(r.total_prepared or 0), 2)
        pct = round((waste / prep * 100), 1) if prep > 0 else 0.0
        data.append({
            "name": r.category,
            "value": waste,
            "prepared": prep,
            "waste_pct": pct
        })
    return data

@router.get("/by-meal-type")
def get_waste_by_meal_type(db: Session = Depends(get_db)):
    """Meal type breakdown (Breakfast, Lunch, Snacks, Dinner)."""
    meal_order = ["Breakfast", "Lunch", "Snacks", "Dinner"]
    results = (
        db.query(
            WasteRecord.meal_type,
            func.sum(WasteRecord.quantity_prepared).label("prepared"),
            func.sum(WasteRecord.quantity_served).label("served"),
            func.sum(WasteRecord.quantity_waste).label("wasted")
        )
        .group_by(WasteRecord.meal_type)
        .all()
    )

    lookup = {r.meal_type: r for r in results}
    data = []
    for mt in meal_order:
        r = lookup.get(mt)
        p = round(float(r.prepared or 0), 2) if r else 0.0
        s = round(float(r.served or 0), 2) if r else 0.0
        w = round(float(r.wasted or 0), 2) if r else 0.0
        pct = round((w / p * 100), 1) if p > 0 else 0.0
        data.append({
            "meal_type": mt,
            "prepared": p,
            "served": s,
            "wasted": w,
            "waste_pct": pct
        })
    return data

@router.get("/top-wasted-items")
def get_top_wasted_items(limit: int = Query(6, ge=3, le=20), db: Session = Depends(get_db)):
    """Top most wasted items with cumulative kg and average percentage."""
    results = (
        db.query(
            WasteRecord.food_name,
            WasteRecord.category,
            func.sum(WasteRecord.quantity_waste).label("total_waste"),
            func.sum(WasteRecord.quantity_prepared).label("total_prepared"),
            func.avg(WasteRecord.waste_percentage).label("avg_pct")
        )
        .group_by(WasteRecord.food_name, WasteRecord.category)
        .order_by(desc("total_waste"))
        .limit(limit)
        .all()
    )

    data = []
    for r in results:
        w = round(float(r.total_waste or 0), 2)
        p = round(float(r.total_prepared or 0), 2)
        data.append({
            "food_name": r.food_name,
            "category": r.category,
            "total_wasted": w,
            "total_prepared": p,
            "avg_waste_pct": round(float(r.avg_pct or 0), 1)
        })
    return data

@router.get("/waste-reasons")
def get_waste_reasons_breakdown(db: Session = Depends(get_db)):
    """Breakdown of reasons why food is wasted."""
    results = (
        db.query(
            WasteRecord.waste_reason,
            func.sum(WasteRecord.quantity_waste).label("total_waste"),
            func.count(WasteRecord.id).label("occurrences")
        )
        .group_by(WasteRecord.waste_reason)
        .order_by(desc("total_waste"))
        .all()
    )

    total_w = sum(float(r.total_waste or 0) for r in results)
    data = []
    for r in results:
        w = round(float(r.total_waste or 0), 2)
        pct = round((w / total_w * 100), 1) if total_w > 0 else 0.0
        data.append({
            "reason": r.waste_reason,
            "waste_kg": w,
            "occurrences": r.occurrences,
            "percentage": pct
        })
    return data

@router.get("/recent-activities")
def get_recent_activities(limit: int = Query(5, ge=3, le=15), db: Session = Depends(get_db)):
    """Latest recorded activities across inventory, waste, and surplus."""
    waste_records = db.query(WasteRecord).order_by(WasteRecord.created_at.desc()).limit(limit).all()
    
    activities = []
    for wr in waste_records:
        activities.append({
            "id": f"waste_{wr.id}",
            "type": "waste_recorded",
            "title": f"Waste logged for {wr.food_name}",
            "subtitle": f"{wr.quantity_waste} kg wasted ({wr.waste_percentage}%) in {wr.meal_type} due to '{wr.waste_reason}'",
            "time": wr.recorded_date.strftime("%d %b, %Y"),
            "badge": "High Waste" if wr.waste_percentage > 20 else "Normal",
            "badge_color": "danger" if wr.waste_percentage > 20 else "info"
        })
    return activities
