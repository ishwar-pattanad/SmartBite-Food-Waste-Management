from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional
from ..database import get_db
from ..models import SurplusFood
from ..schemas import SurplusFoodCreate, SurplusFoodUpdate, SurplusFoodResponse

router = APIRouter(prefix="/api/surplus", tags=["Food Donation & Surplus Management"])

@router.get("/", response_model=List[SurplusFoodResponse])
def get_surplus_items(
    status_filter: Optional[str] = Query(None, alias="status"),
    meal_type: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(SurplusFood)

    if search:
        query = query.filter(SurplusFood.food_name.ilike(f"%{search.strip()}%"))
    if status_filter and status_filter != "All":
        query = query.filter(SurplusFood.status == status_filter)
    if meal_type and meal_type != "All":
        query = query.filter(SurplusFood.meal_type == meal_type)

    return query.order_by(SurplusFood.created_at.desc()).all()

@router.post("/", response_model=SurplusFoodResponse, status_code=status.HTTP_201_CREATED)
def create_surplus_item(item_in: SurplusFoodCreate, db: Session = Depends(get_db)):
    db_item = SurplusFood(
        food_name=item_in.food_name.strip(),
        category=item_in.category.strip(),
        available_quantity=round(item_in.available_quantity, 2),
        meal_type=item_in.meal_type.strip(),
        prepared_time=item_in.prepared_time.strip(),
        safe_consumption_deadline=item_in.safe_consumption_deadline.strip(),
        storage_temperature=item_in.storage_temperature or "Hot Holding (>60°C) / Chilled (<5°C)",
        status=item_in.status or "Available",
        recipient_organization=item_in.recipient_organization,
        notes=item_in.notes,
        updated_by=item_in.updated_by or "Canteen Staff"
    )
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.patch("/{item_id}/status", response_model=SurplusFoodResponse)
def update_surplus_status(
    item_id: int,
    status_update: dict,
    db: Session = Depends(get_db)
):
    """Quick status update (Available, Reserved, Distributed, Discarded)."""
    db_item = db.query(SurplusFood).filter(SurplusFood.id == item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Surplus food record not found")

    new_status = status_update.get("status")
    allowed_statuses = ["Available", "Reserved", "Distributed", "Discarded"]
    if new_status not in allowed_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {allowed_statuses}")

    db_item.status = new_status
    if "recipient_organization" in status_update:
        db_item.recipient_organization = status_update["recipient_organization"]
    if "updated_by" in status_update:
        db_item.updated_by = status_update["updated_by"]

    db.commit()
    db.refresh(db_item)
    return db_item

@router.put("/{item_id}", response_model=SurplusFoodResponse)
def update_surplus_item(
    item_id: int,
    item_update: SurplusFoodUpdate,
    db: Session = Depends(get_db)
):
    db_item = db.query(SurplusFood).filter(SurplusFood.id == item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Surplus food record not found")

    update_dict = item_update.model_dump(exclude_unset=True)
    for field, value in update_dict.items():
        if value is not None:
            if field == "available_quantity":
                setattr(db_item, field, round(value, 2))
            else:
                setattr(db_item, field, value)

    db.commit()
    db.refresh(db_item)
    return db_item

@router.delete("/{item_id}", status_code=status.HTTP_200_OK)
def delete_surplus_item(item_id: int, db: Session = Depends(get_db)):
    db_item = db.query(SurplusFood).filter(SurplusFood.id == item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Surplus food record not found")

    db.delete(db_item)
    db.commit()
    return {"message": "Surplus item deleted successfully", "id": item_id}
