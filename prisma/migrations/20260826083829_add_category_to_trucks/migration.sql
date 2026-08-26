-- DropIndex
DROP INDEX `audit_logs_userId_fkey` ON `audit_logs`;

-- DropIndex
DROP INDEX `employee_advances_employeeId_fkey` ON `employee_advances`;

-- DropIndex
DROP INDEX `employee_documents_employeeId_fkey` ON `employee_documents`;

-- DropIndex
DROP INDEX `employee_leaves_employeeId_fkey` ON `employee_leaves`;

-- DropIndex
DROP INDEX `expenses_employeeId_fkey` ON `expenses`;

-- DropIndex
DROP INDEX `expenses_tripId_fkey` ON `expenses`;

-- DropIndex
DROP INDEX `expenses_truckId_fkey` ON `expenses`;

-- DropIndex
DROP INDEX `fines_employeeId_fkey` ON `fines`;

-- DropIndex
DROP INDEX `fines_truckId_fkey` ON `fines`;

-- DropIndex
DROP INDEX `fuel_transactions_driverId_fkey` ON `fuel_transactions`;

-- DropIndex
DROP INDEX `fuel_transactions_tripId_fkey` ON `fuel_transactions`;

-- DropIndex
DROP INDEX `fuel_transactions_truckId_fkey` ON `fuel_transactions`;

-- DropIndex
DROP INDEX `invoice_payments_invoiceId_fkey` ON `invoice_payments`;

-- DropIndex
DROP INDEX `invoice_trips_tripId_fkey` ON `invoice_trips`;

-- DropIndex
DROP INDEX `invoices_customerId_fkey` ON `invoices`;

-- DropIndex
DROP INDEX `salary_payments_employeeId_fkey` ON `salary_payments`;

-- DropIndex
DROP INDEX `salary_structures_employeeId_fkey` ON `salary_structures`;

-- DropIndex
DROP INDEX `trip_expenses_tripId_fkey` ON `trip_expenses`;

-- DropIndex
DROP INDEX `trips_customerId_fkey` ON `trips`;

-- DropIndex
DROP INDEX `trips_driverId_fkey` ON `trips`;

-- DropIndex
DROP INDEX `trips_truckId_fkey` ON `trips`;

-- DropIndex
DROP INDEX `truck_assignments_employeeId_fkey` ON `truck_assignments`;

-- DropIndex
DROP INDEX `truck_assignments_truckId_fkey` ON `truck_assignments`;

-- DropIndex
DROP INDEX `truck_documents_truckId_fkey` ON `truck_documents`;

-- DropIndex
DROP INDEX `truck_expenses_tripId_fkey` ON `truck_expenses`;

-- DropIndex
DROP INDEX `truck_expenses_truckId_fkey` ON `truck_expenses`;

-- DropIndex
DROP INDEX `truck_maintenance_truckId_fkey` ON `truck_maintenance`;

-- AlterTable
ALTER TABLE `trucks` ADD COLUMN `category` VARCHAR(191) NOT NULL DEFAULT 'Trucks';

-- AddForeignKey
ALTER TABLE `employee_passports` ADD CONSTRAINT `employee_passports_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `employees`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `employee_visas` ADD CONSTRAINT `employee_visas_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `employees`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `employee_licenses` ADD CONSTRAINT `employee_licenses_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `employees`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `employee_documents` ADD CONSTRAINT `employee_documents_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `employees`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `salary_structures` ADD CONSTRAINT `salary_structures_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `employees`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `employee_advances` ADD CONSTRAINT `employee_advances_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `employees`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `employee_leaves` ADD CONSTRAINT `employee_leaves_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `employees`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `truck_documents` ADD CONSTRAINT `truck_documents_truckId_fkey` FOREIGN KEY (`truckId`) REFERENCES `trucks`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `truck_assignments` ADD CONSTRAINT `truck_assignments_truckId_fkey` FOREIGN KEY (`truckId`) REFERENCES `trucks`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `truck_assignments` ADD CONSTRAINT `truck_assignments_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `employees`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `trips` ADD CONSTRAINT `trips_truckId_fkey` FOREIGN KEY (`truckId`) REFERENCES `trucks`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `trips` ADD CONSTRAINT `trips_driverId_fkey` FOREIGN KEY (`driverId`) REFERENCES `employees`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `trips` ADD CONSTRAINT `trips_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `customers`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `trip_expenses` ADD CONSTRAINT `trip_expenses_tripId_fkey` FOREIGN KEY (`tripId`) REFERENCES `trips`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `fuel_transactions` ADD CONSTRAINT `fuel_transactions_truckId_fkey` FOREIGN KEY (`truckId`) REFERENCES `trucks`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `fuel_transactions` ADD CONSTRAINT `fuel_transactions_driverId_fkey` FOREIGN KEY (`driverId`) REFERENCES `employees`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `fuel_transactions` ADD CONSTRAINT `fuel_transactions_tripId_fkey` FOREIGN KEY (`tripId`) REFERENCES `trips`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `truck_maintenance` ADD CONSTRAINT `truck_maintenance_truckId_fkey` FOREIGN KEY (`truckId`) REFERENCES `trucks`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `truck_expenses` ADD CONSTRAINT `truck_expenses_truckId_fkey` FOREIGN KEY (`truckId`) REFERENCES `trucks`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `truck_expenses` ADD CONSTRAINT `truck_expenses_tripId_fkey` FOREIGN KEY (`tripId`) REFERENCES `trips`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `invoices` ADD CONSTRAINT `invoices_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `customers`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `invoice_trips` ADD CONSTRAINT `invoice_trips_invoiceId_fkey` FOREIGN KEY (`invoiceId`) REFERENCES `invoices`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `invoice_trips` ADD CONSTRAINT `invoice_trips_tripId_fkey` FOREIGN KEY (`tripId`) REFERENCES `trips`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `invoice_payments` ADD CONSTRAINT `invoice_payments_invoiceId_fkey` FOREIGN KEY (`invoiceId`) REFERENCES `invoices`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `salary_payments` ADD CONSTRAINT `salary_payments_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `employees`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `fines` ADD CONSTRAINT `fines_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `employees`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `fines` ADD CONSTRAINT `fines_truckId_fkey` FOREIGN KEY (`truckId`) REFERENCES `trucks`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `audit_logs` ADD CONSTRAINT `audit_logs_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `expenses` ADD CONSTRAINT `expenses_truckId_fkey` FOREIGN KEY (`truckId`) REFERENCES `trucks`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `expenses` ADD CONSTRAINT `expenses_tripId_fkey` FOREIGN KEY (`tripId`) REFERENCES `trips`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `expenses` ADD CONSTRAINT `expenses_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `employees`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
