from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date
from ..database import get_db
from ..models import FoodInventory
from ..schemas import FoodInventoryCreate, FoodInventoryUpdate, FoodInventoryResponse

router = APIRouter(prefix="/api/inventory", tags=["Food Inventory"])

@router.get("/", response_model=List[FoodInventoryResponse])
def get_inventory_items(
    search: Optional[str] = Query(None, description="Search by food item name"),
    category: Optional[str] = Query(None, description="Filter by category"),
    meal_type: Optional[str] = Query(None, description="Filter by meal type"),
    date_filter: Optional[date] = Query(None, alias="date", description="Filter by preparation date"),
    db: Session = Depends(get_db)
):
    query = db.query(FoodInventory)

    if search:
        query = query.filter(FoodInventory.food_name.ilike(f"%{search.strip()}%"))
    if category and category != "All":
        query = query.filter(FoodInventory.category == category)
    if meal_type and meal_type != "All":
        query = query.filter(FoodInventory.meal_type == meal_type)
    if date_filter:
        query = query.filter(FoodInventory.date == date_filter)

    items = query.order_by(FoodInventory.date.desc(), FoodInventory.id.desc()).all()
    return items

@router.get("/{item_id}", response_model=FoodInventoryResponse)
def get_inventory_item(item_id: int, db: Session = Depends(get_db)):
    item = db.query(FoodInventory).filter(FoodInventory.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Food inventory item not found")
    return item

@router.post("/", response_model=FoodInventoryResponse, status_code=status.HTTP_201_CREATED)
def create_inventory_item(item_in: FoodInventoryCreate, db: Session = Depends(get_db)):
    db_item = FoodInventory(
        food_name=item_in.food_name.strip(),
        category=item_in.category.strip(),
        quantity_prepared=round(item_in.quantity_prepared, 2),
        date=item_in.date,
        meal_type=item_in.meal_type.strip(),
        prepared_by=item_in.prepared_by or "Main Kitchen Team",
        notes=item_in.notes
    )
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.put("/{item_id}", response_model=FoodInventoryResponse)
def update_inventory_item(
    item_id: int,
    item_update: FoodInventoryUpdate,
    db: Session = Depends(get_db)
):
    db_item = db.query(FoodInventory).filter(FoodInventory.id == item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Food inventory item not found")

    update_data = item_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if field == "food_name" and value:
            setattr(db_item, field, value.strip())
        elif field == "quantity_prepared" and value is not None:
            setattr(db_item, field, round(value, 2))
        elif value is not None:
            setattr(db_item, field, value)

    db.commit()
    db.refresh(db_item)
    return db_item

@router.delete("/{item_id}", status_code=status.HTTP_200_OK)
def delete_inventory_item(item_id: int, db: Session = Depends(get_db)):
    db_item = db.query(FoodInventory).filter(FoodInventory.id == item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Food inventory item not found")

    db.delete(db_item)
    db.commit()
    return {"message": "Food inventory item deleted successfully", "id": item_id}
