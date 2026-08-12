# Parth Mobile Distribution

Mini ERP + CRM Operations Portal for Wholesale Mobile Management.

## Overview
Parth Mobile Distribution ERP is a full-stack, enterprise-grade business management portal tailored exclusively for wholesale mobile shops. It enables distinct business teams (Sales, Warehouse, Accounts, and Admin) to securely manage customers, track real-time inventory, process sales challans, and generate operational PDF reports. 

## Features Completed (Milestone 10B + Bonus)

- **JWT Authentication & Security:** Encrypted passwords (bcrypt), secure session tokens, and middleware-protected API endpoints.
- **Strict Role-Based Access Control (RBAC):**
  - **ADMIN:** Unrestricted access.
  - **SALES:** Manages customers, creates draft sales challans, tracks follow-ups.
  - **WAREHOUSE:** Manages product inventory, stock IN/OUT movements, and physically confirms draft challans.
  - **ACCOUNTS:** Read-only access to confirmed challans for final billing.
- **Customer CRM:** Manage wholesale/retail clients and schedule sales follow-ups.
- **Inventory Engine:** Real-time stock counts derived dynamically from IN/OUT `StockMovements`.
- **Sales Challans (Order Processing):** Multi-step workflow (Draft -> Confirmed) that safely checks and deducts physical inventory upon confirmation.
- **Operational Reporting & PDF Downloads:** Clean summary dashboards (filtered by dates, statuses, customers) and `pdfkit` powered Sales Challan downloads.
- **Dynamic Notifications:** A bell icon that alerts users based on their role (e.g., Warehouse gets Low Stock alerts, Sales gets Follow-up alerts).
- **Native Dark Mode:** Deep, system-wide Tailwind CSS dark theme configurable by the user.

## Tech Stack

### Frontend
- **React.js (Vite)**
- **TypeScript**
- **Tailwind CSS** (w/ `dark:` native styling)
- **Lucide React** (Icons)
- **React Router DOM** (Navigation)

### Backend
- **Node.js + Express**
- **TypeScript**
- **Prisma ORM**
- **PostgreSQL (Supabase)**
- **PDFKit** (Document Generation)
- **Zod** (Request Validation)
- **Bcrypt / JSONWebToken** (Authentication)

## Local Development Setup

### 1. Database Setup
Ensure you have a PostgreSQL database running (e.g. Supabase or Local Docker). 
Create a `.env` file in the `backend/` directory:
```env
PORT=5000
DATABASE_URL="postgresql://user:password@host:port/dbname?schema=public"
JWT_SECRET="your_super_secret_jwt_key_here"
```

### 2. Backend Initialization
```bash
cd backend
npm install

# Push the schema to the database
npx prisma db push

# Seed the database with test users, products, and challans
npm run prisma:seed

# Start the backend server
npm run dev
```

### 3. Frontend Initialization
Create a `.env` file in the `frontend/` directory:
```env
VITE_API_URL="http://localhost:5000/api"
```

```bash
cd frontend
npm install

# Start the Vite development server
npm run dev
```

## Default Seed Credentials
After running the seed script, you can log in with the following default accounts (Password for all is `password123`):
- `admin@parthmobiles.com` (Admin Role)
- `sales@parthmobiles.com` (Sales Role)
- `warehouse@parthmobiles.com` (Warehouse Role)
- `accounts@parthmobiles.com` (Accounts Role)
