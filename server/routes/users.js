const router = require("express").Router();
const pool = require("../db");

// GET /:userId - Get user data by userId
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const userQuery = await pool.query(
      `SELECT id as user_id, username, email, zip_code FROM users WHERE id = $1`,
      [userId]
    );
    if (userQuery.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(userQuery.rows[0]);
  } catch (err) {
    console.error("Error fetching user:", err.message);
    res.status(500).send("Server error");
  }
});

module.exports = router;
