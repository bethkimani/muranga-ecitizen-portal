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
├── src/
│   ├── app/
│   │   ├── (auth)/              # Sign-in & Citizen Registration
│   │   ├── admin/               # Admin portal layout & dynamic sub-routes
│   │   │   ├── analytics/
│   │   │   ├── departments/
│   │   │   ├── requests/
│   │   │   ├── system/
│   │   │   └── users/
│   │   ├── officer/             # Field officer workspace & dynamic cases
│   │   │   └── case/[id]/
│   │   ├── requests/            # Public citizen request submission & tracking
│   │   ├── layout.tsx           # Global root layout
│   │   └── page.tsx             # Public landing page
│   ├── components/              # UI components (Cards, Navbars, Modals)
│   └── lib/                     # API helpers & type definitions
├── public/                      # Static assets & county branding
├── package.json
├── tailwind.config.ts
└── tsconfig.json
🚀 Local Development Setup
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