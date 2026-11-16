CREATE DATABASE IF NOT EXISTS hemopulse_db;
USE hemopulse_db;

CREATE TABLE IF NOT EXISTS Donors (
    donor_id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(15) UNIQUE NOT NULL,
    blood_group VARCHAR(5) NOT NULL,
    last_donation_date DATE,
    is_eligible BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS BloodInventory (
    unit_id INT AUTO_INCREMENT PRIMARY KEY,
    blood_group VARCHAR(5) NOT NULL,
    component_type VARCHAR(20) NOT NULL,
    quantity INT NOT NULL,
    expiry_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'Available',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sample data so the dashboard isn't empty
INSERT INTO BloodInventory (blood_group, component_type, quantity, expiry_date) VALUES
('O+', 'Whole Blood', 10, '2026-12-31'),
('A-', 'Plasma', 5, '2026-11-15'),
('B+', 'RBC', 8, '2026-10-20');