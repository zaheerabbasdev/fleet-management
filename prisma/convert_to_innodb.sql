-- Your local database tables use the MyISAM engine, which does not support foreign keys,
-- cascading deletes or transactions. Run this once to switch them to InnoDB.
-- (Back up first. Foreign keys are NOT added by this file.)

ALTER TABLE `audit_logs` ENGINE=InnoDB;
ALTER TABLE `customers` ENGINE=InnoDB;
ALTER TABLE `employee_advances` ENGINE=InnoDB;
ALTER TABLE `employee_documents` ENGINE=InnoDB;
ALTER TABLE `employee_leaves` ENGINE=InnoDB;
ALTER TABLE `employee_licenses` ENGINE=InnoDB;
ALTER TABLE `employee_passports` ENGINE=InnoDB;
ALTER TABLE `employee_visas` ENGINE=InnoDB;
ALTER TABLE `employees` ENGINE=InnoDB;
ALTER TABLE `expenses` ENGINE=InnoDB;
ALTER TABLE `fines` ENGINE=InnoDB;
ALTER TABLE `fuel_transactions` ENGINE=InnoDB;
ALTER TABLE `invoice_payments` ENGINE=InnoDB;
ALTER TABLE `invoice_trips` ENGINE=InnoDB;
ALTER TABLE `invoices` ENGINE=InnoDB;
ALTER TABLE `notifications` ENGINE=InnoDB;
ALTER TABLE `salary_payments` ENGINE=InnoDB;
ALTER TABLE `salary_structures` ENGINE=InnoDB;
ALTER TABLE `settings` ENGINE=InnoDB;
ALTER TABLE `trip_expenses` ENGINE=InnoDB;
ALTER TABLE `trips` ENGINE=InnoDB;
ALTER TABLE `truck_assignments` ENGINE=InnoDB;
ALTER TABLE `truck_documents` ENGINE=InnoDB;
ALTER TABLE `truck_expenses` ENGINE=InnoDB;
ALTER TABLE `truck_maintenance` ENGINE=InnoDB;
ALTER TABLE `trucks` ENGINE=InnoDB;
ALTER TABLE `users` ENGINE=InnoDB;
ALTER TABLE `_prisma_migrations` ENGINE=InnoDB;
