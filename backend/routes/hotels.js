const express = require("express");
const pool = require("../db/pool");
const router = express.Router();

// Get all hotels
// Get all hotels
router.get("/", async (req, res) => {
  try {
    const { municipio, star_rating } = req.query;
    let query = "SELECT * FROM hotels WHERE 1=1";
    const params = [];

    console.log("Query params:", { municipio, star_rating }); // Debug log

    if (municipio && municipio !== "full") {
      params.push(municipio);
      query += ` AND municipio = $${params.length}`;
    }

    if (star_rating && star_rating !== "all") {
      params.push(parseInt(star_rating));
      query += ` AND star_rating = $${params.length}`;
    }

    console.log("Final query:", query, "Params:", params); // Debug log

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
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
