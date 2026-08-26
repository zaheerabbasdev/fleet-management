-- Safe: Add missing columns to customers table if they don't exist
-- city column
SET @col_exists = (
  SELECT COUNT(*) FROM information_schema.COLUMNS 
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'customers' AND COLUMN_NAME = 'city'
);
SET @sql = IF(@col_exists = 0, 'ALTER TABLE `customers` ADD COLUMN `city` VARCHAR(191) NULL', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- country column
SET @col_exists2 = (
  SELECT COUNT(*) FROM information_schema.COLUMNS 
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'customers' AND COLUMN_NAME = 'country'
);
SET @sql2 = IF(@col_exists2 = 0, "ALTER TABLE `customers` ADD COLUMN `country` VARCHAR(191) NOT NULL DEFAULT 'Oman'", 'SELECT 1');
PREPARE stmt2 FROM @sql2;
EXECUTE stmt2;
DEALLOCATE PREPARE stmt2;

-- creditLimit column
SET @col_exists3 = (
  SELECT COUNT(*) FROM information_schema.COLUMNS 
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'customers' AND COLUMN_NAME = 'creditLimit'
);
SET @sql3 = IF(@col_exists3 = 0, 'ALTER TABLE `customers` ADD COLUMN `creditLimit` DECIMAL(12,3) NOT NULL DEFAULT 0', 'SELECT 1');
PREPARE stmt3 FROM @sql3;
EXECUTE stmt3;
DEALLOCATE PREPARE stmt3;
