from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date
from ..database import get_db
from ..models import WasteRecord, FoodInventory
from ..schemas import WasteRecordCreate, WasteRecordUpdate, WasteRecordResponse

router = APIRouter(prefix="/api/waste", tags=["Food Waste Recording"])

@router.get("/", response_model=List[WasteRecordResponse])
def get_waste_records(
    search: Optional[str] = Query(None, description="Search by food item name"),
    meal_type: Optional[str] = Query(None, description="Filter by meal type"),
    waste_reason: Optional[str] = Query(None, description="Filter by reason"),
    start_date: Optional[date] = Query(None, description="Filter from date"),
    end_date: Optional[date] = Query(None, description="Filter to date"),
    db: Session = Depends(get_db)
):
    query = db.query(WasteRecord)

    if search:
        query = query.filter(WasteRecord.food_name.ilike(f"%{search.strip()}%"))
    if meal_type and meal_type != "All":
        query = query.filter(WasteRecord.meal_type == meal_type)
    if waste_reason and waste_reason != "All":
        query = query.filter(WasteRecord.waste_reason == waste_reason)
    if start_date:
        query = query.filter(WasteRecord.recorded_date >= start_date)
    if end_date:
        query = query.filter(WasteRecord.recorded_date <= end_date)

    records = query.order_by(WasteRecord.recorded_date.desc(), WasteRecord.id.desc()).all()
    return records

@router.get("/{record_id}", response_model=WasteRecordResponse)
def get_waste_record(record_id: int, db: Session = Depends(get_db)):
    record = db.query(WasteRecord).filter(WasteRecord.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Waste record not found")
    return record

@router.post("/", response_model=WasteRecordResponse, status_code=status.HTTP_201_CREATED)
def record_food_waste(record_in: WasteRecordCreate, db: Session = Depends(get_db)):
    # Auto-calculate food waste and percentage
    waste_kg = round(max(0.0, record_in.quantity_prepared - record_in.quantity_served), 2)
    waste_pct = round((waste_kg / record_in.quantity_prepared) * 100, 2) if record_in.quantity_prepared > 0 else 0.0

    db_record = WasteRecord(
        inventory_id=record_in.inventory_id,
        food_name=record_in.food_name.strip(),
        meal_type=record_in.meal_type.strip(),
        category=record_in.category.strip(),
        quantity_prepared=round(record_in.quantity_prepared, 2),
        quantity_served=round(record_in.quantity_served, 2),
        quantity_waste=waste_kg,
        waste_percentage=waste_pct,
        waste_reason=record_in.waste_reason.strip(),
        recorded_date=record_in.recorded_date,
        recorded_by=record_in.recorded_by or "Canteen Staff",
        action_taken=record_in.action_taken
    )
    db.add(db_record)
    db.commit()
    db.refresh(db_record)
    return db_record

@router.put("/{record_id}", response_model=WasteRecordResponse)
def update_waste_record(
    record_id: int,
    record_update: WasteRecordUpdate,
    db: Session = Depends(get_db)
):
    db_record = db.query(WasteRecord).filter(WasteRecord.id == record_id).first()
    if not db_record:
        raise HTTPException(status_code=404, detail="Waste record not found")

    update_dict = record_update.model_dump(exclude_unset=True)

    # Re-calculate waste if quantities change
    prep = update_dict.get("quantity_prepared", db_record.quantity_prepared)
    serv = update_dict.get("quantity_served", db_record.quantity_served)

    if serv > prep:
        raise HTTPException(status_code=400, detail="Quantity served cannot exceed quantity prepared.")

    waste_kg = round(max(0.0, prep - serv), 2)
    waste_pct = round((waste_kg / prep) * 100, 2) if prep > 0 else 0.0

    db_record.quantity_prepared = round(prep, 2)
    db_record.quantity_served = round(serv, 2)
    db_record.quantity_waste = waste_kg
    db_record.waste_percentage = waste_pct

    for field, value in update_dict.items():
        if field not in ["quantity_prepared", "quantity_served"] and value is not None:
            setattr(db_record, field, value)

    db.commit()
    db.refresh(db_record)
    return db_record

@router.delete("/{record_id}", status_code=status.HTTP_200_OK)
def delete_waste_record(record_id: int, db: Session = Depends(get_db)):
    db_record = db.query(WasteRecord).filter(WasteRecord.id == record_id).first()
    if not db_record:
        raise HTTPException(status_code=404, detail="Waste record not found")

    db.delete(db_record)
    db.commit()
    return {"message": "Waste record deleted successfully", "id": record_id}
