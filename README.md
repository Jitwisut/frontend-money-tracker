# 💰 Money Tracker — ระบบบันทึกรายรับ-รายจ่าย

ระบบจัดการค่าใช้จ่ายส่วนตัว (Personal Expense Tracker) แบบ Full-Stack  
พร้อม Dashboard สรุปผล, กราฟ Pie Chart, ระบบหมวดหมู่, และ Export ข้อมูลเป็น CSV/Excel

> 🌐 **Live Demo:** [money-tracker-omega-ten.vercel.app](https://money-tracker-omega-ten.vercel.app/)  
> 🔗 **Backend API:** [backend-money-tracker-v6p5.onrender.com](https://backend-money-tracker-v6p5.onrender.com/)

> [!NOTE]
> Backend ถูก Deploy บน Render (Free Plan) เมื่อไม่มีการใช้งานนานๆ จะเข้าสู่โหมด Sleep  
> กรุณาเข้าลิงก์ Backend API ก่อนเพื่อปลุก Server (ใช้เวลาประมาณ 30-60 วินาที)

---

## 📋 สารบัญ

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Backend API Reference](#-backend-api-reference)
- [Environment Variables](#-environment-variables)
- [Deployment](#-deployment)
- [Source Code](#-source-code)

---

## ✨ Features

| Feature | รายละเอียด |
|---|---|
| 🔐 **Authentication** | สมัครสมาชิก / เข้าสู่ระบบ ด้วย JWT + bcrypt |
| 📝 **CRUD Transactions** | เพิ่ม, ดู, แก้ไข, ลบ รายการรายรับ-รายจ่าย |
| 🏷️ **Dynamic Categories** | สร้างหมวดหมู่เองได้ (auto-create เมื่อเพิ่มรายการใหม่) |
| 📊 **Dashboard** | สรุปยอดรายรับ/รายจ่าย/คงเหลือ พร้อม Pie Chart |
| 📅 **Date Range Filter** | กรองข้อมูลตามช่วงเวลา, ประเภท, และหมวดหมู่ |
| 📤 **Export Data** | ส่งออกข้อมูลเป็น CSV และ Excel |
| 🔒 **Multi-User** | รองรับหลายผู้ใช้ ข้อมูลแยกกันอย่างปลอดภัย |
| 📱 **Responsive** | ใช้งานได้ทั้ง Desktop และ Mobile |

---

## 🛠 Tech Stack

### Frontend
| Technology | Version | Description |
|---|---|---|
| [Next.js](https://nextjs.org/) | 16 | React Framework (App Router) |
| [React](https://react.dev/) | 19 | UI Library |
| [Tailwind CSS](https://tailwindcss.com/) | 4 | Utility-first CSS |
| [shadcn/ui](https://ui.shadcn.com/) | - | UI Component Library (Radix UI) |
| [Recharts](https://recharts.org/) | 3 | Chart Library (Pie Chart) |
| [Lucide React](https://lucide.dev/) | - | Icon Library |
| [date-fns](https://date-fns.org/) | 4 | Date Utility |

### Backend
| Technology | Version | Description |
|---|---|---|
| [Bun](https://bun.sh/) | latest | JavaScript Runtime |
| [ElysiaJS](https://elysiajs.com/) | 1.4 | Web Framework for Bun |
| [Prisma](https://www.prisma.io/) | 5 | ORM (Object-Relational Mapping) |
| [PostgreSQL](https://www.postgresql.org/) | 15 | Relational Database |
| [bcryptjs](https://www.npmjs.com/package/bcryptjs) | 3 | Password Hashing |
| [@elysiajs/jwt](https://elysiajs.com/plugins/jwt) | 1.4 | JWT Authentication |
| [Day.js](https://day.js.org/) | 1.11 | Date Utility (Timezone support) |

### Infrastructure
| Technology | Description |
|---|---|
| [Docker](https://www.docker.com/) | Container สำหรับ PostgreSQL |
| [Vercel](https://vercel.com/) | Deploy Frontend |
| [Render](https://render.com/) | Deploy Backend |

---

## 📁 Project Structure

```
expense-tracker/
├── backend/                    # ElysiaJS + Bun Backend
│   ├── src/
│   │   ├── index.ts            # Entry point (Elysia server, port 3001)
│   │   └── db.ts               # Prisma Client instance
│   ├── router/
│   │   ├── Authrouter.ts       # /auth — Register & Signin
│   │   ├── transactionrouter.ts# /api/transactions — CRUD + Category
│   │   └── Dashboard.ts        # /api/dashboard — Summary + Chart data
│   ├── controller/
│   │   ├── Authcontroller.ts   # Auth logic (bcrypt + JWT)
│   │   ├── transactioncontroller.ts  # Transaction CRUD logic
│   │   └── dashboradcontroller.ts    # Dashboard aggregation logic
│   ├── prisma/
│   │   ├── schema.prisma       # Database schema (User, Category, Transaction)
│   │   └── migrations/         # Database migration history
│   ├── type/
│   │   └── type.ts             # TypeScript interfaces
│   ├── utils/
│   │   └── error.ts            # Custom error classes
│   ├── package.json
│   └── .env                    # DATABASE_URL, JWT_SECRET
│
├── frontend/                   # Next.js Frontend
│   ├── src/app/
│   │   ├── layout.jsx          # Root Layout (Geist font, metadata)
│   │   ├── page.jsx            # Home — redirect to /dashboard or /login
│   │   ├── login/page.jsx      # Login page
│   │   ├── register/page.jsx   # Register page
│   │   ├── dashboard/page.jsx  # Dashboard — summary cards + pie chart
│   │   ├── transactions/page.jsx # Transaction list + filter + export
│   │   ├── components/
│   │   │   ├── Navbar.jsx      # Navigation bar
│   │   │   ├── TransactionModal.jsx # Add/Edit transaction modal
│   │   │   ├── DatePicker.jsx  # Date picker component
│   │   │   ├── Toast.jsx       # Toast notification system
│   │   │   └── ClientProviders.jsx  # Client-side providers
│   │   ├── lib/
│   │   │   └── api.js          # API helper (fetch wrapper + token management)
│   │   └── globals.css         # Global styles
│   ├── package.json
│   └── .env                    # NEXT_PUBLIC_BACKEND_URL
│
├── docker-compose.yaml         # PostgreSQL container config
├── .env                        # Docker environment variables
└── .gitignore
```

---

## 🚀 Getting Started

### Prerequisites

- [Bun](https://bun.sh/) (สำหรับ Backend)
- [Node.js](https://nodejs.org/) v18+ (สำหรับ Frontend)
- [Docker](https://www.docker.com/) (สำหรับ PostgreSQL)

### 1. Clone Repository

```bash
git clone https://github.com/Jitwisut/money-tracker.git
cd money-tracker
```

### 2. ตั้งค่า Database (PostgreSQL via Docker)

```bash
# สร้างไฟล์ .env ที่ root directory
# ตั้งค่าตามต้องการ:
POSTGRES_USER=your_username
POSTGRES_PASSWORD=your_password
POSTGRES_DB=moneytracker
```

```bash
# เปิด PostgreSQL Container
docker compose up -d
```

> PostgreSQL จะรันที่ port **5433** (mapping จาก 5432 ภายใน container)

### 3. ตั้งค่า Backend

```bash
cd backend

# สร้างไฟล์ .env
# ตั้งค่าดังนี้:
DATABASE_URL="postgresql://<user>:<password>@localhost:5433/moneytracker?schema=public"
JWT_SECRET="your-secret-key"
```

```bash
# ติดตั้ง dependencies
bun install

# รัน Prisma migration เพื่อสร้าง tables
bunx prisma migrate dev

# (Optional) สร้าง Prisma Client
bunx prisma generate

# รัน Backend server
bun run dev
```

> 🦊 Backend จะรันที่ `http://localhost:3001`

### 4. ตั้งค่า Frontend

```bash
cd frontend

# สร้างไฟล์ .env
# ตั้งค่าดังนี้:
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
```

```bash
# ติดตั้ง dependencies
npm install

# รัน Frontend dev server
npm run dev
```

> Frontend จะรันที่ `http://localhost:3000`

---

## 📡 Backend API Reference

### Authentication — `/auth`

| Method | Endpoint | Description | Body |
|---|---|---|---|
| `POST` | `/auth/register` | สมัครสมาชิก | `{ username, password, name }` |
| `POST` | `/auth/signin` | เข้าสู่ระบบ (ได้ JWT Token) | `{ username, password }` |

### Transactions — `/api/transactions` 🔒

> ต้องแนบ `Authorization: Bearer <token>` ใน Header ทุก request

| Method | Endpoint | Description | Body / Query |
|---|---|---|---|
| `POST` | `/api/transactions` | สร้างรายการใหม่ | `{ title, amount, type, categoryName, date?, note? }` |
| `GET` | `/api/transactions` | ดึงรายการทั้งหมด | Query: `startDate`, `endDate`, `type`, `categoryId` |
| `PUT` | `/api/transactions/:id` | แก้ไขรายการ | `{ title?, amount?, type?, category?, date?, note? }` |
| `DELETE` | `/api/transactions/:id` | ลบรายการ | - |
| `GET` | `/api/transactions/category` | ดึงหมวดหมู่ทั้งหมดของ User | - |

### Dashboard — `/api/dashboard` 🔒

| Method | Endpoint | Description | Query |
|---|---|---|---|
| `GET` | `/api/dashboard` | ดึงข้อมูลสรุป + Pie Chart | `startDate`, `endDate`, `type`, `categoryId` |

**Response ตัวอย่าง:**
```json
{
  "data": {
    "summary": {
      "totalIncome": 50000,
      "totalExpense": 32000,
      "balance": 18000
    },
    "pieChartData": [
      { "category": "อาหาร", "total": 12000, "color": "#EF4444" },
      { "category": "เดินทาง", "total": 8000, "color": "#EF4444" }
    ]
  }
}
```

---

## 🔑 Environment Variables

### Root `.env` (Docker)
| Variable | Description | Example |
|---|---|---|
| `POSTGRES_USER` | ชื่อผู้ใช้ PostgreSQL | `jitwisut` |
| `POSTGRES_PASSWORD` | รหัสผ่าน PostgreSQL | `mypassword` |
| `POSTGRES_DB` | ชื่อ Database | `moneytracker` |

### Backend `.env`
| Variable | Description | Example |
|---|---|---|
| `DATABASE_URL` | Prisma connection string | `postgresql://user:pass@localhost:5433/moneytracker?schema=public` |
| `JWT_SECRET` | Secret key สำหรับ sign JWT | `your-secret-key` |

### Frontend `.env`
| Variable | Description | Example |
|---|---|---|
| `NEXT_PUBLIC_BACKEND_URL` | URL ของ Backend API | `http://localhost:3001` |

---

## 🗄️ Database Schema

```
┌──────────┐       ┌────────────┐       ┌──────────────┐
│   User   │──1:N──│  Category  │──1:N──│ Transaction  │
└──────────┘       └────────────┘       └──────────────┘
│ id (PK)  │       │ id (PK)    │       │ id (PK)      │
│ username │       │ name       │       │ title        │
│ password │       │ icon       │       │ amount       │
│ name     │       │ color      │       │ type (ENUM)  │
│ createdAt│       │ type (ENUM)│       │ date         │
└──────────┘       │ userId(FK) │       │ note         │
                   └────────────┘       │ categoryId   │
                                        │ userId (FK)  │
                                        │ createdAt    │
                                        │ updatedAt    │
                                        └──────────────┘

TransactionType: INCOME | EXPENSE
```

---

## 🌍 Deployment

### Frontend → Vercel
1. Push โค้ดไปที่ GitHub
2. Import project ใน [Vercel](https://vercel.com/)
3. ตั้ง Root Directory เป็น `frontend`
4. เพิ่ม Environment Variable: `NEXT_PUBLIC_BACKEND_URL`
5. Deploy!

### Backend → Render
1. Push โค้ดไปที่ GitHub (แยก repo หรือใช้ subdirectory)
2. สร้าง Web Service ใหม่ใน [Render](https://render.com/)
3. ตั้ง Build Command: `bun install && bunx prisma generate`
4. ตั้ง Start Command: `bun run src/index.ts`
5. เพิ่ม Environment Variables: `DATABASE_URL`, `JWT_SECRET`
6. Deploy!

### Database → PostgreSQL
- **Local:** ใช้ Docker Compose (`docker compose up -d`)
- **Production:** ใช้ Managed PostgreSQL (เช่น Neon, Supabase, Railway)

---

## 📦 Source Code

| Repository | Description |
|---|---|
| [money-tracker](https://github.com/Jitwisut/money-tracker) | Monorepo (Frontend + Backend) |
| [Backend-money-tracker](https://github.com/Jitwisut/Backend-money-tracker) | Backend แยก (สำหรับ Deploy) |
| [frontend-money-tracker](https://github.com/Jitwisut/frontend-money-tracker) | Frontend แยก (สำหรับ Deploy) |

---

## 👨‍💻 Developer

**Jitwisut** — [GitHub](https://github.com/Jitwisut)

---

<p align="center">
  Made with ❤️ Jitwisut Thobut using Next.js, ElysiaJS & Bun
</p>
