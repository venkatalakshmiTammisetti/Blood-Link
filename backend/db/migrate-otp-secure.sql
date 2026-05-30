USE bloodlink;

-- Upgrade otp_verification for hashed OTP storage (run once on existing databases)
ALTER TABLE otp_verification
  CHANGE COLUMN otp otp_hash VARCHAR(255) NOT NULL,
  ADD COLUMN attempt_count INT NOT NULL DEFAULT 0,
  ADD COLUMN verified_at DATETIME NULL AFTER verified;

-- Invalidate legacy plain-text OTP rows (cannot verify after hash migration)
TRUNCATE TABLE otp_verification;
