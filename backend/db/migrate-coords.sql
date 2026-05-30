USE bloodlink;

ALTER TABLE users
  MODIFY location_lat DECIMAL(10, 7) NULL,
  MODIFY location_lng DECIMAL(11, 7) NULL;

ALTER TABLE blood_requests
  MODIFY location_lat DECIMAL(10, 7) NOT NULL,
  MODIFY location_lng DECIMAL(11, 7) NOT NULL;
