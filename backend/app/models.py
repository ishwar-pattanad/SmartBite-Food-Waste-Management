from datetime import datetime, date
from sqlalchemy import Column, Integer, String, Float, Date, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(120), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(50), default="Canteen Staff", nullable=False) # 'Admin' or 'Canteen Staff'
    department = Column(String(100), default="College Canteen Division")
    created_at = Column(DateTime, default=datetime.utcnow)

class FoodInventory(Base):
    __tablename__ = "food_inventory"

    id = Column(Integer, primary_key=True, index=True)
    food_name = Column(String(150), nullable=False, index=True)
    category = Column(String(100), nullable=False, index=True)
    quantity_prepared = Column(Float, nullable=False) # in kg
    date = Column(Date, nullable=False, index=True)
    meal_type = Column(String(50), nullable=False, index=True) # Breakfast, Lunch, Snacks, Dinner
    prepared_by = Column(String(100), default="Main Kitchen Team")
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Optional relation to waste record
    waste_records = relationship("WasteRecord", back_populates="inventory_item")

class WasteRecord(Base):
    __tablename__ = "waste_records"

    id = Column(Integer, primary_key=True, index=True)
    inventory_id = Column(Integer, ForeignKey("food_inventory.id", ondelete="SET NULL"), nullable=True)
    food_name = Column(String(150), nullable=False, index=True)
    meal_type = Column(String(50), nullable=False, index=True)
    category = Column(String(100), nullable=False, index=True)
    quantity_prepared = Column(Float, nullable=False) # in kg
    quantity_served = Column(Float, nullable=False) # in kg
    quantity_waste = Column(Float, nullable=False) # in kg (prepared - served)
    waste_percentage = Column(Float, nullable=False) # (waste / prepared) * 100
    waste_reason = Column(String(150), nullable=False)
    # Reasons: 'Excess food preparation', 'Low student attendance', 'Poor food demand prediction', 'Food quality issues', 'Other'
    recorded_date = Column(Date, nullable=False, index=True)
    recorded_by = Column(String(100), default="Canteen Staff")
    action_taken = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    inventory_item = relationship("FoodInventory", back_populates="waste_records")

class SurplusFood(Base):
    __tablename__ = "surplus_food"

    id = Column(Integer, primary_key=True, index=True)
    food_name = Column(String(150), nullable=False, index=True)
    category = Column(String(100), nullable=False)
    available_quantity = Column(Float, nullable=False) # in kg
    meal_type = Column(String(50), nullable=False)
    prepared_time = Column(String(50), nullable=False)
    safe_consumption_deadline = Column(String(50), nullable=False)
    storage_temperature = Column(String(50), default="Hot Holding (>60°C) / Chilled (<5°C)")
    status = Column(String(50), default="Available", index=True) # Available, Reserved, Distributed, Discarded
    recipient_organization = Column(String(150), nullable=True)
    notes = Column(Text, nullable=True)
    updated_by = Column(String(100), default="Canteen Staff")
    created_at = Column(DateTime, default=datetime.utcnow)
