# Habib Ullah Logistics Fleet & HR Management System

Welcome to the **Habib Ullah Logistics Fleet & HR Management System**—a custom-built, modern enterprise solution designed for Omani logistics operations. It manages employees, vehicle fleets, trips, fuel efficiency, client invoicing, Royal Oman Police (ROP) fines, and payroll.

---

## 🚀 Quick Start (First Time Setup)

To run the application locally on your machine, follow these steps in your terminal at `d:\Mazharhabib\logistics`:

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Copy `.env.example` to `.env` (it has already been done for you) and ensure the MySQL connection URL is correct:
```env
DATABASE_URL="mysql://root@localhost:3306/logistics"
AUTH_SECRET="oman_trucking_secret_2026_super_secure_key_123456"
```

### 3. Setup Database Schema and Migrations
Sync the database with the Prisma schema:
```bash
npx prisma migrate dev --name init
```

### 4. Seed the Database
Populate the database with realistic mock Omani logistics data (including settings, drivers, trucks, trips, customers, and active alerts):
```bash
npx prisma db seed
```

### 5. Launch the Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🔐 Credentials (Seeded Account)

*   **Email:** `admin@omantrucking.com`
*   **Password:** `Admin@Oman2026`

---

## 🛠️ Architecture & Tech Stack

- **Framework:** Next.js (App Router)
- **Styling:** Tailwind CSS (Dark Mode Slate/Zinc Premium theme)
- **Database ORM:** Prisma Client v7
- **Database:** MySQL
- **Charts:** Recharts
- **Icons:** Lucide React

---

## 📖 Module Workflows & How It Works

### 1. Dashboard (Overview)
- **KPI Summary:** Displays real-time counts for active employees, available trucks, Month-to-Date (MTD) revenue, and outstanding invoices.
- **Financial Breakdown:** Automatically sums MTD fuel expenses, MTD salaries, and operation expenses for quick review.
- **Important Expiry Alerts:** Placed high up on the dashboard. It scans all visa, passport, driving license, and vehicle registration (Mulkiya) documents, surfacing warning cards for items expiring within the configurable warning window (default: 30 days) or already expired.

### 2. Employee Profile & Document Center
- **Expatriate and Omani Tracking:** Supports full onboarding with Alt-Phone, Father's Name, Nationality, and Status (Active, Inactive, On Leave, Returned Home).
- **Compliance Tracking:** Stores passports, visas (with sponsor details), and driving licenses. The system logs issue/expiry dates to fuel the notification alert engine.

### 3. Fleet & Vehicle Registrations (Mulkiya)
- **Vehicle Profiles:** Manages license plates, chassis numbers, odometer readings, and assignments.
- **Mulkiya & Insurance Alerts:** Tracks vehicle registrations (Mulkiya) and third-party/comprehensive insurance policies. Expiring vehicle papers trigger dashboard notifications.

### 4. Logistics Dispatch & Trip logs
- **Operational Logs:** Dispatches trucks to customers with specified cargo, cargo weight, start/end dates, and MTD revenue.
- **Odometer Flow:** When starting a trip, the system records the starting odometer. When ending the trip, the ending odometer is recorded, automatically calculating total distance and updating the truck's main odometer reading.

### 5. Smart Fuel Logger
- **Litres & Price Tracking:** Records fuel station visits, fuel cards/methods, liters, and price per liter.
- **Automatic Calculations:** Instantly computes `Total Cost = Liters * Price/Liter` and links transactions to specific trucks, drivers, and trips. It automatically prompts to record the current odometer, ensuring fuel efficiency tracking.

### 6. Payroll & Salaries Console
- **Compensation Structure:** Stores base salary and customizable monthly allowances (housing, food, utility).
- **Deductions Integration:** Auto-calculates deductions by looking up outstanding employee advances and traffic fines logged for the month.
- **Salary History:** Generates monthly payroll drafts, tracks payment status (Pending, Partially Paid, Paid), and keeps audit logs.

### 7. Royal Oman Police (ROP) Fines
- **Traffic Safety Violations:** ROP speed/weight violations can be logged against a driver and/or a truck.
- **Payroll Deduction:** Fines are flag-marked for auto-deduction from the driver's next salary cycle.

### 8. Billing & Client Invoicing
- **VAT Engine:** Generates tax invoices with Omani VAT (5% standard rate).
- **Payment Collection:** Operators can record payments directly on the invoice detail page (Cash, Bank Transfer, Cheque). Invoice status updates dynamically (`Draft` ➔ `Sent` ➔ `Partially Paid` ➔ `Paid` ➔ `Overdue`).
- **Credit Limits:** Prevents shipping to customers who exceed their defined OMR Credit Limits.
