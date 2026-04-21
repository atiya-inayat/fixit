# FixIt - Community Issue Tracker

FixIt is a full-stack web application that enables communities to report local problems (potholes, broken infrastructure, sanitation issues, etc.), rally community support through volunteering and crowdfunding, and verify resolutions using AI-powered photo comparison.

## Tech Stack

### Client (Frontend)
- **Next.js 16** with App Router
- **React 19** with TypeScript
- **Tailwind CSS 4** for styling
- **shadcn/ui** component library (Button, Input, Badge)
- **Leaflet** for interactive maps (OpenStreetMap tiles)
- **Axios** for HTTP requests
- **Lucide React** for icons
- **better-auth** (client) for session management

### Server (Backend)
- **Express.js 4** with TypeScript
- **MongoDB** with Mongoose ODM
- **better-auth** with MongoDB adapter for authentication
- **Multer** for file uploads (photos, receipts)
- **Groq SDK** (Llama 4 Scout) for AI-powered fix verification
- **ts-node-dev** for development hot-reload

### External Services
- **MongoDB Atlas** - Cloud database
- **Groq API** - AI vision model for before/after photo comparison
- **OpenStreetMap** - Map tiles (free, no API key needed)

## Project Structure

```
fixit/
├── client/                     # Next.js frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx              # Home page (map + recent issues)
│   │   │   ├── layout.tsx            # Root layout with Navbar
│   │   │   ├── globals.css           # Global styles
│   │   │   ├── login/page.tsx        # Login page
│   │   │   ├── register/page.tsx     # Registration page
│   │   │   ├── dashboard/page.tsx    # Community dashboard with stats
│   │   │   └── issues/
│   │   │       ├── page.tsx          # Issues list with filters
│   │   │       ├── new/page.tsx      # Report new issue form
│   │   │       └── [id]/page.tsx     # Issue detail page
│   │   ├── components/
│   │   │   ├── Navbar.tsx            # Top navigation bar
│   │   │   ├── MapView.tsx           # Map with issue markers
│   │   │   ├── LocationPicker.tsx    # Click-to-pick map location
│   │   │   ├── IssueCard.tsx         # Issue summary card
│   │   │   ├── Timeline.tsx          # Activity timeline
│   │   │   ├── VolunteerList.tsx     # Volunteer display
│   │   │   ├── FundingLedger.tsx     # Donation/expense tracker
│   │   │   └── ui/                   # shadcn/ui primitives
│   │   │       ├── button.tsx
│   │   │       ├── input.tsx
│   │   │       └── badge.tsx
│   │   ├── context/
│   │   │   └── AuthContext.tsx       # Authentication context provider
│   │   └── lib/
│   │       ├── api.ts                # Axios instance (baseURL config)
│   │       ├── auth-client.ts        # better-auth client setup
│   │       └── utils.ts              # Tailwind merge utility
│   ├── package.json
│   └── tsconfig.json
│
├── server/                     # Express.js backend
│   ├── src/
│   │   ├── index.ts                  # App entry point, route mounting
│   │   ├── config/
│   │   │   └── db.ts                 # MongoDB connection
│   │   ├── lib/
│   │   │   └── auth.ts               # better-auth server setup
│   │   ├── middleware/
│   │   │   ├── auth.ts               # requireAuth / optionalAuth
│   │   │   └── upload.ts             # Multer file upload config
│   │   ├── models/
│   │   │   ├── Issue.ts              # Issue schema (photos, volunteers, timeline)
│   │   │   ├── Transaction.ts        # Funding transaction schema
│   │   │   └── User.ts              # User model (if applicable)
│   │   └── routes/
│   │       ├── auth.ts               # better-auth passthrough
│   │       ├── issues.ts             # CRUD, upvote, volunteer, flag, status
│   │       ├── funding.ts            # Donate, log expense, ledger
│   │       ├── dashboard.ts          # Aggregated community stats
│   │       └── verification.ts       # AI photo comparison (Groq)
│   ├── uploads/                      # Uploaded photos stored here
│   ├── .env                          # Environment variables
│   ├── package.json
│   └── tsconfig.json
│
└── README.md
```

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| ALL | `/api/auth/*` | better-auth handles signup, login, logout, session |

### Issues
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/issues` | Optional | List issues (filter by `?status=` `?category=`) |
| GET | `/api/issues/map` | No | Get all issues with coordinates for map |
| GET | `/api/issues/:id` | Optional | Get single issue with full details |
| POST | `/api/issues` | Required | Create issue (multipart: title, description, category, latitude, longitude, photos) |
| PATCH | `/api/issues/:id/status` | Required | Update status to `in_progress` or `resolved` (with optional afterPhotos) |
| POST | `/api/issues/:id/upvote` | Required | Toggle upvote |
| POST | `/api/issues/:id/volunteer` | Required | Volunteer with skills |
| DELETE | `/api/issues/:id/volunteer` | Required | Remove volunteer |
| POST | `/api/issues/:id/flag` | Required | Flag issue with reason |

### Funding
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/issues/:id/fund` | Required | Donate to an issue |
| POST | `/api/issues/:id/expense` | Required | Log expense with optional receipt |
| GET | `/api/issues/:id/ledger` | No | Get funding ledger (donations, expenses, balance) |

### AI Verification
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/issues/:id/verify` | Required | AI compares before/after photos using Groq (Llama 4 Scout) |

### Dashboard
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/dashboard/stats` | No | Aggregated stats (total issues, resolved, funds, volunteers, resolution rate) |

## Features

- **Issue Reporting** - Report community problems with photos, GPS location (auto-detect or click on map), and category
- **Interactive Maps** - View all issues on a map with color-coded status markers (red = reported, yellow = in progress, green = resolved)
- **Community Engagement** - Upvote issues, volunteer with skills (labor, transport, technical, funding), flag inappropriate content
- **Status Tracking** - Move issues through reported -> in_progress -> resolved workflow with activity timeline
- **Crowdfunding** - Donate to issues, log expenses with receipt uploads, transparent funding ledger
- **AI Verification** - After marking resolved, AI (Llama 4 Scout via Groq) compares before/after photos to verify the fix was actually applied
- **Dashboard** - Community-wide stats showing total issues, resolution rate, funds raised/spent, active volunteers
- **Authentication** - Email/password registration and login via better-auth

## Getting Started

### Prerequisites
- **Node.js** 18+
- **pnpm** (package manager)
- **MongoDB Atlas** account (or local MongoDB)
- **Groq API key** (free at [console.groq.com](https://console.groq.com))

### 1. Setup the Server

```bash
cd server
pnpm install
```

Create a `.env` file (or use the provided one):

```env
PORT=3005
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/fixit
BETTER_AUTH_SECRET=<random-secret-string>
BETTER_AUTH_URL=http://localhost:3005
GROQ_API_KEY=<your-groq-api-key>
```

Start the server:

```bash
pnpm dev
```

The server runs on **http://localhost:3005**.

### 2. Setup the Client

```bash
cd client
pnpm install
```

Start the dev server:

```bash
pnpm dev
```

The client runs on **http://localhost:3000**.

### 3. Use the App

1. Open **http://localhost:3000** in your browser
2. Register a new account
3. Report an issue with photos and map location
4. Try upvoting, volunteering, and donating
5. Mark an issue as resolved with after photos
6. Run AI verification to compare before/after

## Environment Variables

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default: 3005) |
| `MONGODB_URI` | MongoDB connection string with `/fixit` database |
| `BETTER_AUTH_SECRET` | Secret key for session signing |
| `BETTER_AUTH_URL` | Server base URL |
| `GROQ_API_KEY` | Groq API key for AI verification |

## MongoDB Collections

All collections are stored in the `fixit` database:

- **user** - User accounts (managed by better-auth)
- **account** - Auth accounts (managed by better-auth)
- **session** - Active sessions (managed by better-auth)
- **issues** - Community-reported issues
- **transactions** - Funding donations and expenses
