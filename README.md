# FixConnect - Service Booking Application

FixConnect is a modern, on-demand home service booking application connecting local service workers (plumbers, electricians, cleaners, etc.) with customers who need quick, professional help. Built using a robust stack featuring **Expo React Native**, **Express**, **Node.js**, **MongoDB**, and secured via **Clerk Auth**.

## Project Architecture

```
Fix-Connect/
├── client/          # Expo React Native App
└── server/          # Node.js + Express + MongoDB Server
```

---

## Features

### 🔐 Clerk Authentication & Role-Based Profiles
* Secure authentication (Sign In & Sign Up) utilizing Clerk.
* Dual-role design: **Customer** vs. **Worker**.
* Seamless user details sync with local MongoDB database.

### 👥 Customer Capabilities
* **Browse Categories**: Filter services by Plumbing, Electrical, Cleaning, AC Repair, Carpentry, and Painting.
* **Smart Search**: Find services and workers dynamically.
* **Worker Profiles**: View worker details, prices, portfolios, ratings, and reviews.
* **Booking System**: Select a date, time, and service, specify details, and place a booking.
* **Booking History**: Real-time status tracker (Pending, Accepted, Declined, Completed, Cancelled).

### 🛠️ Worker Capabilities
* **Worker Dashboard**: Monitor total earnings, completed jobs, and average ratings.
* **Active Status Toggle**: Shift between Online and Offline status.
* **Incoming Job Requests**: Accept or decline customer booking requests.
* **My Bookings**: View active schedules and mark jobs as completed.

### 💫 Visual Experience
* **Micro-Animations**: Elegant scaling and fade-in animations on splash screen load.
* **Glassmorphic UI Elements**: Harmonious dark/light design system based on emerald green themes.
* **Dynamic Skeletal Loaders**: Shimmering card and list loaders that display while fetching data.

---

## Tech Stack & Libraries

### Frontend (Client)
* **Expo SDK** & **React Native**
* **Zustand** (Global state management)
* **TanStack Query (React Query)** (Data fetching, caching, and mutations)
* **Formik & Yup** (Form validation)
* **React Native Reanimated** (Micro-animations and skeleton loading)
* **Expo Google Fonts (Outfit)** (Typography)

### Backend (Server)
* **Node.js** & **Express**
* **MongoDB** & **Mongoose** (Database)
* **Clerk SDK** (Authentication)
* **Morgan** (Logger)

---

## Setup & Running Instructions

### 1. Prerequisites
* [Node.js](https://nodejs.org/) (v18 or higher recommended)
* MongoDB connection (locally or via MongoDB Atlas)
* A [Clerk Account](https://clerk.com/) to obtain publishable and secret keys

### 2. Run the Express Backend
1. Open a terminal and navigate to the server folder:
   ```bash
   cd server
   ```
2. Install server dependencies:
   ```bash
   npm install
   ```
3. Run the database seed script to populate demo categories and workers:
   ```bash
   npm run seed
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
   The server will start on `http://localhost:5000`.

### 3. Run the Expo React Native App
1. Open a new terminal and navigate to the client folder:
   ```bash
   cd client
   ```
2. Install client dependencies:
   ```bash
   npm install
   ```
3. Start the Expo development server:
   ```bash
   npx expo start
   ```
4. Scan the QR code with your Expo Go app (Android/iOS) or run on an emulator/simulator.
