from datetime import date, timedelta
from sqlalchemy.orm import Session
from .models import User, FoodInventory, WasteRecord, SurplusFood
from .routes.auth import hash_password

def seed_database(db: Session):
    """Seed comprehensive initial data for SmartBite demo."""
    # 1. Users
    if db.query(User).count() == 0:
        admin_user = User(
            name="Prof. Arvind Sharma (Canteen Admin)",
            email="admin@smartbite.edu",
            password_hash=hash_password("admin123"),
            role="Admin",
            department="EVS & Campus Facilities"
        )
        staff_user = User(
            name="Rajesh Kumar (Head Chef)",
            email="staff@smartbite.edu",
            password_hash=hash_password("staff123"),
            role="Canteen Staff",
            department="College Canteen Operations"
        )
        db.add_all([admin_user, staff_user])
        db.commit()

    # 2. Food Inventory & Waste Records
    if db.query(WasteRecord).count() == 0:
        today = date.today()

        # Realistic canteen menu dataset spanning last 7 days
        menu_items = [
            # Day 0 (Today)
            {"day_offset": 0, "name": "Steamed Rice & Sambar", "cat": "Grains & Cereals", "meal": "Lunch", "prep": 55.0, "serv": 49.5, "reason": "Excess food preparation", "action": "Leftover moved to refrigerated holding"},
            {"day_offset": 0, "name": "Paneer Butter Masala", "cat": "Curries & Gravies", "meal": "Lunch", "prep": 32.0, "serv": 29.8, "reason": "Low student attendance", "action": "Portion control sign displayed"},
            {"day_offset": 0, "name": "Tawa Roti / Chapati", "cat": "Grains & Cereals", "meal": "Lunch", "prep": 40.0, "serv": 36.5, "reason": "Excess food preparation", "action": "Adjusted evening flour indent"},
            {"day_offset": 0, "name": "Idli & Coconut Chutney", "cat": "Snacks & Starters", "meal": "Breakfast", "prep": 28.0, "serv": 26.2, "reason": "Low student attendance", "action": "Normal variation"},
            {"day_offset": 0, "name": "Veg Samosa & Chutney", "cat": "Snacks & Starters", "meal": "Snacks", "prep": 20.0, "serv": 18.0, "reason": "Poor food demand prediction", "action": "Offered evening combo discount"},
            
            # Day -1 (Yesterday)
            {"day_offset": -1, "name": "Veg Dum Biryani & Raita", "cat": "Grains & Cereals", "meal": "Lunch", "prep": 65.0, "serv": 58.0, "reason": "Excess food preparation", "action": "Shared with local community shelter"},
            {"day_offset": -1, "name": "Dal Tadka & Steamed Rice", "cat": "Curries & Gravies", "meal": "Dinner", "prep": 45.0, "serv": 41.0, "reason": "Low student attendance", "action": "Night study crowd lower than estimated"},
            {"day_offset": -1, "name": "Poori & Aloo Bhaji", "cat": "Grains & Cereals", "meal": "Breakfast", "prep": 30.0, "serv": 27.5, "reason": "Excess food preparation", "action": "Batched frying implemented"},
            {"day_offset": -1, "name": "Mixed Sprout Salad", "cat": "Salads & Sides", "meal": "Lunch", "prep": 15.0, "serv": 11.2, "reason": "Poor food demand prediction", "action": "Reduced batch size to 10kg"},
            {"day_offset": -1, "name": "Gulab Jamun (2 pcs/serv)", "cat": "Desserts & Sweets", "meal": "Dinner", "prep": 18.0, "serv": 17.1, "reason": "Excess food preparation", "action": "Stored in cold storage"},

            # Day -2
            {"day_offset": -2, "name": "Chole Bhature", "cat": "Grains & Cereals", "meal": "Breakfast", "prep": 35.0, "serv": 31.0, "reason": "Excess food preparation", "action": "Flour quantity revised"},
            {"day_offset": -2, "name": "Jeera Rice & Dal Makhani", "cat": "Curries & Gravies", "meal": "Lunch", "prep": 50.0, "serv": 43.5, "reason": "Low student attendance", "action": "Department symposium affected lunch crowd"},
            {"day_offset": -2, "name": "Pav Bhaji", "cat": "Snacks & Starters", "meal": "Snacks", "prep": 25.0, "serv": 22.0, "reason": "Poor food demand prediction", "action": "Evening footfall lower"},
            {"day_offset": -2, "name": "Mixed Veg Sabzi & Phulka", "cat": "Curries & Gravies", "meal": "Dinner", "prep": 38.0, "serv": 34.2, "reason": "Excess food preparation", "action": "Cook in two staggered shifts"},

            # Day -3
            {"day_offset": -3, "name": "Poha & Green Chutney", "cat": "Grains & Cereals", "meal": "Breakfast", "prep": 25.0, "serv": 23.0, "reason": "Excess food preparation", "action": "Minimal leftover handled"},
            {"day_offset": -3, "name": "South Indian Thali Rice", "cat": "Grains & Cereals", "meal": "Lunch", "prep": 60.0, "serv": 51.5, "reason": "Low student attendance", "action": "Exam preparation leave reported"},
            {"day_offset": -3, "name": "Aloo Paratha & Curd", "cat": "Grains & Cereals", "meal": "Dinner", "prep": 42.0, "serv": 37.8, "reason": "Excess food preparation", "action": "Curd preserved safely"},

            # Day -4
            {"day_offset": -4, "name": "Upma & Tomato Chutney", "cat": "Grains & Cereals", "meal": "Breakfast", "prep": 24.0, "serv": 22.5, "reason": "Excess food preparation", "action": "Standard serving"},
            {"day_offset": -4, "name": "Rajma Masala & Basmati Rice", "cat": "Curries & Gravies", "meal": "Lunch", "prep": 52.0, "serv": 45.0, "reason": "Excess food preparation", "action": "Surveying student preferences"},
            {"day_offset": -4, "name": "Veg Hakka Noodles", "cat": "Snacks & Starters", "meal": "Snacks", "prep": 22.0, "serv": 20.8, "reason": "Food quality issues", "action": "Vegetable freshness re-checked"},

            # Day -5
            {"day_offset": -5, "name": "Medu Vada & Sambar", "cat": "Snacks & Starters", "meal": "Breakfast", "prep": 26.0, "serv": 24.0, "reason": "Excess food preparation", "action": "Oil temperature monitored"},
            {"day_offset": -5, "name": "Kadhi Pakora & Steamed Rice", "cat": "Curries & Gravies", "meal": "Lunch", "prep": 48.0, "serv": 41.2, "reason": "Low student attendance", "action": "Notice sent to hostel wardens"},
            {"day_offset": -5, "name": "Kheer / Rice Pudding", "cat": "Desserts & Sweets", "meal": "Dinner", "prep": 20.0, "serv": 18.5, "reason": "Excess food preparation", "action": "Portion scoop reduced"},

            # Day -6
            {"day_offset": -6, "name": "Masala Dosa & Sambar", "cat": "Grains & Cereals", "meal": "Breakfast", "prep": 32.0, "serv": 30.5, "reason": "Excess food preparation", "action": "High demand, minimal leftover"},
            {"day_offset": -6, "name": "Veg Pulao & Boondi Raita", "cat": "Grains & Cereals", "meal": "Lunch", "prep": 54.0, "serv": 46.5, "reason": "Poor food demand prediction", "action": "Adjusted weekend ration estimates"},
            {"day_offset": -6, "name": "Palak Paneer & Roti", "cat": "Curries & Gravies", "meal": "Dinner", "prep": 40.0, "serv": 35.0, "reason": "Excess food preparation", "action": "Gravy base reused safely"}
        ]

        for item in menu_items:
            rec_date = today + timedelta(days=item["day_offset"])
            prep_kg = item["prep"]
            serv_kg = item["serv"]
            waste_kg = round(prep_kg - serv_kg, 2)
            waste_pct = round((waste_kg / prep_kg * 100), 2)

            # Create inventory entry
            inv = FoodInventory(
                food_name=item["name"],
                category=item["cat"],
                quantity_prepared=prep_kg,
                date=rec_date,
                meal_type=item["meal"],
                prepared_by="Main Kitchen Mess Team",
                notes=f"Standard menu schedule for {item['meal']}"
            )
            db.add(inv)
            db.flush()

            # Create waste record
            waste = WasteRecord(
                inventory_id=inv.id,
                food_name=item["name"],
                meal_type=item["meal"],
                category=item["cat"],
                quantity_prepared=prep_kg,
                quantity_served=serv_kg,
                quantity_waste=waste_kg,
                waste_percentage=waste_pct,
                waste_reason=item["reason"],
                recorded_date=rec_date,
                recorded_by="Rajesh Kumar (Head Chef)",
                action_taken=item["action"]
            )
            db.add(waste)

        db.commit()

    # 3. Surplus Food Table
    if db.query(SurplusFood).count() == 0:
        surplus_entries = [
            {
                "food_name": "Steamed Rice & Sambar (Lunch Pack)",
                "category": "Grains & Cereals",
                "available_quantity": 4.5,
                "meal_type": "Lunch",
                "prepared_time": "Today, 11:30 AM",
                "safe_consumption_deadline": "Today, 04:30 PM",
                "storage_temperature": "Insulated Hot Holding Container (>65°C)",
                "status": "Available",
                "recipient_organization": None,
                "notes": "Hygienically maintained in thermal dispensers. Suitable for immediate donation."
            },
            {
                "food_name": "Tawa Roti / Chapati (Freshly Foil-Wrapped)",
                "category": "Grains & Cereals",
                "available_quantity": 3.0,
                "meal_type": "Lunch",
                "prepared_time": "Today, 12:00 PM",
                "safe_consumption_deadline": "Today, 06:00 PM",
                "storage_temperature": "Warm Dry Thermal Casserole",
                "status": "Available",
                "recipient_organization": None,
                "notes": "Cleanly packed in food-grade silver foil packs of 5 chapatis each."
            },
            {
                "food_name": "Paneer Butter Masala (Portioned Tub)",
                "category": "Curries & Gravies",
                "available_quantity": 2.2,
                "meal_type": "Lunch",
                "prepared_time": "Today, 11:45 AM",
                "safe_consumption_deadline": "Today, 03:45 PM",
                "storage_temperature": "Hot Bain-Marie Well (>60°C)",
                "status": "Reserved",
                "recipient_organization": "Robin Hood Army - Campus Chapter",
                "notes": "Pickup scheduled at 02:45 PM by volunteer vehicle."
            },
            {
                "food_name": "Veg Dum Biryani & Raita Packs",
                "category": "Grains & Cereals",
                "available_quantity": 7.0,
                "meal_type": "Lunch",
                "prepared_time": "Yesterday, 12:15 PM",
                "safe_consumption_deadline": "Yesterday, 04:30 PM",
                "storage_temperature": "Hot Thermal Case",
                "status": "Distributed",
                "recipient_organization": "Annapurna Community Shelter",
                "notes": "Successfully handed over to 25 staff and community helpers."
            }
        ]

        for s in surplus_entries:
            sf = SurplusFood(
                food_name=s["food_name"],
                category=s["category"],
                available_quantity=s["available_quantity"],
                meal_type=s["meal_type"],
                prepared_time=s["prepared_time"],
                safe_consumption_deadline=s["safe_consumption_deadline"],
                storage_temperature=s["storage_temperature"],
                status=s["status"],
                recipient_organization=s["recipient_organization"],
                notes=s["notes"],
                updated_by="Rajesh Kumar (Head Chef)"
            )
            db.add(sf)

        db.commit()
