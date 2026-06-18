-- ============================================
-- SmartPay AI Database
-- ============================================
CREATE DATABASE IF NOT EXISTS smartpay_db;
USE smartpay_db;

-- ============================================
-- Table: users
-- ============================================
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone_number VARCHAR(15) NOT NULL UNIQUE,
    profile_picture VARCHAR(255) DEFAULT NULL,
    reset_token VARCHAR(255) DEFAULT NULL,
    reset_token_expiry DATETIME DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================
-- Table: spending_categories
-- ============================================
CREATE TABLE spending_categories (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(50) NOT NULL UNIQUE,
    category_type ENUM('recharge', 'bill') NOT NULL
);

-- ============================================
-- Table: transactions
-- ============================================
CREATE TABLE transactions (
    transaction_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    category_id INT NOT NULL,
    transaction_type ENUM('recharge', 'bill') NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    status ENUM('success', 'failed', 'pending') DEFAULT 'pending',
    payment_method VARCHAR(50) DEFAULT NULL,
    transaction_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES spending_categories(category_id)
);

-- ============================================
-- Table: recharges
-- ============================================
CREATE TABLE recharges (
    recharge_id INT AUTO_INCREMENT PRIMARY KEY,
    transaction_id INT NOT NULL,
    user_id INT NOT NULL,
    recharge_type ENUM('mobile', 'dth', 'fastag') NOT NULL,
    operator_name VARCHAR(50) NOT NULL,
    account_number VARCHAR(50) NOT NULL,
    plan_details VARCHAR(255) DEFAULT NULL,
    FOREIGN KEY (transaction_id) REFERENCES transactions(transaction_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- ============================================
-- Table: bill_payments
-- ============================================
CREATE TABLE bill_payments (
    bill_id INT AUTO_INCREMENT PRIMARY KEY,
    transaction_id INT NOT NULL,
    user_id INT NOT NULL,
    bill_type ENUM('electricity', 'water', 'gas', 'broadband') NOT NULL,
    provider_name VARCHAR(50) NOT NULL,
    consumer_number VARCHAR(50) NOT NULL,
    billing_month VARCHAR(20) DEFAULT NULL,
    due_date DATE DEFAULT NULL,
    FOREIGN KEY (transaction_id) REFERENCES transactions(transaction_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- ============================================
-- Table: bill_predictions
-- ============================================
CREATE TABLE bill_predictions (
    prediction_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    bill_type ENUM('electricity', 'water', 'gas', 'broadband') NOT NULL,
    predicted_amount DECIMAL(10,2) NOT NULL,
    prediction_month VARCHAR(20) NOT NULL,
    model_version VARCHAR(20) DEFAULT 'v1.0',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- ============================================
-- Table: voice_command_logs
-- ============================================
CREATE TABLE voice_command_logs (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    command_text VARCHAR(255) NOT NULL,
    recognized_action VARCHAR(100) DEFAULT NULL,
    status ENUM('executed', 'failed', 'unrecognized') DEFAULT 'unrecognized',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- ============================================
-- Seed Data: spending_categories
-- ============================================
INSERT INTO spending_categories (category_name, category_type) VALUES
('Mobile Recharge', 'recharge'),
('DTH Recharge', 'recharge'),
('Fastag Recharge', 'recharge'),
('Electricity Bill', 'bill'),
('Water Bill', 'bill'),
('Gas Bill', 'bill'),
('Broadband Bill', 'bill');