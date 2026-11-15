import csv
import io
from fastapi import APIRouter, Depends, Query, Response
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional
from datetime import date, datetime, timedelta
from ..database import get_db
from ..models import WasteRecord

router = APIRouter(prefix="/api/reports", tags=["Reports & Exports"])

@router.get("/summary")
def get_reports_summary(
    period: str = Query("weekly", description="daily, weekly, monthly, all"),
    meal_type: Optional[str] = Query(None),
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(WasteRecord)

    today = date.today()
    # If custom date range not given, filter by period
    if start_date and end_date:
        query = query.filter(WasteRecord.recorded_date >= start_date, WasteRecord.recorded_date <= end_date)
    elif period == "daily":
        # Find latest available date or today
        latest = db.query(func.max(WasteRecord.recorded_date)).scalar() or today
        query = query.filter(WasteRecord.recorded_date == latest)
    elif period == "weekly":
        latest = db.query(func.max(WasteRecord.recorded_date)).scalar() or today
        query = query.filter(WasteRecord.recorded_date >= latest - timedelta(days=7))
    elif period == "monthly":
        latest = db.query(func.max(WasteRecord.recorded_date)).scalar() or today
        query = query.filter(WasteRecord.recorded_date >= latest - timedelta(days=30))

    if meal_type and meal_type != "All":
        query = query.filter(WasteRecord.meal_type == meal_type)

    records = query.order_by(WasteRecord.recorded_date.desc()).all()

    total_prep = sum(r.quantity_prepared for r in records)
    total_serv = sum(r.quantity_served for r in records)
    total_waste = sum(r.quantity_waste for r in records)
    waste_pct = round((total_waste / total_prep * 100), 2) if total_prep > 0 else 0.0

    return {
        "period": period,
        "record_count": len(records),
        "total_prepared_kg": round(total_prep, 2),
        "total_served_kg": round(total_serv, 2),
        "total_wasted_kg": round(total_waste, 2),
        "waste_percentage": waste_pct,
        "records": [
            {
                "id": r.id,
                "food_name": r.food_name,
                "category": r.category,
                "meal_type": r.meal_type,
                "date": r.recorded_date.isoformat(),
                "quantity_prepared": r.quantity_prepared,
                "quantity_served": r.quantity_served,
                "quantity_waste": r.quantity_waste,
                "waste_percentage": r.waste_percentage,
                "waste_reason": r.waste_reason,
                "action_taken": r.action_taken or "Standard Kitchen Review"
            }
            for r in records
        ]
    }

@router.get("/export-csv")
def export_waste_reports_csv(
    period: str = Query("weekly"),
    meal_type: Optional[str] = Query(None),
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    db: Session = Depends(get_db)
):
    """Exports records to downloadable CSV format."""
    query = db.query(WasteRecord)
    today = date.today()

    if start_date and end_date:
        query = query.filter(WasteRecord.recorded_date >= start_date, WasteRecord.recorded_date <= end_date)
    elif period == "daily":
        latest = db.query(func.max(WasteRecord.recorded_date)).scalar() or today
        query = query.filter(WasteRecord.recorded_date == latest)
    elif period == "weekly":
        latest = db.query(func.max(WasteRecord.recorded_date)).scalar() or today
        query = query.filter(WasteRecord.recorded_date >= latest - timedelta(days=7))
    elif period == "monthly":
        latest = db.query(func.max(WasteRecord.recorded_date)).scalar() or today
        query = query.filter(WasteRecord.recorded_date >= latest - timedelta(days=30))

    if meal_type and meal_type != "All":
        query = query.filter(WasteRecord.meal_type == meal_type)

    records = query.order_by(WasteRecord.recorded_date.desc()).all()

    output = io.StringIO()
    writer = csv.writer(output)

    # Header Row
    writer.writerow([
        "Record ID",
        "Date",
        "Food Name",
        "Category",
        "Meal Type",
        "Prepared (kg)",
        "Served (kg)",
        "Waste (kg)",
        "Waste (%)",
        "Waste Reason",
        "Logged By",
        "Action Taken"
    ])

    total_prep = 0.0
    total_serv = 0.0
    total_waste = 0.0

    for r in records:
        total_prep += r.quantity_prepared
        total_serv += r.quantity_served
        total_waste += r.quantity_waste
        writer.writerow([
            r.id,
            r.recorded_date.isoformat(),
            r.food_name,
            r.category,
            r.meal_type,
            f"{r.quantity_prepared:.2f}",
            f"{r.quantity_served:.2f}",
            f"{r.quantity_waste:.2f}",
            f"{r.waste_percentage:.2f}%",
            r.waste_reason,
            r.recorded_by,
            r.action_taken or "N/A"
        ])

    # Summary Row
    overall_pct = (total_waste / total_prep * 100) if total_prep > 0 else 0.0
    writer.writerow([])
    writer.writerow([
        "TOTAL / SUMMARY",
        f"Records: {len(records)}",
        "-",
        "-",
        "-",
        f"{total_prep:.2f}",
        f"{total_serv:.2f}",
        f"{total_waste:.2f}",
        f"{overall_pct:.2f}%",
        "-",
        "-",
        "-"
    ])

    filename = f"smartbite_food_waste_report_{period}_{date.today().isoformat()}.csv"
    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
