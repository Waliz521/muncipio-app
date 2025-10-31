// backend/server.js
const express = require("express");
const path = require("path");
const hotelsRoutes = require("./routes/hotels");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Parse incoming JSON
app.use(express.json());

// Serve static frontend files (index.html, JS, CSS, etc.)
app.use(express.static(path.join(__dirname, "..")));

// API routes
app.use("/api/hotels", hotelsRoutes);

// Fallback for frontend routing (so refreshing works)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "index.html"));
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
