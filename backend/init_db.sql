-- SmartBite – College Food Waste Management System
-- MySQL Database Initialization Script

CREATE DATABASE IF NOT EXISTS smartbite_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE smartbite_db;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO-INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'Canteen Staff',
    department VARCHAR(100) DEFAULT 'College Canteen Division',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Food Inventory Table
CREATE TABLE IF NOT EXISTS food_inventory (
    id INT AUTO_INCREMENT PRIMARY KEY,
    food_name VARCHAR(150) NOT NULL,
    category VARCHAR(100) NOT NULL,
    quantity_prepared DECIMAL(8,2) NOT NULL,
    date DATE NOT NULL,
    meal_type VARCHAR(50) NOT NULL,
    prepared_by VARCHAR(100) DEFAULT 'Main Kitchen Team',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Waste Records Table
CREATE TABLE IF NOT EXISTS waste_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    inventory_id INT NULL,
    food_name VARCHAR(150) NOT NULL,
    meal_type VARCHAR(50) NOT NULL,
    category VARCHAR(100) NOT NULL,
    quantity_prepared DECIMAL(8,2) NOT NULL,
    quantity_served DECIMAL(8,2) NOT NULL,
    quantity_waste DECIMAL(8,2) NOT NULL,
    waste_percentage DECIMAL(5,2) NOT NULL,
    waste_reason VARCHAR(150) NOT NULL,
    recorded_date DATE NOT NULL,
    recorded_by VARCHAR(100) DEFAULT 'Canteen Staff',
    action_taken TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (inventory_id) REFERENCES food_inventory(id) ON DELETE SET NULL
);

-- 4. Surplus Food Table
CREATE TABLE IF NOT EXISTS surplus_food (
    id INT AUTO_INCREMENT PRIMARY KEY,
    food_name VARCHAR(150) NOT NULL,
    category VARCHAR(100) NOT NULL,
    available_quantity DECIMAL(8,2) NOT NULL,
    meal_type VARCHAR(50) NOT NULL,
    prepared_time VARCHAR(50) NOT NULL,
    safe_consumption_deadline VARCHAR(50) NOT NULL,
    storage_temperature VARCHAR(50) DEFAULT 'Hot Holding (>60°C) or Refrigerated (<5°C)',
    status VARCHAR(50) NOT NULL DEFAULT 'Available',
    recipient_organization VARCHAR(150) NULL,
    notes TEXT,
    updated_by VARCHAR(100) DEFAULT 'Canteen Staff',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_food_inventory_date ON food_inventory(date);
CREATE INDEX idx_waste_records_date ON waste_records(recorded_date);
CREATE INDEX idx_surplus_status ON surplus_food(status);
