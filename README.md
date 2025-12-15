# ✈️ WanderWise — Travel Organizer App

WanderWise is a full-stack travel planner that lets users organize trips,
visualize locations on an interactive map, and receive AI-powered suggestions
for destinations and points of interest.

This repository contains the **frontend** portion of the project.
🔗 **Backend Repo:** [https://github.com/beatrizpreuss/trip-app-backend]

---

## 💻 Frontend Overview

The frontend is responsible for:
- User interface and trip planning workflow
- Interactive map display using React Leaflet & MapTiler
- Fetching and displaying data from the backend API
- Handling user authentication with JWT tokens provided by the backend

---

## 🏗️ Tech Stack

- **React**
- **JavaScript**, **HTML**, **Tailwind CSS**
- **React Leaflet** + **MapTiler** for map visualization
- **Fetch API** for API communication

---

## 📂 Project Purpose

This repo includes:
- Components for trip creation and editing  
- Map views for pinpoints and visualization  
- Integration with backend AI suggestions and saved trips

---

## ⚙️ Installation & Local Setup

Follow these steps to run the frontend locally.

1️⃣ Prerequisites

- Make sure you have installed:
- Node.js (v18 or later recommended)
- npm (comes with Node.js)

2️⃣ Clone the Repository

- git clone https://github.com/beatrizpreuss/trip-app-frontend.git
- cd trip-app-frontend

3️⃣ Install Dependencies

- npm install

4️⃣ Environment Variables

- Create a .env file in the root of the project and add the following:

VITE_BACKEND_URL=http://localhost:5000
VITE_MAPTILER_KEY=your_maptiler_api_key

⚠️ These values must match your backend setup and MapTiler account.

5️⃣ Run the Development Server

- npm run dev

The app will be available at: http://localhost:5173

---

## 🔐 Authentication Notes

JWTs are generated and validated only by the backend

The frontend stores the token (e.g., in memory or localStorage) and sends it via the Authorization header

No JWT secrets or logic are stored in this repository

---

## 📌 Notes

This repository does not contain backend logic or database code

The backend must be running for the app to function correctly

✨ Built as part of a full-stack project to practice React, API integration, and map-based UIs.