import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import bcrypt from "bcryptjs";

const databaseUrl = process.env.DATABASE_URL || "mysql://root@localhost:3306/logistics";
const adapter = new PrismaMariaDb(databaseUrl);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  // 1. Clear existing data
  await prisma.auditLog.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.fine.deleteMany({});
  await prisma.invoicePayment.deleteMany({});
  await prisma.invoiceTrip.deleteMany({});
  await prisma.invoice.deleteMany({});
  await prisma.tripExpense.deleteMany({});
  await prisma.fuelTransaction.deleteMany({});
  await prisma.trip.deleteMany({});
  await prisma.customer.deleteMany({});
  await prisma.truckAssignment.deleteMany({});
  await prisma.truckDocument.deleteMany({});
  await prisma.truckMaintenance.deleteMany({});
  await prisma.truckExpense.deleteMany({});
  await prisma.truck.deleteMany({});
  await prisma.employeeLeave.deleteMany({});
  await prisma.employeeAdvance.deleteMany({});
  await prisma.salaryStructure.deleteMany({});
  await prisma.salaryPayment.deleteMany({});
  await prisma.employeeDocument.deleteMany({});
  await prisma.employeeLicense.deleteMany({});
  await prisma.employeeVisa.deleteMany({});
  await prisma.employeePassport.deleteMany({});
  await prisma.employee.deleteMany({});
  await prisma.setting.deleteMany({});
  await prisma.user.deleteMany({});

  // 2. Create Settings
  const settingsData = [
    { key: "company_name", value: "Logistics LLC" },
    { key: "company_address", value: "Mina Al Fahal, Muscat, Oman" },
    { key: "company_cr", value: "CR-1029485" },
    { key: "company_vat", value: "OM110029348" },
    { key: "currency", value: "OMR" },
    { key: "timezone", value: "Asia/Muscat" },
    { key: "warning_days_expiry", value: "30" },
    { key: "invoice_prefix", value: "INV-" },
    { key: "employee_prefix", value: "EMP-" },
    { key: "truck_prefix", value: "TRK-" },
    { key: "trip_prefix", value: "TRP-" },
    { key: "tax_enabled", value: "true" },
    { key: "tax_name", value: "VAT" },
    { key: "tax_rate", value: "5.000" },
    { key: "maintenance_km_interval", value: "10000" },
  ];

  for (const set of settingsData) {
    await prisma.setting.create({ data: set });
  }

  // 3. Create Admin User
  const passwordHash = await bcrypt.hash("Admin@Oman2026", 10);
  const admin = await prisma.user.create({
    data: {
      email: "admin@omantrucking.com",
      name: "Salim Al-Harthy",
      passwordHash,
      role: "ADMIN",
    },
  });
  console.log("Created Admin User:", admin.email);

  // 4. Create Customers
  const customerA = await prisma.customer.create({
    data: {
      custId: "CUST-0001",
      companyName: "Oman Cement Company SAOG",
      contactPerson: "Hilal Al-Kindi",
      phone: "+968 2456 9900",
      email: "logistics@omancement.com",
      address: "Rusayl Industrial Estate, Muscat",
      taxNumber: "OM110293847",
      paymentTerms: "Net 30",
    },
  });

  const customerB = await prisma.customer.create({
    data: {
      custId: "CUST-0002",
      companyName: "Dhofar Beverage LLC",
      contactPerson: "Amur Al-Mashani",
      phone: "+968 2321 4455",
      email: "info@dhofarbeverage.com",
      address: "Salalah Free Zone, Dhofar",
      taxNumber: "OM110554433",
      paymentTerms: "Net 15",
    },
  });

  console.log("Created Customers");

  // 5. Create Employees (Drivers & Office)
  const employeeData = [
    {
      empId: "EMP-0001",
      name: "Ahmed Khan",
      fatherName: "Ibrahim Khan",
      dob: new Date("1988-05-12"),
      gender: "Male",
      nationality: "Pakistani",
      phone: "+968 9123 4567",
      altPhone: "+92 300 1234567",
      email: "ahmed.khan@gmail.com",
      currentAddress: "Ghala Industrial Area, Muscat, Oman",
      permanentAddress: "Gulberg III, Lahore, Pakistan",
      emergencyName: "Mohammed Khan (Brother)",
      emergencyPhone: "+92 301 7654321",
      joiningDate: new Date("2024-01-15"),
      arrivalDate: new Date("2023-12-28"),
      status: "Active",
      notes: "Heavy truck driver. Very reliable.",
    },
    {
      empId: "EMP-0002",
      name: "Ali Raza",
      fatherName: "Ghulam Raza",
      dob: new Date("1992-09-20"),
      gender: "Male",
      nationality: "Pakistani",
      phone: "+968 9234 5678",
      email: "ali.raza@yahoo.com",
      currentAddress: "Mabella Industrial, Seeb, Oman",
      permanentAddress: "Samanabad, Faisalabad, Pakistan",
      emergencyName: "Fatima Raza (Spouse)",
      emergencyPhone: "+968 9234 5600",
      joiningDate: new Date("2024-06-01"),
      arrivalDate: new Date("2024-05-15"),
      status: "Active",
      notes: "Assigned to long trips (Muscat to Salalah route).",
    },
    {
      empId: "EMP-0003",
      name: "Said Al-Masrouri",
      fatherName: "Nasser Al-Masrouri",
      dob: new Date("1985-03-08"),
      gender: "Male",
      nationality: "Oman",
      phone: "+968 9988 7766",
      email: "said.masrouri@outlook.com",
      currentAddress: "Al-Khoudh, Seeb, Oman",
      permanentAddress: "Al-Khoudh, Seeb, Oman",
      emergencyName: "Nasser Al-Masrouri (Father)",
      emergencyPhone: "+968 9911 2233",
      joiningDate: new Date("2023-08-10"),
      arrivalDate: null,
      status: "Active",
      notes: "Omani National. Familiar with ROP rules and border crossings.",
    },
    {
      empId: "EMP-0004",
      name: "Mohammad Usman",
      fatherName: "Abdul Latif",
      dob: new Date("1990-11-02"),
      gender: "Male",
      nationality: "Indian",
      phone: "+968 9345 6789",
      email: "usman.india@gmail.com",
      currentAddress: "Wadi Kabir, Muscat, Oman",
      permanentAddress: "Kochi, Kerala, India",
      emergencyName: "Abdul Latif (Father)",
      emergencyPhone: "+91 484 223344",
      joiningDate: new Date("2025-02-01"),
      arrivalDate: new Date("2025-01-20"),
      status: "Active",
      notes: "Experienced driver. Good track record.",
    },
    {
      empId: "EMP-0005",
      name: "Harish Kumar",
      fatherName: "Ram Kumar",
      dob: new Date("1983-07-15"),
      gender: "Male",
      nationality: "Indian",
      phone: "+968 9456 7890",
      email: "harish.kumar@gmail.com",
      currentAddress: "Ruwi, Muscat, Oman",
      permanentAddress: "Chennai, Tamil Nadu, India",
      emergencyName: "Renu Kumar (Spouse)",
      emergencyPhone: "+91 44 987654",
      joiningDate: new Date("2024-03-10"),
      arrivalDate: new Date("2024-02-25"),
      status: "On Leave",
      notes: "Currently in India on annual leave. Expected back next month.",
    },
  ];

  const employees = [];
  for (const emp of employeeData) {
    const createdEmp = await prisma.employee.create({ data: emp });
    employees.push(createdEmp);
  }
  console.log("Created Employees");

  // Helper date function to offset dates for expiries (testing alerts)
  const addDays = (date: Date, days: number) => {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
  };

  // 6. Create Passports, Visas, Licenses, Salary Structures for employees
  for (let i = 0; i < employees.length; i++) {
    const emp = employees[i];
    const isExpat = emp.nationality !== "Oman";

    // Passport (All employees have one)
    await prisma.employeePassport.create({
      data: {
        employeeId: emp.id,
        passportNumber: `P${102938 + i}`,
        issueDate: new Date("2022-05-15"),
        // Create an expiry soon (18 days) for driver 1, and normal expiries for others
        expiryDate: i === 0 ? addDays(new Date(), 18) : new Date("2032-05-15"),
        issuingCountry: emp.nationality,
        fileUrl: "https://res.cloudinary.com/demo/image/upload/v1580000000/passport_mock.pdf",
      },
    });

    // Visa (Only Expatriates have one)
    if (isExpat) {
      await prisma.employeeVisa.create({
        data: {
          employeeId: emp.id,
          visaNumber: `V${876543 + i}`,
          visaType: "Work Visa",
          sponsor: "Logistics LLC",
          issueDate: new Date("2024-01-01"),
          // Create an expiry soon (25 days) for driver 2, and normal expiries for others
          expiryDate: i === 1 ? addDays(new Date(), 25) : new Date("2026-01-01"),
          status: "Valid",
          notes: "Oman Residence Card linked.",
          fileUrl: "https://res.cloudinary.com/demo/image/upload/v1580000000/visa_mock.pdf",
        },
      });
    }

    // License
    await prisma.employeeLicense.create({
      data: {
        employeeId: emp.id,
        licenseNumber: `L${304958 + i}`,
        licenseType: "Heavy Vehicle (Truck)",
        obtainedDate: new Date("2020-03-10"),
        issueDate: new Date("2023-04-12"),
        expiryDate: i === 3 ? addDays(new Date(), 12) : new Date("2028-04-12"),
        issuingAuthority: "ROP",
        notes: "Verified by Royal Oman Police.",
        fileUrl: "https://res.cloudinary.com/demo/image/upload/v1580000000/license_mock.pdf",
      },
    });

    // Civil ID / Resident ID (Employee Document)
    await prisma.employeeDocument.create({
      data: {
        employeeId: emp.id,
        docType: isExpat ? "Resident Card" : "Civil ID",
        docNumber: `ID${506070 + i}`,
        issueDate: new Date("2024-01-10"),
        expiryDate: i === 4 ? addDays(new Date(), 5) : new Date("2026-01-10"),
        notes: "Primary National Identity Document.",
        fileUrl: "https://res.cloudinary.com/demo/image/upload/v1580000000/id_mock.pdf",
      },
    });

    // Salary Structure
    await prisma.salaryStructure.create({
      data: {
        employeeId: emp.id,
        basicSalary: isExpat ? 220.000 : 380.000,
        accommodationAllowance: 50.000,
        foodAllowance: 30.000,
        transportAllowance: 20.000,
        otherAllowance: i === 2 ? 50.000 : 10.000,
        overtimeRate: 1.500, // 1.5 OMR/hr
        effectiveDate: emp.joiningDate,
        isActive: true,
      },
    });
  }

  console.log("Created Employee credentials and structures");

  // 7. Create Trucks
  const truckData = [
    {
      truckId: "TRK-0001",
      regNumber: "OM-1234",
      plateNumber: "1234",
      plateCode: "A",
      truckType: "Flatbed Semi-Trailer",
      make: "Volvo",
      model: "FH16",
      year: 2021,
      vin: "YV2RT40D2LB123456",
      engineNumber: "D16K650-9876",
      odometer: 125400,
      purchaseDate: new Date("2021-08-15"),
      status: "Available",
      notes: "Excellent condition. Regularly serviced at Volvo Oman.",
    },
    {
      truckId: "TRK-0002",
      regNumber: "OM-5678",
      plateNumber: "5678",
      plateCode: "YA",
      truckType: "Tipper Truck",
      make: "Mercedes-Benz",
      model: "Actros 4140",
      year: 2019,
      vin: "WDB9634031L234567",
      engineNumber: "OM471-4321",
      odometer: 248900,
      purchaseDate: new Date("2020-02-10"),
      status: "On Trip",
      notes: "Mainly used for aggregate transportation.",
    },
    {
      truckId: "TRK-0003",
      regNumber: "OM-9012",
      plateNumber: "9012",
      plateCode: "M",
      truckType: "Trailer",
      make: "Scania",
      model: "R500",
      year: 2022,
      vin: "YS2R6X20002345678",
      engineNumber: "DC16-8765",
      odometer: 85200,
      purchaseDate: new Date("2022-09-01"),
      status: "Under Maintenance",
      notes: "Brake service currently ongoing.",
    },
  ];

  const trucks = [];
  for (const trk of truckData) {
    const createdTrk = await prisma.truck.create({ data: trk });
    trucks.push(createdTrk);
  }
  console.log("Created Trucks");

  // 8. Create Truck Documents
  for (let i = 0; i < trucks.length; i++) {
    const trk = trucks[i];
    // Registration Mulkiya
    await prisma.truckDocument.create({
      data: {
        truckId: trk.id,
        docType: "Mulkiya (Registration)",
        docNumber: `MULK-${889900 + i}`,
        issueDate: new Date("2025-06-01"),
        // OM-1234 (index 0) expires soon in 20 days
        expiryDate: i === 0 ? addDays(new Date(), 20) : new Date("2026-06-01"),
        notes: "Royal Oman Police Mulkiya registration document.",
        fileUrl: "https://res.cloudinary.com/demo/image/upload/v1580000000/mulkiya_mock.pdf",
      },
    });

    // Insurance
    await prisma.truckDocument.create({
      data: {
        truckId: trk.id,
        docType: "Insurance Policy",
        docNumber: `INS-${776655 + i}`,
        issueDate: new Date("2025-06-01"),
        expiryDate: new Date("2026-06-01"),
        notes: "AXA Oman Comprehensive Commercial vehicle coverage.",
        fileUrl: "https://res.cloudinary.com/demo/image/upload/v1580000000/insurance_mock.pdf",
      },
    });
  }

  console.log("Created Truck Documents");

  // 9. Driver Assignments
  // Ahmed (EMP-0001) assigned to Truck 1 (TRK-0001 Volvo)
  await prisma.truckAssignment.create({
    data: {
      truckId: trucks[0].id,
      employeeId: employees[0].id,
      startDate: new Date("2024-01-15"),
      status: "Active",
      notes: "Ahmed's primary assigned truck.",
    },
  });

  // Ali Raza (EMP-0002) assigned to Truck 2 (TRK-0002 Mercedes)
  await prisma.truckAssignment.create({
    data: {
      truckId: trucks[1].id,
      employeeId: employees[1].id,
      startDate: new Date("2024-06-01"),
      status: "Active",
      notes: "Ali Raza's primary assigned truck.",
    },
  });

  console.log("Created Driver-Truck Assignments");

  // 10. Create Trips
  // Trip 1 (Completed): Muscat to Salalah (Volvo OM-1234, Ahmed driver, Cement customer)
  const trip1 = await prisma.trip.create({
    data: {
      tripId: "TRP-0001",
      tripDate: new Date("2026-08-10"),
      truckId: trucks[0].id,
      driverId: employees[0].id,
      customerId: customerA.id,
      origin: "Muscat",
      destination: "Salalah",
      startTime: new Date("2026-08-10T06:00:00Z"),
      endTime: new Date("2026-08-11T18:00:00Z"),
      startingOdometer: 124000,
      endingOdometer: 125000,
      distance: 1000, // 1000 KM
      cargo: "Bulk Cement (50 Tons)",
      revenue: 1200.000, // 1200 OMR
      status: "Completed",
      notes: "Completed smoothly. Drop-off signed.",
    },
  });

  // Trip Expenses for Trip 1
  await prisma.tripExpense.create({
    data: {
      tripId: trip1.id,
      date: new Date("2026-08-10"),
      category: "Fuel",
      amount: 150.000, // Fuel filled along the road
      description: "Fuel at Shell Adam Station",
    },
  });
  await prisma.tripExpense.create({
    data: {
      tripId: trip1.id,
      date: new Date("2026-08-10"),
      category: "Driver Allowance",
      amount: 50.000,
      description: "Muscat-Salalah overnight driver allowance",
    },
  });
  await prisma.tripExpense.create({
    data: {
      tripId: trip1.id,
      date: new Date("2026-08-11"),
      category: "Toll",
      amount: 10.000,
      description: "Border/weighbridge tolls",
    },
  });

  // Trip 2 (In Progress): Muscat to Sohar (Mercedes OM-5678, Ali driver, Cement customer)
  const trip2 = await prisma.trip.create({
    data: {
      tripId: "TRP-0002",
      tripDate: new Date("2026-08-23"),
      truckId: trucks[1].id,
      driverId: employees[1].id,
      customerId: customerA.id,
      origin: "Muscat",
      destination: "Sohar",
      startTime: new Date("2026-08-23T08:00:00Z"),
      startingOdometer: 248600,
      endingOdometer: null,
      distance: 0,
      cargo: "Concrete Pipes",
      revenue: 350.000,
      status: "In Progress",
      notes: "Expected delivery on 25th August.",
    },
  });

  console.log("Created Trips and Trip Expenses");

  // 11. Create Fuel Transactions
  await prisma.fuelTransaction.create({
    data: {
      fuelId: "FUL-0001",
      date: new Date("2026-08-10"),
      truckId: trucks[0].id,
      driverId: employees[0].id,
      tripId: trip1.id,
      odometer: 124000,
      fuelStation: "Oman Oil Haima",
      fuelType: "Diesel",
      liters: 250.000,
      pricePerLiter: 0.258, // Standard diesel price in Oman is around 258 baisa
      totalAmount: 64.500, // 250 * 0.258
      paymentMethod: "Fuel Card",
    },
  });

  await prisma.fuelTransaction.create({
    data: {
      fuelId: "FUL-0002",
      date: new Date("2026-08-11"),
      truckId: trucks[0].id,
      driverId: employees[0].id,
      tripId: trip1.id,
      odometer: 124800,
      fuelStation: "Shell Salalah",
      fuelType: "Diesel",
      liters: 200.000,
      pricePerLiter: 0.258,
      totalAmount: 51.600, // 200 * 0.258
      paymentMethod: "Cash",
    },
  });

  console.log("Created Fuel Transactions");

  // 12. Maintenance Records
  await prisma.truckMaintenance.create({
    data: {
      truckId: trucks[2].id, // Truck 3 Scania (Under Maintenance)
      date: new Date("2026-08-22"),
      maintenanceType: "Brake Repair",
      description: "Replace front and rear brake pads and drums.",
      odometer: 85200,
      workshop: "Suhail Bahwan Automotive - Scania Division",
      cost: 450.000,
      nextServiceDate: new Date("2026-11-22"),
      nextServiceOdometer: 95000,
      notes: "Brakes were heavily worn. Scheduled for completion soon.",
    },
  });

  // 13. General Truck Expenses
  await prisma.truckExpense.create({
    data: {
      truckId: trucks[0].id,
      date: new Date("2026-08-01"),
      category: "Registration",
      amount: 120.000, // 120 OMR Mulkiya renewal ROP fee
      description: "ROP Mulkiya annual renewal and inspection fee",
    },
  });

  console.log("Created Maintenance and Expenses");

  // 14. Invoices & Invoice Payments
  // Create Invoice for Cement Company based on Completed Trip 1
  const invoice = await prisma.invoice.create({
    data: {
      invoiceNumber: "INV-2026-0001",
      customerId: customerA.id,
      date: new Date("2026-08-15"),
      dueDate: new Date("2026-09-15"),
      subtotal: 1200.000,
      taxAmount: 60.000, // 5% VAT = 60 OMR
      discountAmount: 0.000,
      totalAmount: 1260.000, // Subtotal + Tax
      status: "Partially Paid",
      notes: "Bulk Cement transport invoice.",
    },
  });

  // Link invoice to Trip 1
  await prisma.invoiceTrip.create({
    data: {
      invoiceId: invoice.id,
      tripId: trip1.id,
    },
  });

  // Invoice Payment
  await prisma.invoicePayment.create({
    data: {
      invoiceId: invoice.id,
      date: new Date("2026-08-20"),
      amount: 500.000, // 500 OMR paid of 1260 OMR
      paymentMethod: "Bank Transfer",
      referenceNumber: "TXN98203984",
      notes: "Initial advance/partial payment received.",
    },
  });

  console.log("Created Invoices and Payments");

  // 15. Employee Advances & Fines
  // Ahmed (EMP-0001) took an advance of 150 OMR, 30 OMR deducted monthly
  await prisma.employeeAdvance.create({
    data: {
      employeeId: employees[0].id,
      amount: 150.000,
      deductionMonthly: 30.000,
      paidAmount: 30.000,
      remainingBalance: 120.000,
      status: "Active",
      date: new Date("2026-07-28"),
      reason: "Family medical emergency in Pakistan",
    },
  });

  // Ali Raza (EMP-0002) got a speeding fine in Oman (assigned to driver)
  await prisma.fine.create({
    data: {
      employeeId: employees[1].id,
      truckId: trucks[1].id,
      date: new Date("2026-08-05"),
      fineType: "Speeding",
      amount: 15.000, // Speeding fine in Oman is typically 10 or 15 OMR
      authority: "ROP",
      description: "Speeding fine captured by radar on Sohar Expressway",
      assignedTo: "Driver",
      paymentStatus: "Unpaid",
    },
  });

  console.log("Created Advances and Fines");

  // 16. Salary Payments (July 2026 paid, August 2026 pending)
  // July Salary Paid for Ahmed
  await prisma.salaryPayment.create({
    data: {
      employeeId: employees[0].id,
      salaryMonth: "2026-07",
      basicSalary: 220.000,
      allowances: 110.000, // Acc(50) + Food(30) + Trans(20) + Oth(10)
      overtime: 15.000,
      bonus: 10.000,
      deductions: 30.000, // Advance deduction
      netSalary: 325.000,  // (220+110+15+10) - 30
      paymentDate: new Date("2026-07-31"),
      paymentMethod: "Bank Transfer",
      paymentReference: "PAY-JUL-001",
      status: "Paid",
    },
  });

  // August Salary Pending for Ahmed
  await prisma.salaryPayment.create({
    data: {
      employeeId: employees[0].id,
      salaryMonth: "2026-08",
      basicSalary: 220.000,
      allowances: 110.000,
      overtime: 0,
      bonus: 0,
      deductions: 30.000, // pending advance deduction
      netSalary: 300.000,
      paymentDate: null,
      status: "Pending",
    },
  });

  console.log("Created Salary history records");

  // 17. Notifications
  await prisma.notification.create({
    data: {
      type: "Expiry",
      title: "Ahmed Khan's Passport Expiring Soon",
      message: "Driver Ahmed Khan's Pakistani passport (P102938) will expire in 18 days.",
      status: "Unread",
    },
  });

  await prisma.notification.create({
    data: {
      type: "Expiry",
      title: "Ali Raza's Visa Expiring Soon",
      message: "Driver Ali Raza's Oman Residence Visa (V876544) will expire in 25 days.",
      status: "Unread",
    },
  });

  // 18. Audit Logs
  await prisma.auditLog.create({
    data: {
      action: "Database Seeded",
      module: "Settings",
      recordId: "SYSTEM",
      description: "Initial system values, demo settings, and mock records populated successfully.",
      timestamp: new Date(),
    },
  });

  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
