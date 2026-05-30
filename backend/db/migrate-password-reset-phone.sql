USE bloodlink;

DROP TABLE IF EXISTS password_reset_otp;

CREATE TABLE password_reset_otp (
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
