require("dotenv").config({ path: __dirname + "/.env" })

const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const path = require("path")

// Routes
const authRoutes = require("./routes/auth")
const workerRoutes = require("./routes/workers")
const statsRoutes = require("./routes/stats")
const bookingRoutes = require("./routes/bookings")
const reviewRoutes = require("./routes/reviews")
const userRoutes = require("./routes/users")

const app = express()

// ========================
// Middleware
// ========================
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:5175",
      "http://localhost:5176",
      process.env.FRONTEND_URL
    ],
    credentials: true
  })
)

app.use(express.json())
app.use("/uploads", express.static(path.join(__dirname, "uploads")))

// ========================
// MongoDB Connection
// ========================
const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI

if (!MONGO_URI) {
  console.error("❌ MongoDB URI is missing in .env file")
  process.exit(1)
}

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => {
    console.error("MongoDB connection error:", err.message)
    process.exit(1)
  })

// ========================
// Routes
// ========================
app.use("/api/auth", authRoutes)
app.use("/api/workers", workerRoutes)
app.use("/api/stats", statsRoutes)
app.use("/api/bookings", bookingRoutes)
app.use("/api/reviews", reviewRoutes)
app.use("/api/users", userRoutes)

// ========================
// Server
// ========================
const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})