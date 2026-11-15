# 🌱 SmartBite – College Food Waste Management System

> **Environmental Studies (EVS) Assignment II Project**  
> **Selected Environmental Problem Statement:** *Food Waste in Institutional College Canteens and Campus Dining Facilities*  
> **Developed for:** Visual Studio Code Full-Stack Development

---

## 📖 1. Project Introduction

**SmartBite** is a modern, responsive, full-stack web application engineered to tackle the severe environmental and economic challenge of **food wastage in college canteens**. 

In educational institutions, dining halls routinely prepare large volumes of food based on rough assumptions rather than real-time consumption data. This systemic mismatch leads to substantial plate and kitchen leftovers being sent to municipal landfills—where decomposing organic matter generates methane, a potent greenhouse gas that exacerbates global climate change.

SmartBite replaces outdated manual estimations with a data-driven digital ecosystem. Kitchen teams log daily prepared meals, record unserved leftovers with exact reasons, monitor surplus food safely for donation, receive intelligent waste-cutting suggestions, and generate audit-ready compliance reports.

---

## 🌍 2. Environmental Problem Statement

- **The Challenge:** Institutional catering in colleges and universities experiences high variability in daily student attendance due to fluctuating timetable schedules, campus events, festivals, exams, and changing food preferences.
- **Ecological Impact:**
  1. **Landfill Burden & Methane Emissions:** Organic food scraps dumped in landfills undergo anaerobic decomposition, producing methane ($\text{CH}_4$) which possesses over 28 times the global warming potential of carbon dioxide ($\text{CO}_2$).
  2. **Wasted Embedded Resources:** Every kilogram of thrown-away rice, vegetables, or dairy squanders the vast water, agricultural land, chemical fertilizers, electricity, transport fuel, and human labor embedded in its farm-to-table lifecycle.
  3. **Social Inequity:** Fresh, wholesome meal surplus is discarded daily while underprivileged communities adjacent to urban campuses face food insecurity.

---

## 🎯 3. Project Objectives

1. **Systematic Tracking:** Accurately quantify daily food preparation (kg), served consumption (kg), and leftover waste (kg) across all four meal shifts (Breakfast, Lunch, Snacks, Dinner).
2. **Automated Calculations:** Provide instant computation of:
   $$\text{Food Waste (kg)} = \text{Quantity Prepared} - \text{Quantity Served}$$
   $$\text{Food Waste (\%)} = \left(\frac{\text{Food Waste}}{\text{Quantity Prepared}}\right) \times 100$$
3. **Root-Cause Diagnostics:** Categorize the drivers of canteen leftovers (excess preparation, low attendance, poor demand prediction, or quality issues) to eliminate repeat occurrences.
4. **Safe Redistribution:** Facilitate the rapid redistribution of wholesome surplus food to local community shelters and NGOs within safe consumption time limits under strict temperature protocols.
5. **Rule-Based Waste Reduction:** Dynamically generate actionable recommendations for mess managers (e.g., portion control ladles, staggered cooking shifts, academic timetable synchronization).
6. **Zero-Friction Audits:** Export comprehensive daily, weekly, and monthly CSV reports for university sustainability accreditation.

---

## 🛠️ 4. Technology Stack

### **Frontend**
- **Framework:** React JS 18 (Vite Bundler)
- **Language:** JavaScript (ES6+)
- **Styling:** Modern SaaS Environmental UI with Vanilla CSS3, CSS custom properties, and responsive layout
- **Routing:** React Router DOM v6
- **Data Visualizations:** Recharts (Interactive Bar Charts, Line Trajectories, Pie Breakdowns)
- **Icons:** Lucide React
- **HTTP Client:** Axios with JWT request/response interceptors

### **Backend**
- **Framework:** Python FastAPI
- **Server:** Uvicorn ASGI
- **ORM:** SQLAlchemy 2.0
- **Validation:** Pydantic v2
- **Driver:** PyMySQL & Cryptography
- **Database Engine:** MySQL (`smartbite_db`) with automatic graceful SQLite fallback for zero-friction demonstration out of the box.

---

## 📁 5. Folder Structure

```
food-management-system/
│
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py              # FastAPI application entry & CORS middleware
│   │   ├── database.py          # SQLAlchemy MySQL engine & SQLite fallback
│   │   ├── models.py            # User, FoodInventory, WasteRecord, SurplusFood models
│   │   ├── schemas.py           # Pydantic request/response validation schemas
│   │   ├── seed_data.py         # Persistent realistic college canteen dataset
│   │   └── routes/
│   │       ├── __init__.py
│   │       ├── auth.py          # User authentication & demo accounts
│   │       ├── inventory.py     # Food preparation inventory CRUD
│   │       ├── waste.py         # Leftover waste recording & auto-calculations
│   │       ├── analytics.py     # Dashboard KPIs, trends, categories, and top waste items
│   │       ├── surplus.py       # Food donation & safety protocol tracking
│   │       ├── suggestions.py   # Rule-based intelligent waste reduction engine
│   │       └── reports.py       # Audit summary and CSV file generation
│   ├── .env.example             # Database configuration template
│   ├── .env                     # Local environment variables
│   ├── init_db.sql              # MySQL DDL script with table definitions & indexes
│   └── requirements.txt         # Python dependencies
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Sidebar.jsx      # Responsive navigation with role badge
│   │   │   ├── Navbar.jsx       # Header with live DB engine indicator
│   │   │   ├── StatCard.jsx     # Modern metric card with trend badges
│   │   │   ├── ChartCard.jsx    # Chart container with controls
│   │   │   ├── Modal.jsx        # Accessible dialog window for forms
│   │   │   └── NotificationToast.jsx # Real-time success & error feedback
│   │   ├── context/
│   │   │   └── AuthContext.jsx  # Authentication state & persistent session
│   │   ├── pages/
│   │   │   ├── Login.jsx        # Branded sign-in with 1-click demo login
│   │   │   ├── Dashboard.jsx    # Live metrics, charts, motivational banner
│   │   │   ├── Inventory.jsx    # Meal batch preparation management
│   │   │   ├── WasteRecording.jsx # Automated waste logging with live formula
│   │   │   ├── Analytics.jsx    # Multi-horizon trends and food rankings
│   │   │   ├── Surplus.jsx      # Surplus food redistribution & safety rules
│   │   │   ├── Suggestions.jsx  # Practical rule-based optimization tips
│   │   │   └── Reports.jsx      # Filterable audits & CSV file downloads
│   │   ├── services/
│   │   │   └── api.js           # Axios API service client
│   │   ├── App.jsx              # Protected route architecture
│   │   ├── main.jsx             # React entry point
│   │   └── index.css            # Clean environmental theme styling
│   ├── index.html               # HTML wrapper with Plus Jakarta Sans typography
│   ├── package.json             # Frontend dependencies & npm scripts
│   └── vite.config.js           # Vite dev server configuration
│
├── run_backend.bat              # 1-click launcher for FastAPI backend
├── run_frontend.bat             # 1-click launcher for React Vite frontend
├── run_all.bat                  # 1-click launcher for both servers
├── test_api.py                  # Automated backend & database test suite
└── README.md                    # Project documentation
```

---

## 🔑 6. Demo Login Credentials

SmartBite features role-based access control with pre-seeded demo accounts. Click the one-click auto-fill buttons on the login page or enter:

| Role | Email Address | Password | Privileges |
| :--- | :--- | :--- | :--- |
| **Canteen Staff (Head Chef)** | `staff@smartbite.edu` | `staff123` | Log preparation batches, record leftovers, update surplus statuses. |
| **Canteen Admin (Faculty / EVS)** | `admin@smartbite.edu` | `admin123` | Full administrative oversight, analytics, recommendations, CSV export. |

---

## 💻 7. Installation & Setup Instructions

### Prerequisites
- **Visual Studio Code**
- **Python 3.10+** (Python 3.13 supported)
- **Node.js 18+** & **npm**
- *(Optional)* **MySQL Server** (e.g., MySQL Community Server or XAMPP)

---

### Step 1: Clone or Open in VS Code
Open the project root folder `food management system` in Visual Studio Code:
```bash
code .
```

---

### Step 2: Configure the MySQL Database (Optional but Recommended)
1. Ensure your MySQL server (or XAMPP MySQL) is running.
2. Open your MySQL client (MySQL CLI, MySQL Workbench, or phpMyAdmin) and run:
   ```sql
   CREATE DATABASE smartbite_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
3. *(Optional)* Import the schema and initial tables:
   ```bash
   mysql -u root -p smartbite_db < backend/init_db.sql
   ```
4. Verify or update database credentials in `backend/.env`:
   ```env
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_HOST=localhost
   DB_PORT=3306
   DB_NAME=smartbite_db
   ```

> **Smart Architecture Note:** If MySQL is not currently running on your laptop, the backend **automatically falls back to a local SQLite database (`smartbite.db`)**. This guarantees your project runs with zero errors and fully populated demo data immediately!

---

### Step 3: Run the FastAPI Backend
Open a terminal in VS Code:
```bash
# Windows PowerShell / CMD:
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```
Or simply double-click `run_backend.bat`.

- Backend API will be active at: **`http://127.0.0.1:8000`**
- Interactive Swagger API Documentation: **`http://127.0.0.1:8000/docs`**

---

### Step 4: Run the React Frontend
Open a second terminal in VS Code:
```bash
cd frontend
npm run dev
```
Or simply double-click `run_frontend.bat`.

- Frontend will be active at: **`http://localhost:5173`**

---

### Step 5: (Fastest) Launch Everything with One Click
Double-click **`run_all.bat`** in the root folder. Both backend and frontend servers will open concurrently in separate console windows!

---

## 🧪 8. Automated Verification Test Suite

To verify that all database tables, CRUD operations, calculations, and CSV generators function properly, run:
```bash
python test_api.py
```

Expected output:
```text
==================================================
🚀 SmartBite Full-Stack Direct Route & DB Test Suite
==================================================

1. Testing Database & System Status...
   ✅ Database engine active: SQLite (Fallback) (Target: root@localhost:3306/smartbite_db)

2. Testing Authentication & Demo Accounts...
   ✅ Found 2 demo accounts configured
   ✅ Canteen Staff login OK: Rajesh Kumar (Head Chef) (Canteen Staff)
   ✅ Admin login OK: Prof. Arvind Sharma (Canteen Admin) (Admin)

3. Testing Food Inventory Management...
   ✅ Retrieved 26 inventory records from database
   ✅ Created inventory item ID: Test Veg Hakka Noodles (28.5 kg)
   ✅ Updated inventory item quantity to 32.0 kg
   ✅ Deleted inventory test item

4. Testing Food Waste Recording & Auto-Calculation...
   ✅ Retrieved 26 persistent waste records
   ✅ Auto-calculation verified: Prep 50.0kg - Serv 42.0kg = Waste 8.0kg (16.0%)
   ✅ Cleaned up test waste record

5. Testing Analytics & Calculations...
   ✅ Live Dashboard Metrics: Prepared 175.0kg, Served 160.0kg, Waste 15.0kg (8.57%)
   ✅ Daily trends returned 7 days of data for charts
   ✅ Category breakdown returned 5 categories
   ✅ Meal type breakdown returned 4 meal shifts
   ✅ Top wasted leaderboard returned 6 dishes

6. Testing Surplus Food & Safety Protocols...
   ✅ Active surplus registry contains 4 items
   ✅ Updated surplus status for 'Veg Dum Biryani & Raita Packs' to 'Reserved'

7. Testing Intelligent Rule-Based Suggestions...
   ✅ Rule engine generated 5 practical suggestions:
      • [High Priority] Optimize Lunch Food Demand Prediction (~20.4 kg potential savings)
      • [Medium Priority] Cross-Reference Academic Calendar & Exam Schedules (~17.9 kg potential savings)
      • [Medium Priority] Introduce Standard Serving Ladles & 'Ask for Half' Option (~20.8 kg potential savings)

8. Testing Reports Summary & CSV Generation...
   ✅ Audit summary generated: 26 records, 99.2 kg total waste
   ✅ CSV Export generated successfully with Content-Disposition header

==================================================
🎉 ALL SMARTBITE DATABASE & BACKEND TESTS PASSED!
==================================================
```

---

## 📊 9. Detailed Feature Walkthrough

### 1. Modern Login Page
- Split-screen environmental aesthetic with dark forest green styling.
- Problem statement badge for EVS Assignment II.
- Quick auto-fill buttons for both demo accounts.
- Email and password validation with clear alert badges.

### 2. Live Dashboard
- **Top Metrics:** Total Food Prepared Today (kg), Total Served (kg), Total Leftover Waste (kg), Waste Reduction Rate (%).
- **Interactive Visualizations:**
  - Daily Preparation vs. Waste Bar Chart.
  - Daily Waste Percentage Trajectory Line Chart.
  - Waste by Food Category Pie Chart.
  - Meal Shift (Breakfast, Lunch, Snacks, Dinner) Prep vs. Consumption.
- **Recent Activities Section:** Real-time stream of recorded food waste entries.
- **Waste Reduction Progress Goal:** Visual progress bar tracking campus target of $<10\%$ waste.
- **Motivational Banner:** *"Save Food, Save the Planet!"*

### 3. Food Inventory Management
- Add new preparation batches specifying food dish, category, meal shift, cook date, and kitchen team.
- Search and filter by category, meal type, or date.
- Modal dialogs for adding and editing dishes.
- Delete confirmation modal preventing accidental removal.

### 4. Food Waste Recording
- Staff select an item from today's inventory or log custom leftover dishes.
- **Real-Time Automated Math:** Calculates waste kilograms and percentage dynamically as quantities are typed.
- **Validation Guard:** Prevents negative numbers and alerts if served food exceeds prepared food.
- Categorizes waste reasons: *Excess food preparation, Low student attendance, Poor demand prediction, Food quality issues, Other*.

### 5. Waste Analytics
- Period selectors (Past 7 Days, Past 14 Days, Past 30 Days).
- KPI summaries for total period preparation and waste.
- Ranked leaderboard of highest-wasted dishes with average loss percentages.
- Root-cause breakdown analyzing why food was left uneaten.

### 6. Food Donation / Surplus Management
- **Prominent Food Safety Banner:** Enforces hot holding ($>60^\circ\text{C}$) or refrigeration ($<5^\circ\text{C}$) standards. Prohibits distribution of spoiled or past-deadline food.
- Real-time status toggles: `Available`, `Reserved`, `Distributed`, `Discarded`.
- Tracks recipient partner organizations (e.g., Robin Hood Army, Local Shelters).

### 7. Intelligent Waste Reduction Suggestions
- Rule-based analysis inspects real database records to identify:
  - Top-wasted dishes and calculates exact percentage cuts.
  - Peak-waste meal shifts and advises split-batch cooking.
  - Low-attendance patterns and recommends calendar synchronization.
  - Serving ladle portion control and "Ask for Half" student campaigns.
  - On-campus vermicomposting circularity for organic peels.

### 8. Audit Reports & CSV Export
- Daily, weekly, monthly, and custom date range filters.
- Summary calculation footer.
- **One-Click CSV Export:** Generates an official downloadable `.csv` spreadsheet for dining hall audit reports.
- Print-ready clean layout.

---

## 🌿 10. Alignment with Environmental Studies (EVS) Goals

| EVS Principle | SmartBite Implementation |
| :--- | :--- |
| **Source Reduction** | Adjusts daily preparation batches according to consumption trends, preventing surplus at the kitchen level. |
| **Resource Conservation** | Conserves embedded water, fossil fuels, and agricultural labor by minimizing plate discards. |
| **Landfill Diversion** | Mitigates methane ($\text{CH}_4$) gas release by reducing municipal landfill organic dumping. |
| **Social Redistribution** | Routes edible, safe surplus to local food banks within verified safe holding windows. |
| **Circular Economy** | Recommends on-campus organic composting of vegetable scraps for university botanical landscaping. |

---

## 👨‍💻 Author & Academic Submission
- **Project Title:** SmartBite – College Food Waste Management System
- **Subject:** Environmental Studies (EVS) Assignment II
- **Target Platform:** Visual Studio Code (Local Windows Environment)
- **Status:** Complete, Tested, & Production-Ready
