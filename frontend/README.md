# Murang'a e-Citizen Portal: Frontend

A web portal where Murang'a County residents submit and track service requests, officers handle assigned cases, and administrators manage the system and view analytics.

## Live links

| | |
|---|---|
| Live app (frontend, Vercel) | https://muranga-ecitizen-frontend-final.vercel.app/ |
| Live API (backend, Render) | https://citizen-muranga-portal.onrender.com |
| Design (Figma) | https://www.figma.com/design/gmTQ1PpSwJuIhIhV61h4Qj/Untitled?node-id=0-1&t=fQCBkGKQ3hVSRrX0-0 |

## Demo login credentials

Use these accounts to try each role. Sign in at https://muranga-ecitizen-frontend-final.vercel.app/signin

| Role | Email | Password |
|---|---|---|
| Admin (County Administrator) | kbwaceke@gmail.com | Beth@2026 |
| Officer | beth@muranga.go.ke | mDbzN8R4SdsB#9 |
| Citizen | zachayo@gmail.com | 273bewaki??K# |

You can also create your own citizen account from the Register page.

### Important notes before you test

1. **Creating an account or signing in can take 30 to 60 seconds.** Both the frontend (Vercel) and the backend (Render) run on free tiers. The free Render service goes to sleep when it has not been used for a while, and the first request has to wake it up. The two services are also hosted in different places, which adds network latency. Please wait for the request to finish and do not press the button twice. After the first request, the app responds much faster.
2. **Email and SMS verification is switched off for now.** After registering, you are taken straight to the sign-in page and can log in immediately. See "Account verification (planned)" below.

## Tech stack

- Next.js (App Router) and TypeScript
- Tailwind CSS
- REST API client in `src/api`
- Hosted on Vercel (free tier)

## Features

### Core
- Registration and sign-in with role-based redirects (citizen, officer, admin)
- Submit a request with a category, a location (map picker) and an optional image
- Request tracking with a status timeline: Pending, In Progress, Resolved
- Officer workspace to review and update assigned cases
- Admin analytics with open versus resolved request counts and charts

### Bonus
- Role-based workspaces: `/portal`, `/officer`, `/admin`
- Staff management (admin users)
- Audit logs
- Announcements
- Request assignment, departments, categories and locations management
- Reports and system settings
- Automatic logout after inactivity
- Postman collection (in the backend repository)

### Account verification (planned)

Account verification by email and SMS, and password reset by email, are built in the code but are **not active in this release**. They will be enabled in a future version for two reasons:

1. **Brevo has not yet verified my account.** Brevo is the email provider used to send the one-time codes, and until it approves the account, it cannot send mail reliably.
2. **A domain name for Murang'a County is needed.** To make verification emails reach the inbox instead of the spam folder, the emails must be sent from an address on a domain the county owns and authenticates (SPF and DKIM). A free personal address cannot do this.

Once both are in place, verification is turned on with the environment variables described below.



## Design decisions

- **Colour:** a small palette with one primary colour for actions, and distinct status colours for Pending, In Progress and Resolved so progress is readable at a glance.
- **One consistent layout:** a shared app shell (header, side navigation, content area) is used by every role, so the interface feels familiar in any workspace.
- **Role-based dashboards:** citizens, officers and admins each get their own layout and navigation, and routes are guarded by role.
- **Responsive:** layouts adapt to phones, tablets and desktops.
- **Clear feedback:** validation and API errors appear in plain language next to the relevant field, and empty states explain what to do next.
- **Reusable components:** status badges, the status stepper, request cards and the activity timeline are shared, so statuses look the same everywhere.
- **Figma:** the original design is linked at the top of this README.

## Project structure

```
frontend/
├── public/                      # Static assets
├            
├── src/
│   ├── app/                     # Routes (Next.js App Router)
│   │   ├── (auth)/              # Sign in, register, verify, forgot, reset
│   │   ├── (main)/              # Public pages
│   │   ├── portal/              # Citizen workspace
│   │   │   ├── submit/          #   Submit a request
│   │   │   ├── track/           #   Track request status
│   │   │   ├── requests/        #   My requests
│   │   │   ├── services/        #   Available services
│   │   │   ├── notifications/
│   │   │   ├── profile/
│   │   │   ├── settings/
│   │   │   └── help/
│   │   ├── officer/             # Officer workspace
│   │   │   ├── dashboard/
│   │   │   └── case/            #   Case details and status updates
│   │   ├── admin/               # Admin workspace
│   │   │   ├── analytics/       #   Open vs resolved counts and charts
│   │   │   ├── requests/
│   │   │   ├── assignment/
│   │   │   ├── users/           #   Staff management
│   │   │   ├── departments/
│   │   │   ├── categories/
│   │   │   ├── locations/
│   │   │   ├── announcements/
│   │   │   ├── audit/           #   Audit logs
│   │   │   ├── reports/
│   │   │   ├── settings/
│   │   │   └── system/
│   │   ├── globals.css
│   │   └── layout.tsx           # Root layout
│   ├── api/                     # API client and endpoint calls
│   ├── components/              # Shared UI
│   │   ├── landing/             #   Landing page sections
│   │   ├── map/                 #   Location picker and map views
│   │   ├── submit/              #   Submit-request form parts
│   │   ├── AppShell.tsx         #   Shared layout for all roles
│   │   ├── AuthLayout.tsx
│   │   ├── RequireRole.tsx      #   Role-based route guard
│   │   ├── IdleLogout.tsx
│   │   ├── StatusBadge.tsx
│   │   ├── StatusStepper.tsx
│   │   ├── ActivityTimeline.tsx
│   │   ├── RequestCard.tsx
│   │   ├── RequestSummaryCard.tsx
│   │   ├── ChartCard.tsx
│   │   ├── ProfileView.tsx
│   │   ├── Modal.tsx
│   │   ├── Logo.tsx
│   │   ├── PublicHeader.tsx
│   │   ├── PublicFooter.tsx
│   │   └── ui.tsx               #   Buttons, inputs and other primitives
│   ├── data/                    # Static data and constants
│   ├── hooks/                   # Custom React hooks
│   ├── types/                   # TypeScript types
│   └── utils/                   # Helper functions
├── .env.example                 # Environment variable template
├── next.config.ts
├── package.json
└── tsconfig.json
```

## Getting started

**Requirements:** Node.js 18 or newer, and the backend API running.

```bash
cd frontend
npm install
cp .env.example .env.local     # Windows PowerShell: copy .env.example .env.local
npm run dev
```

Open http://localhost:3000.

## Environment variables

| Variable | Description | Example |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Base URL of the backend API | `https://citizen-muranga-portal.onrender.com/api` |

Never commit `.env` or `.env.local`. Only `.env.example` belongs in the repository.

### Turning verification back on later

Verification is switched off in `src/api/auth.ts`:

```ts
export const OTP_REQUIRED = false;
```

When email delivery is ready, replace that line with:

```ts
export const OTP_REQUIRED = process.env.NEXT_PUBLIC_OTP_REQUIRED !== '0';
```

Then set `OTP_REQUIRED=1` on the backend (Render), and redeploy both services.

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm run start` | Run the production build |

## Deployment

Deployed on Vercel at https://muranga-ecitizen-frontend-final.vercel.app/. Set `NEXT_PUBLIC_API_URL` in the Vercel project settings to the deployed backend URL, then redeploy. Environment variables beginning with `NEXT_PUBLIC_` are read at build time, so a redeploy is required after changing them.

## Roles

| Role | Workspace | Can do |
|---|---|---|
| Citizen | `/portal` | Submit and track requests, manage profile, read notifications |
| Officer | `/officer` | View assigned cases, update status |
| Admin | `/admin` | Assign requests, manage staff and lookups, view analytics, audit logs and announcements |

## Known limitations

- The first request after a period of inactivity takes 30 to 60 seconds (free-tier cold start).
- Email and SMS verification and password reset are not active yet (see "Account verification (planned)").

## Contact

kbwaceke@gmail.com
0112280703