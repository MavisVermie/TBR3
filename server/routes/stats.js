const express = require('express');
const router = express.Router();
const pool = require('../db');

// Route: GET /api/stats/counts
router.get('/counts', async (req, res) => {
  try {
    const postsResult = await pool.query('SELECT COUNT(*) FROM posts');
    const usersResult = await pool.query('SELECT COUNT(*) FROM users');

    const postsCount = parseInt(postsResult.rows[0].count, 10);
    const usersCount = parseInt(usersResult.rows[0].count, 10);

    res.json({
      posts: postsCount,
      users: usersCount
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
