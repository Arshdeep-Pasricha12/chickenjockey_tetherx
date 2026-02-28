# TetherX - Vehicle Health Dashboard & Diagnostics

TetherX (AutoPulse) is an advanced web application focused on vehicle telemetry, intelligent fault detection, and predictive maintenance. Developed with React on the frontend and Node.js on the backend, it provides users with a comprehensive overview of their vehicle's health in real-time.

## Features

- **Dashboard & Telemetry**: Monitor real-time parameters such as Speed, RPM, Tire Pressure, Engine Temperature, Battery Voltage, and Brake Thickness.
- **Smart Diagnosis**: Intelligent fault detection engine that correlates multiple vehicle parameters to diagnose issues and provide actionable fix instructions.
- **3D Interactive Car Scene**: A Three.js powered interactive 3D model that highlights critical components and their statuses.
- **AI Integration**: Powered by Google Gemini to analyze faults, generate plain-English explanations, and provide predictive care insights.
- **Community & History**: Track diagnosis history, engage with community troubleshooting, and receive dynamic weather and safety advisories based on context.

## Tech Stack

- **Frontend**: React, Vite, TailwindCSS (glassmorphism UI), Three.js (GSAP), Supabase (Auth/DB).
- **Backend**: Node.js, Express, Supabase (PostgreSQL), Google Gemini API, Open-Meteo API.

## Setup Instructions

### Backend

1. Navigate to the `server` directory.
2. Run `npm install` to install dependencies.
3. Create a `.env` file with `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `MAPBOX_TOKEN`, and `GEMINI_API_KEY`.
4. Run `node server.js` to start the backend API.

### Frontend

1. Navigate to the `client` directory.
2. Run `npm install` to install dependencies.
3. Create a `.env` file with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
4. Run `npm run dev` to start the frontend application.
