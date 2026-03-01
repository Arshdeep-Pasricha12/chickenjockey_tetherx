<div align="center">
  <img src="https://raw.githubusercontent.com/Arshdeep-Pasricha12/chickenjockey_tetherx/main/client/public/vite.svg" alt="AutoPulse Logo" width="120" />

  <h1>⚡ AutoPulse</h1>
  <p><strong>Next-Generation Vehicle Health Dashboard & Intelligent Diagnostics</strong></p>

  <p>
    <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
    <img src="https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E" alt="Vite" />
    <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node" />
    <img src="https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Vercel" />
    <img src="https://img.shields.io/badge/Supabase-181818?style=for-the-badge&logo=supabase&logoColor=3ECF8E" alt="Supabase" />
  </p>
</div>

---

## 🚀 Overview

**AutoPulse** is an advanced, full-stack web application focused on vehicle telemetry, intelligent fault detection, and predictive maintenance. Featuring a stunning glassmorphism UI, interactive 3D elements, and real-time AI assistance, AutoPulse provides users with a comprehensive, emotionally intelligent overview of their vehicle's health.

### ✨ Key Features

- 🏎️ **Live Telemetry Dashboard**: Monitor real-time parameters including Speed, RPM, Tire Pressure, Engine Temperature, Battery Voltage, and Brake Thickness.
- 🧠 **Smart Diagnosis Engine**: Intelligent fault detection that correlates multiple vehicle parameters to diagnose issues and provide actionable fix instructions.
- 🚗 **Interactive 3D Car Scene**: A custom Three.js powered interactive 3D model that highlights critical vehicle components and their real-time statuses.
- 🤖 **Gemini AI Integration**: An intelligent floating AI assistant powered by Google Gemini that analyzes faults, provides plain-English explanations, and offers predictive care insights.
- 🚨 **Emergency SOS & Radar**: One-tap emergency assistance with an interactive **OpenStreetMap (Leaflet)** showing nearby 24/7 service centers, complete with a resilient offline-fallback radar.

---

## 🛠️ Architecture & Tech Stack

AutoPulse utilizes a modern unified monorepo architecture, optimized for zero-config global deployment on Vercel using Serverless Functions.

### Frontend

- **Framework**: React 18 + Vite
- **Styling**: Vanilla CSS with a custom Dark Glassmorphism Theme
- **Mapping**: Leaflet JS & OpenStreetMap (No API keys required!)
- **3D Graphics**: Three.js with GSAP animations
- **State & Routing**: React Router DOM

### Backend

- **Architecture**: Vercel Serverless Functions (Node.js)
- **Framework**: Express.js
- **Database & Auth**: Supabase (PostgreSQL)
- **AI Engine**: Google GenAI (`@google/genai`)

---

## 🔑 Demo Access

Want to try AutoPulse right now? Use the following sample credentials to log in to the live deployment:

> **Username:** `you@gmail.com`  
> **Password:** `ARSHDEEP`

---

## 💻 Local Development Setup

To run AutoPulse on your local machine, follow these steps:

### 1. Clone the Repository

```bash
git clone https://github.com/Arshdeep-Pasricha12/chickenjockey_tetherx.git
cd chickenjockey_tetherx
```

### 2. Install Dependencies

Because AutoPulse uses a unified Vercel architecture, you need to install dependencies in both the root and client folders:

```bash
# Install backend serverless dependencies
npm install

# Install frontend dependencies
cd client
npm install
```

### 3. Environment Variables

Create a `.env` file in **both** the `/server` directory and the `/client` directory.

**`server/.env`** (Backend)

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
GEMINI_API_KEY=your_google_gemini_key
```

**`client/.env`** (Frontend)

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Run Locally

To spin up the development environment, navigate to the `client` folder and start Vite:

```bash
cd client
npm run dev
```

_Note: In local development, the frontend will automatically proxy `/api` requests to a local instance of the Express server._

---

## ☁️ Deployment

AutoPulse is configured for seamless deployment on **Vercel**.

1. Connect your GitHub repository to Vercel.
2. Vercel will automatically detect the `vercel.json` configuration file.
3. Add the 5 environment variables listed above to your Vercel Project Settings.
4. Click **Deploy**. Vercel will build the React frontend and automatically convert the Express backend into highly scalable Serverless Functions.

---

<div align="center">
  <p>Built with ❤️ for safer, smarter driving.</p>
</div>
