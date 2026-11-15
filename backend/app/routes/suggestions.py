from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from typing import List, Dict, Any
from ..database import get_db
from ..models import WasteRecord

router = APIRouter(prefix="/api/suggestions", tags=["Waste Reduction Suggestions"])

@router.get("/")
def get_waste_reduction_suggestions(db: Session = Depends(get_db)):
    """
    Intelligent Rule-Based Waste Reduction Engine:
    Analyzes actual recorded waste records in the database to generate
    concrete, actionable operational suggestions for the college mess.
    """
    suggestions = []

    # 1. Analyze high-waste food items
    item_stats = (
        db.query(
            WasteRecord.food_name,
            WasteRecord.category,
            func.sum(WasteRecord.quantity_waste).label("total_waste"),
            func.sum(WasteRecord.quantity_prepared).label("total_prepared"),
            func.avg(WasteRecord.waste_percentage).label("avg_pct"),
            func.count(WasteRecord.id).label("record_count")
        )
        .group_by(WasteRecord.food_name, WasteRecord.category)
        .order_by(desc("total_waste"))
        .all()
    )

    if item_stats:
        top_item = item_stats[0]
        waste_kg = round(float(top_item.total_waste or 0), 1)
        prep_kg = round(float(top_item.total_prepared or 0), 1)
        avg_pct = round(float(top_item.avg_pct or 0), 1)

        if avg_pct > 15:
            suggested_cut_pct = min(25, round(avg_pct * 0.8))
            potential_savings = round((prep_kg * (suggested_cut_pct / 100)), 1)
            suggestions.append({
                "id": "sug-high-waste-item",
                "priority": "High",
                "category": "Preparation Volume Adjustment",
                "food_name": top_item.food_name,
                "title": f"Reduce Preparation Batch for '{top_item.food_name}'",
                "observation": f"'{top_item.food_name}' has accumulated {waste_kg} kg of waste across service days, averaging a high {avg_pct}% waste rate.",
                "recommendation": f"Trim daily preparation batch by {suggested_cut_pct}% (approx. {round(top_item.total_prepared / max(1, top_item.record_count) * (suggested_cut_pct/100), 1)} kg per service) to match actual student intake patterns.",
                "potential_savings_kg": potential_savings,
                "impact": "High Environmental & Cost Impact"
            })

    # 2. Analyze Meal Type with Highest Waste
    meal_stats = (
        db.query(
            WasteRecord.meal_type,
            func.sum(WasteRecord.quantity_waste).label("total_waste"),
            func.sum(WasteRecord.quantity_prepared).label("total_prepared"),
            func.avg(WasteRecord.waste_percentage).label("avg_pct")
        )
        .group_by(WasteRecord.meal_type)
        .order_by(desc("total_waste"))
        .all()
    )

    if meal_stats:
        top_meal = meal_stats[0]
        suggestions.append({
            "id": "sug-peak-meal-type",
            "priority": "High",
            "category": "Meal-Wise Demand Planning",
            "food_name": f"{top_meal.meal_type} Service",
            "title": f"Optimize {top_meal.meal_type} Food Demand Prediction",
            "observation": f"{top_meal.meal_type} generates the highest cumulative leftover food ({round(float(top_meal.total_waste or 0), 1)} kg, avg {round(float(top_meal.avg_pct or 0), 1)}% waste).",
            "recommendation": f"Integrate timetable and class attendance checks before lunch cooking shifts. Prepare base gravies in two staggered split batches rather than one massive morning bulk.",
            "potential_savings_kg": round(float(top_meal.total_waste or 0) * 0.35, 1),
            "impact": "Reduces peak-shift food spoilage by over 30%"
        })

    # 3. Analyze Waste Reasons Breakdown
    reason_stats = (
        db.query(
            WasteRecord.waste_reason,
            func.sum(WasteRecord.quantity_waste).label("total_waste"),
            func.count(WasteRecord.id).label("count")
        )
        .group_by(WasteRecord.waste_reason)
        .order_by(desc("total_waste"))
        .all()
    )

    reasons_map = {r.waste_reason: (float(r.total_waste or 0), r.count) for r in reason_stats}

    if "Low student attendance" in reasons_map and reasons_map["Low student attendance"][0] > 10:
        suggestions.append({
            "id": "sug-attendance-sync",
            "priority": "Medium",
            "category": "Campus Calendar Synchronization",
            "food_name": "All Kitchen Batches",
            "title": "Cross-Reference Academic Calendar & Exam Schedules",
            "observation": f"{round(reasons_map['Low student attendance'][0], 1)} kg was wasted due to low student turnouts during exam weeks or department fests.",
            "recommendation": "Coordinate with university academic deans to review holiday schedules, campus event dates, and sports meets 48 hours prior to grocery indenting.",
            "potential_savings_kg": round(reasons_map['Low student attendance'][0] * 0.6, 1),
            "impact": "Eliminates unexpected turnout drops"
        })

    if "Excess food preparation" in reasons_map:
        suggestions.append({
            "id": "sug-portion-control",
            "priority": "Medium",
            "category": "Serving & Portion Control",
            "food_name": "Rice, Roti & Side Dishes",
            "title": "Introduce Standard Serving Ladles & 'Ask for Half' Option",
            "observation": "Excessive plate waste happens when standard servings exceed student appetites.",
            "recommendation": "Equip canteen servers with standardized volumetric ladles. Display signage encouraging 'Take What You Eat, Eat What You Take', offering half-scoop options first with free second helpings.",
            "potential_savings_kg": round(reasons_map['Excess food preparation'][0] * 0.4, 1),
            "impact": "Cultivates mindful consumption among students"
        })

    # 4. Standard Best Practices for College Canteens
    suggestions.append({
        "id": "sug-surplus-channel",
        "priority": "Medium",
        "category": "Surplus Redistribution Protocol",
        "food_name": "Safe Surplus Batches",
        "title": "Fast-Track Surplus Food Redistribution Within 3 Hours",
        "observation": "Edible surplus remaining after lunch hour loses freshness if not promptly transferred.",
        "recommendation": "Maintain hot-holding above 60°C and alert student hostel committees and verified local food bank partners by 2:30 PM for instant pickup.",
        "potential_savings_kg": 25.0,
        "impact": "Zero edible food sent to landfill"
    })

    suggestions.append({
        "id": "sug-composting-evs",
        "priority": "Low",
        "category": "Organic Waste Circularity",
        "food_name": "Kitchen Peels & Unavoidable Scraps",
        "title": "Campus Organic Composting for Campus Gardening",
        "observation": "Inedible vegetable trimmings and peelings currently enter general municipal trash.",
        "recommendation": "Segregate pre-consumer kitchen peels directly into on-campus vermicomposting bins to generate rich fertilizer for the college botanical garden.",
        "potential_savings_kg": 40.0,
        "impact": "Complete campus green circularity"
    })

    return suggestions
