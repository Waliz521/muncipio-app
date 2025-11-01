// backend/server.js - FIX THESE LINES:
const express = require("express");
const path = require("path");
const hotelsRoutes = require("./routes/hotels");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Parse incoming JSON
app.use(express.json());

// ✅ FIX: Serve static files from the ROOT directory (where index.html is)
app.use(express.static(path.join(__dirname, "..")));

// API routes
app.use("/api/hotels", hotelsRoutes);

// ✅ FIX: Fallback for frontend routing
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "index.html"));
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});