from pydantic import BaseModel, Field, model_validator
from typing import Optional, List, Dict, Any
from datetime import date, datetime

# ---------- User Schemas ----------
class UserBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: str = Field(..., min_length=5, max_length=120, pattern=r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
    role: str = Field(default="Canteen Staff")
    department: Optional[str] = "College Canteen Division"

class UserCreate(UserBase):
    password: str = Field(..., min_length=4)

class UserLogin(BaseModel):
    email: str = Field(..., min_length=5, max_length=120)
    password: str

class UserResponse(UserBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

# ---------- Food Inventory Schemas ----------
class FoodInventoryBase(BaseModel):
    food_name: str = Field(..., min_length=2, max_length=150)
    category: str = Field(..., min_length=2, max_length=100)
    quantity_prepared: float = Field(..., gt=0, description="Quantity in kg, must be greater than 0")
    date: date
    meal_type: str = Field(..., description="Breakfast, Lunch, Snacks, Dinner")
    prepared_by: Optional[str] = "Main Kitchen Team"
    notes: Optional[str] = None

class FoodInventoryCreate(FoodInventoryBase):
    pass

class FoodInventoryUpdate(BaseModel):
    food_name: Optional[str] = None
    category: Optional[str] = None
    quantity_prepared: Optional[float] = Field(None, gt=0)
    date: Optional[date] = None
    meal_type: Optional[str] = None
    prepared_by: Optional[str] = None
    notes: Optional[str] = None

class FoodInventoryResponse(FoodInventoryBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

# ---------- Waste Record Schemas ----------
class WasteRecordBase(BaseModel):
    inventory_id: Optional[int] = None
    food_name: str = Field(..., min_length=2, max_length=150)
    meal_type: str
    category: str
    quantity_prepared: float = Field(..., gt=0, description="Prepared in kg")
    quantity_served: float = Field(..., ge=0, description="Served in kg")
    waste_reason: str
    recorded_date: date
    recorded_by: Optional[str] = "Canteen Staff"
    action_taken: Optional[str] = None

    @model_validator(mode="after")
    def validate_quantities(self):
        if self.quantity_served > self.quantity_prepared:
            raise ValueError("Served quantity cannot exceed prepared quantity.")
        return self

class WasteRecordCreate(WasteRecordBase):
    pass

class WasteRecordUpdate(BaseModel):
    food_name: Optional[str] = None
    meal_type: Optional[str] = None
    category: Optional[str] = None
    quantity_prepared: Optional[float] = Field(None, gt=0)
    quantity_served: Optional[float] = Field(None, ge=0)
    waste_reason: Optional[str] = None
    recorded_date: Optional[date] = None
    action_taken: Optional[str] = None

    @model_validator(mode="after")
    def validate_quantities(self):
        if (
            self.quantity_prepared is not None
            and self.quantity_served is not None
            and self.quantity_served > self.quantity_prepared
        ):
            raise ValueError("Served quantity cannot exceed prepared quantity.")
        return self

class WasteRecordResponse(WasteRecordBase):
    id: int
    quantity_waste: float
    waste_percentage: float
    created_at: datetime

    class Config:
        from_attributes = True

# ---------- Surplus Food Schemas ----------
class SurplusFoodBase(BaseModel):
    food_name: str = Field(..., min_length=2, max_length=150)
    category: str
    available_quantity: float = Field(..., gt=0, description="Available quantity in kg")
    meal_type: str
    prepared_time: str
    safe_consumption_deadline: str
    storage_temperature: Optional[str] = "Hot Holding (>60°C) / Chilled (<5°C)"
    status: str = Field(default="Available") # Available, Reserved, Distributed, Discarded
    recipient_organization: Optional[str] = None
    notes: Optional[str] = None
    updated_by: Optional[str] = "Canteen Staff"

class SurplusFoodCreate(SurplusFoodBase):
    pass

class SurplusFoodUpdate(BaseModel):
    food_name: Optional[str] = None
    category: Optional[str] = None
    available_quantity: Optional[float] = Field(None, gt=0)
    meal_type: Optional[str] = None
    prepared_time: Optional[str] = None
    safe_consumption_deadline: Optional[str] = None
    storage_temperature: Optional[str] = None
    status: Optional[str] = None
    recipient_organization: Optional[str] = None
    notes: Optional[str] = None
    updated_by: Optional[str] = None

class SurplusFoodResponse(SurplusFoodBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

# ---------- Dashboard & Analytics Schemas ----------
class DashboardStats(BaseModel):
    total_prepared_today: float
    total_served_today: float
    total_wasted_today: float
    waste_percentage_today: float
    waste_reduction_rate: float
    total_active_surplus_kg: float
    db_engine: str

class WasteReductionSuggestion(BaseModel):
    id: str
    priority: str # High, Medium, Low
    category: str
    food_name: Optional[str] = None
    title: str
    observation: str
    recommendation: str
    potential_savings_kg: float
    impact: str
