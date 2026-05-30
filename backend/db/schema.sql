CREATE DATABASE IF NOT EXISTS bloodlink;
USE bloodlink;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('donor', 'patient', 'admin') NOT NULL DEFAULT 'donor',
  phone VARCHAR(15) NOT NULL UNIQUE,
  phone_verified BOOLEAN DEFAULT FALSE,
  aadhar VARCHAR(12) NULL UNIQUE,
  blood_group VARCHAR(5) NULL,
  age INT NULL,
  gender VARCHAR(20) NULL,
  location_lat DECIMAL(10, 7) NULL,
  location_lng DECIMAL(11, 7) NULL,
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_role (role),
  INDEX idx_blood_group (blood_group),
  INDEX idx_available (is_available)
);

CREATE TABLE IF NOT EXISTS blood_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  patient_id INT NOT NULL,
  blood_group VARCHAR(5) NOT NULL,
  units INT NOT NULL DEFAULT 1,
  urgency ENUM('normal', 'emergency') NOT NULL DEFAULT 'normal',
  location_lat DECIMAL(10, 7) NOT NULL,
  location_lng DECIMAL(11, 7) NOT NULL,
  status ENUM('pending', 'accepted', 'in_progress', 'completed', 'cancelled') NOT NULL DEFAULT 'pending',
  donor_id INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (donor_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_status (status),
  INDEX idx_blood_group_req (blood_group)
);

CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  related_request_id INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (related_request_id) REFERENCES blood_requests(id) ON DELETE SET NULL,
  INDEX idx_user_read (user_id, is_read)
);

CREATE TABLE IF NOT EXISTS otp_verification (
  id INT AUTO_INCREMENT PRIMARY KEY,
  phone VARCHAR(15) NOT NULL,
  otp_hash VARCHAR(255) NOT NULL,
  expires_at DATETIME NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  verified_at DATETIME NULL,
  attempt_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_phone (phone),
  INDEX idx_phone_verified (phone, verified, verified_at)
);

CREATE TABLE IF NOT EXISTS password_reset_otp (
  id INT AUTO_INCREMENT PRIMARY KEY,
  phone VARCHAR(15) NOT NULL,
  otp_hash VARCHAR(255) NOT NULL,
  expires_at DATETIME NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  verified_at DATETIME NULL,
  attempt_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_reset_phone (phone),
  INDEX idx_reset_phone_verified (phone, verified, verified_at)
);

-- Optional default admin (password: Admin@123) — change after first login
-- INSERT INTO users (name, email, password, role, phone, phone_verified)
-- VALUES ('Admin', 'admin@bloodlink.com', '$2a$10$...', 'admin', '9999999999', TRUE);
