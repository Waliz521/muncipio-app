const express = require("express");
const cors = require("cors");
const hotelsRoutes = require("./routes/hotels");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean)
  .map((origin) => origin.replace(/\/+$/, ""));

const allowAllOrigins =
  allowedOrigins.length === 0 || allowedOrigins.includes("*");

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowAllOrigins) {
        return callback(null, true);
      }

      const normalizedOrigin = origin.replace(/\/+$/, "");
      if (allowedOrigins.includes(normalizedOrigin)) {
        return callback(null, true);
      }

      callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
  })
);
app.use(express.json());
const path = require("path");
app.use(express.static(path.join(__dirname, "..")));

app.use("/api/hotels", hotelsRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
