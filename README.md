# 🇬🇭 GASSBot - Official Digital Academic Platform

**Ghana Association of Statistics Students (GASS)**  
*Kwame Nkrumah University of Science and Technology (KNUST)*  
*Department of Statistics and Actuarial Science*  

> **Official Slogan:** *"Statistics for Development"*

---

## 🌟 Overview

**GASSBot** is the official digital academic bot and backend platform built for the Ghana Association of Statistics Students (KNUST). It delivers instant, centralized access to accredited course materials, exam past questions, statistical computing guides (R, Python, SQL, Excel, LaTeX), departmental announcements, and study tools.

The platform is designed with a strict DRY (Don't Repeat Yourself) architecture where both Telegram Bot handlers and REST API endpoints execute the exact same underlying business logic services.

---

## 🎨 Brand Identity

- **Primary Red:** `#E00613` / `#DE1B1B`
- **Sky Blue:** `#4A90E2` / `#5B9BE6`
- **Deep Statistical Teal:** `#0B536F`
- **Dark Text:** `#111827` / `#0F172A`
- **Official Motto / Slogan:** *"Statistics for Development"*

---

## 🏗️ Architecture & Tech Stack

- **Telegram Bot API:** Built with [grammY](https://grammy.dev/) utilizing sessions, conversations (`@grammyjs/conversations`), and interactive keyboards.
- **Backend & Web Server:** Node.js with [Express](https://expressjs.com/) supporting both local long polling and production webhook mode.
- **Database:** PostgreSQL (configured for Render PostgreSQL with SSL connection pooling).
- **Test Suite:** Mocha, Chai, Supertest, and `pg-mem` for automated in-memory PostgreSQL testing without external server dependencies.
- **Frontend (Upcoming):** Pure, lightweight HTML, CSS, JavaScript (zero heavy frameworks) deployed to Vercel and linked via `MINI_APP_URL`.

---

## ⚡ Key Features Implemented

### 1. Telegram Bot Interaction & Menus
- **Main Navigation Menu:** Interactive inline & reply keyboards for seamless student browsing.
- **📚 Academic Resources:** Hierarchical browsing through Levels (100–400) ➔ Semesters (1 & 2) ➔ Courses ➔ Topics & Resources (Lecture Slides, Past Questions, Lab Manuals, Outlines).
- **🚀 Beyond Curriculum Hub:** Curated statistical software & professional development tracks:
  - 📊 R Programming (Tidyverse, ggplot2, Shiny)
  - 🐍 Python for Data Science (NumPy, Pandas, Scikit-learn)
  - 🗄️ SQL & Databases (PostgreSQL, Query design)
  - 📈 Excel & Power BI (Advanced formulas, dashboards)
  - 📝 LaTeX & Scientific Publishing (Overleaf, KNUST thesis templates)
  - 🔍 Exploratory Data Analysis (Visualization & storytelling)
  - 🤖 Machine Learning & AI
  - 📑 Research & Thesis Writing
  - 💼 Careers in Statistics (Data Science, Actuarial, Biostatistics)
  - 🎓 Scholarships & Graduate School (Fully funded opportunities)
  - 🏆 Datathons & Hackathons (Kaggle, Zindi challenges)
- **🔍 Full-Text Search:** Instant keyword search across course codes, topics, and titles (`/search <query>`).
- **📝 Student Resource Request Flow:** Multi-step conversation gathering course, topic, and details into the database.
- **🔔 Notification Preferences:** Students can opt in/out and select their academic year level for targeted broadcasts.
- **🌐 Launch Web App & PWA Guide:** One-click launch for the upcoming student mini app and installation instructions for mobile home screens.
- **ℹ️ Help & About:** Departmental contacts, official slogan, and commands list.

### 2. Executive / Admin Moderation Panel
- **Security:** Access restricted by Telegram ID (`ADMIN_TELEGRAM_IDS`) and database role (`admin` / `executive`).
- **📥 Request Moderation Queue:** Review student requests with inline **Approve** and **Reject** buttons.
- **⚡ Real-Time Student Notifications:** When an admin approves or rejects a request, the bot immediately dispatches a personalized Telegram notification to the student with the committee's notes!
- **📢 Department Announcement Broadcaster:** Guided wizard for composing, targeting (by Level or All), previewing, and dispatching announcements to all subscribed students.
- **📊 Real-Time Analytics:** Real-time counts of registered students, active courses, approved resources, downloads, and pending requests.

### 3. Backend & Shared Services Layer
- Zero duplicated code between bot and API:
  - `src/services/userService.js`: Student profiles, year level, notifications.
  - `src/services/courseService.js`: KNUST curriculum courses and topics.
  - `src/services/resourceService.js`: Curriculum & Beyond resources, bookmarks, downloads.
  - `src/services/requestService.js`: Student requests, status updates, audit logging.
  - `src/services/announcementService.js`: Departmental news and broadcasting.
  - `src/services/statsService.js`: Platform-wide analytics.
  - `src/services/aiService.js`: Modular AI tutor interface ready for Google Gemini.

### 4. REST API Endpoints
- `GET /health`: Health status, slogan, database connectivity check, and uptime.
- `GET /api/courses`: Query courses with optional `level` and `semester` filters.
- `GET /api/courses/:id`: Detailed course view with associated topics and resources.
- `GET /api/resources`: Query resources by `course_id`, `beyond_category`, or `search`.
- `GET /api/resources/:id`: Resource details and download tracking.
- `GET /api/beyond-categories`: List of all Beyond Curriculum learning tracks.
- `POST /api/requests`: Submit a resource request.
- `GET /api/requests`: View all or filter by `?userId=` or `?status=pending`.
- `PATCH /api/requests/:id`: Moderate request status (`approved`, `rejected`, `fulfilled`).
- `POST /api/resources/bookmark`: Save a resource to student's bookmarks.
- `GET /api/resources/saved/:userId`: View student's saved resources.
- `POST /api/announcements`: Create departmental announcement.
- `GET /api/announcements`: Recent announcements with optional `level` filter.
- `GET /api/stats`: Platform analytics summary.
- `POST /webhook`: Telegram Bot webhook receiver.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended; developed on Node v24)
- Telegram Bot Token from [@BotFather](https://t.me/botfather)
- PostgreSQL Database (or in-memory mock for tests)

### 1. Installation
```bash
git clone <repository_url>
cd gassbot
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` and fill in your credentials:
```bash
cp .env.example .env
```

Key variables:
```env
BOT_TOKEN=123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ
DATABASE_URL=postgres://user:password@hostname:5432/gassbot
BOT_MODE=polling # use 'webhook' in production
ADMIN_TELEGRAM_IDS=123456789
MINI_APP_URL=https://gass-knust.vercel.app
```

### 3. Database Migration & Seeding
```bash
# Run PostgreSQL schema migration
npm run migrate

# Seed official KNUST courses, topics, and Beyond Curriculum resources
npm run seed
```

### 4. Start the Application
```bash
# Start in polling mode (for local development)
npm start
```

---

## 🧪 Testing

The repository includes a comprehensive automated test suite testing config, services, API endpoints, error handling, edge cases, and bot keyboards:

```bash
npm test
```

Tests use `pg-mem` to simulate in-memory PostgreSQL, ensuring fast, isolated execution without needing a running external database server.

---

## 🚢 Production Deployment to Render

### 1. Create Render PostgreSQL
1. On Render, click **New +** ➔ **PostgreSQL**.
2. Name your database (e.g., `gass-database`).
3. Copy the **Internal Database URL** (or External Database URL).

### 2. Create Render Web Service
1. Click **New +** ➔ **Web Service** and connect your GitHub repository.
2. Configure settings:
   - **Environment:** Node
   - **Build Command:** `npm install && npm run migrate && npm run seed`
   - **Start Command:** `npm start`
3. Add Environment Variables:
   - `NODE_ENV`: `production`
   - `BOT_TOKEN`: Your Telegram Bot Token
   - `BOT_MODE`: `webhook`
   - `WEBHOOK_DOMAIN`: `https://your-service-name.onrender.com`
   - `WEBHOOK_PATH`: `/webhook`
   - `DATABASE_URL`: Your Render PostgreSQL connection URL
   - `ADMIN_TELEGRAM_IDS`: Your Telegram user ID(s)
   - `MINI_APP_URL`: URL of the Vercel-hosted student web app
4. Deploy the service. The bot will automatically register its webhook with Telegram on launch!

---

## 📜 License

Created for the **Ghana Association of Statistics Students (KNUST)**.  
*Statistics for Development.*
