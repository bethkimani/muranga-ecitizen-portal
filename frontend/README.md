1. Frontend Repository (muranga-ecitizen-frontend/README.md)
Markdown
# 🇰🇪 Murang'a County e-Citizen Portal — Frontend Web Client

An intuitive, responsive web application serving citizens, field officers, and administrative personnel in Murang'a County, Kenya. Built with Next.js 16 (App Router), TypeScript, and Tailwind CSS.

---

## Overview & Key Features

The portal bridges public service request delivery with county management across three dedicated role workspaces:

* **Citizen Portal**:
  * Browse county service categories (Roads, Water, Agriculture, Health, Revenue, etc.).
  * Submit geo-tagged service requests with media attachments (evidence photos).
  * Real-time track request resolution with visual timeline logs.
  * Receive Kenya-tailored SMS and in-app notifications.
* **Field / Desk Officer Workspace**:
  * Filter and process assigned county cases.
  * Update case status notes, log site investigation notes, and attach photo proof.
  * Dynamic case routing (`/officer/case/[id]`).
* **County Admin Dashboard**:
  * Real-time county performance metrics and service response analytics.
  * Department management and officer task assignment.
  * System-wide audit log activity monitoring.

---

##  Tech Stack & Dependencies

* **Framework**: [Next.js 16](https://nextjs.org/) (App Router architecture)
* **Language**: [TypeScript](https://www.typescriptlang.org/)
* **Styling**: [Tailwind CSS](https://tailwindcss.com/)
* **Icons**: [Lucide React](https://lucide.dev/)
* **State & Data Fetching**: React Hooks + REST API Integration
* **HTTP Client**: Native `fetch` with Next.js dynamic routing & server action integration

---

## 📁 Repository Structure

```text
muranga-ecitizen-frontend/
│
├── public/
│   ├── images/
│   ├── icons/
│   ├── logos/
│   └── favicon.ico
│
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── globals.css
│   │   │
│   │   ├── (auth)/
│   │   │   ├── signin/
│   │   │   │   └── page.tsx
│   │   │   ├── register/
│   │   │   │   └── page.tsx
│   │   │   └── verify/
│   │   │       └── page.tsx
│   │   │
│   │   ├── portal/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── submit/page.tsx
│   │   │   ├── requests/page.tsx
│   │   │   ├── requests/[ref]/page.tsx
│   │   │   ├── track/page.tsx
│   │   │   ├── notifications/page.tsx
│   │   │   ├── services/page.tsx
│   │   │   ├── profile/page.tsx
│   │   │   ├── settings/page.tsx
│   │   │   └── help/page.tsx
│   │   │
│   │   ├── officer/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   └── case/[id]/page.tsx
│   │   │
│   │   ├── admin/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── analytics/page.tsx
│   │   │   ├── requests/page.tsx
│   │   │   ├── users/page.tsx
│   │   │   ├── departments/page.tsx
│   │   │   ├── categories/page.tsx
│   │   │   ├── locations/page.tsx
│   │   │   ├── announcements/page.tsx
│   │   │   ├── reports/page.tsx
│   │   │   ├── audit/page.tsx
│   │   │   ├── assignment/page.tsx
│   │   │   ├── settings/page.tsx
│   │   │   └── system/page.tsx
│   │   │
│   │   ├── services/page.tsx
│   │   ├── help/page.tsx
│   │   └── track/page.tsx
│   │
│   ├── components/
│   │   ├── ui/
│   │   ├── layout/
│   │   ├── forms/
│   │   ├── portal/
│   │   ├── officer/
│   │   └── admin/
│   │
│   ├── lib/
│   │   ├── api.ts
│   │   ├── auth.ts
│   │   ├── utils.ts
│   │   └── validations.ts
│   │
│   ├── hooks/
│   ├── types/
│   ├── constants/
│   └── services/
│       ├── auth.service.ts
│       ├── requests.service.ts
│       ├── notifications.service.ts
│       └── users.service.ts
│
├── .env.example
├── .gitignore
├── eslint.config.mjs
├── next.config.ts
├── package.json
├── package-lock.json
├── tsconfig.json
└── README.md


 Local Development Setup
Prerequisites
Node.js v18.0 or higher

npm or yarn

Steps
Clone the repository:

Bash
git clone [https://github.com/bethkimani/muranga-ecitizen-frontend.git](https://github.com/bethkimani/muranga-ecitizen-frontend.git)
cd muranga-ecitizen-frontend
Install dependencies:

Bash
npm install
Configure Environment Variables:
Create a .env.local file in the root directory:

Code snippet
NEXT_PUBLIC_API_URL=http://localhost:8000/api
Run the development server:

Bash
npm run dev
Open in Browser:
Navigate to http://localhost:3000.

☁️ Deployment (Render or Vercel)
Build Command: npm run build

Start Command: npm run start

Environment Variable: NEXT_PUBLIC_API_URL set to your live Django API URL (e.g. https://muranga-ecitizen-backend.onrender.com/api).