import sys
import io
if sys.stdout.encoding.lower() != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')
from datetime import date
from backend.app.database import SessionLocal, get_db_status
from backend.app.models import User, FoodInventory, WasteRecord, SurplusFood
from backend.app.routes import auth, inventory, waste, analytics, surplus, suggestions, reports
from backend.app.schemas import (
    UserLogin,
    FoodInventoryCreate,
    FoodInventoryUpdate,
    WasteRecordCreate,
    WasteRecordUpdate,
    SurplusFoodCreate
)

def run_direct_tests():
    print("==================================================")
    print("🚀 SmartBite Full-Stack Direct Route & DB Test Suite")
    print("==================================================")

    db = SessionLocal()
    try:
        # 1. Health & DB Status
        print("\n1. Testing Database & System Status...")
        status = get_db_status()
        print(f"   ✅ Database engine active: {status['engine']} (Target: {status['mysql_target']})")
        assert status["active"] is True

        # 2. Auth Tests
        print("\n2. Testing Authentication & Demo Accounts...")
        demo_accounts = auth.get_demo_accounts()
        assert len(demo_accounts) == 2
        print(f"   ✅ Found {len(demo_accounts)} demo accounts configured")

        # Login Staff
        staff_login = auth.login(UserLogin(email="staff@smartbite.edu", password="staff123"), db=db)
        assert staff_login["user"].role == "Canteen Staff"
        print(f"   ✅ Canteen Staff login OK: {staff_login['user'].name} ({staff_login['user'].role})")

        # Login Admin
        admin_login = auth.login(UserLogin(email="admin@smartbite.edu", password="admin123"), db=db)
        assert admin_login["user"].role == "Admin"
        print(f"   ✅ Admin login OK: {admin_login['user'].name} ({admin_login['user'].role})")

        # 3. Inventory CRUD Tests
        print("\n3. Testing Food Inventory Management...")
        inv_items = inventory.get_inventory_items(search=None, category=None, meal_type=None, date_filter=None, db=db)
        initial_inv_count = len(inv_items)
        print(f"   ✅ Retrieved {initial_inv_count} inventory records from database")

        new_inv = inventory.create_inventory_item(
            FoodInventoryCreate(
                food_name="Test Veg Hakka Noodles",
                category="Snacks & Starters",
                quantity_prepared=28.5,
                date=date.today(),
                meal_type="Snacks",
                prepared_by="Kitchen Evening Shift",
                notes="Automated verification batch"
            ),
            db=db
        )
        assert new_inv.id is not None
        assert new_inv.quantity_prepared == 28.5
        print(f"   ✅ Created inventory item ID {new_inv.id}: {new_inv.food_name} ({new_inv.quantity_prepared} kg)")

        # Update
        updated_inv = inventory.update_inventory_item(
            new_inv.id,
            FoodInventoryUpdate(quantity_prepared=32.0),
            db=db
        )
        assert updated_inv.quantity_prepared == 32.0
        print(f"   ✅ Updated inventory item ID {new_inv.id} quantity to {updated_inv.quantity_prepared} kg")

        # Delete
        del_res = inventory.delete_inventory_item(new_inv.id, db=db)
        assert del_res["id"] == new_inv.id
        print(f"   ✅ Deleted inventory test item ID {new_inv.id}")

        # 4. Waste Recording & Auto-Calculation
        print("\n4. Testing Food Waste Recording & Auto-Calculation...")
        waste_items = waste.get_waste_records(search=None, meal_type=None, waste_reason=None, start_date=None, end_date=None, db=db)
        print(f"   ✅ Retrieved {len(waste_items)} persistent waste records")

        # Record: Prepared: 50 kg, Served: 42 kg -> Waste: 8 kg (16%)
        new_waste = waste.record_food_waste(
            WasteRecordCreate(
                food_name="Test Steamed Basmati Rice",
                category="Grains & Cereals",
                meal_type="Lunch",
                quantity_prepared=50.0,
                quantity_served=42.0,
                waste_reason="Excess food preparation",
                recorded_date=date.today(),
                recorded_by="Rajesh Kumar",
                action_taken="Moved unserved food to hot holding"
            ),
            db=db
        )
        assert new_waste.quantity_waste == 8.0, f"Expected 8.0, got {new_waste.quantity_waste}"
        assert new_waste.waste_percentage == 16.0, f"Expected 16.0%, got {new_waste.waste_percentage}"
        print(f"   ✅ Auto-calculation verified: Prep {new_waste.quantity_prepared}kg - Serv {new_waste.quantity_served}kg = Waste {new_waste.quantity_waste}kg ({new_waste.waste_percentage}%)")

        # Delete test record
        waste.delete_waste_record(new_waste.id, db=db)
        print(f"   ✅ Cleaned up test waste record ID {new_waste.id}")

        # 5. Analytics & Dashboard Metrics
        print("\n5. Testing Analytics & Calculations...")
        dash_stats = analytics.get_dashboard_stats(db=db)
        assert "total_prepared_today" in dash_stats
        assert "total_served_today" in dash_stats
        assert "total_wasted_today" in dash_stats
        assert "waste_percentage_today" in dash_stats
        print(f"   ✅ Live Dashboard Metrics: Prepared {dash_stats['total_prepared_today']}kg, Served {dash_stats['total_served_today']}kg, Waste {dash_stats['total_wasted_today']}kg ({dash_stats['waste_percentage_today']}%)")

        trends = analytics.get_daily_trends(days=7, db=db)
        assert len(trends) > 0
        print(f"   ✅ Daily trends returned {len(trends)} days of data for charts")

        cats = analytics.get_waste_by_category(db=db)
        assert len(cats) > 0
        print(f"   ✅ Category breakdown returned {len(cats)} categories")

        meals = analytics.get_waste_by_meal_type(db=db)
        assert len(meals) == 4 # Breakfast, Lunch, Snacks, Dinner
        print(f"   ✅ Meal type breakdown returned {len(meals)} meal shifts")

        top_wasted = analytics.get_top_wasted_items(limit=6, db=db)
        assert len(top_wasted) > 0
        print(f"   ✅ Top wasted leaderboard returned {len(top_wasted)} dishes")

        # 6. Surplus Food & Food Safety Protocols
        print("\n6. Testing Surplus Food & Safety Protocols...")
        surplus_list = surplus.get_surplus_items(status_filter=None, meal_type=None, search=None, db=db)
        assert len(surplus_list) > 0
        print(f"   ✅ Active surplus registry contains {len(surplus_list)} items")

        # Status Update
        target_surplus = surplus_list[0]
        updated_s = surplus.update_surplus_status(
            target_surplus.id,
            {"status": "Reserved", "recipient_organization": "Student Volunteer Mess Chapter"},
            db=db
        )
        assert updated_s.status == "Reserved"
        print(f"   ✅ Updated surplus status for '{updated_s.food_name}' to 'Reserved'")

        # 7. Intelligent Waste Reduction Suggestions
        print("\n7. Testing Intelligent Rule-Based Suggestions...")
        sugs = suggestions.get_waste_reduction_suggestions(db=db)
        assert len(sugs) >= 4
        print(f"   ✅ Rule engine generated {len(sugs)} practical suggestions:")
        for s in sugs[:3]:
            print(f"      • [{s['priority']} Priority] {s['title']} (~{s['potential_savings_kg']} kg potential savings)")

        # 8. Reports & CSV Export
        print("\n8. Testing Reports Summary & CSV Generation...")
        summary = reports.get_reports_summary(period="weekly", meal_type=None, start_date=None, end_date=None, db=db)
        assert summary["record_count"] > 0
        print(f"   ✅ Audit summary generated: {summary['record_count']} records, {summary['total_wasted_kg']} kg total waste")

        csv_res = reports.export_waste_reports_csv(period="weekly", meal_type=None, start_date=None, end_date=None, db=db)
        assert csv_res.status_code == 200
        assert "text/csv" in csv_res.media_type
        print(f"   ✅ CSV Export generated successfully with Content-Disposition header")

        print("\n==================================================")
        print("🎉 ALL SMARTBITE DATABASE & BACKEND TESTS PASSED!")
        print("==================================================")
    finally:
        db.close()

if __name__ == "__main__":
    run_direct_tests()
