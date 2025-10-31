const express = require("express");
const pool = require("../db/pool");
const router = express.Router();

// Debug: simple health and sample endpoints
router.get("/_ping", (req, res) => res.json({ ok: true, time: new Date().toISOString() }));
router.get("/sample", (req, res) => {
  return res.json([
    {
      id: 1,
      hotel_name: "Hotel Excelsior",
      latitude: 41.90696714,
      longitude: 12.48310923,
      star_rating: 4,
      municipio: "I",
      status: "White",
      phase: null,
      notes: "",
    },
  ]);
});

// Get all hotels
// Get all hotels
router.get("/", async (req, res) => {
  try {
    const { municipio, star_rating } = req.query;
    let query = "SELECT * FROM hotels WHERE 1=1";
    const params = [];

    console.log("[api/hotels] params", { municipio, star_rating });

    if (municipio && municipio !== "full") {
      params.push(municipio);
      query += ` AND municipio = $${params.length}`;
    }

    if (star_rating && star_rating !== "all") {
      params.push(parseInt(star_rating));
      query += ` AND star_rating = $${params.length}`;
    }

    console.log("[api/hotels] query", query, "params", params);

    // Add a hard timeout so the request doesn't hang forever
    const result = await Promise.race([
      pool.query(query, params),
      new Promise((_, reject) => setTimeout(() => reject(new Error("DB timeout")), 5000)),
    ]);
    res.json(result.rows);
  } catch (err) {
    console.error("[api/hotels] error", err);
    res.status(500).json({ error: "Server error", detail: String(err && err.message || err) });
  }
});

// Update hotel
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status, phase, notes } = req.body;

    const result = await pool.query(
      `UPDATE hotels 
             SET status = $1, phase = $2, notes = $3, updated_at = CURRENT_TIMESTAMP 
             WHERE id = $4 
             RETURNING *`,
      [status, phase, notes, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).send("Hotel not found");
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

module.exports = router;
