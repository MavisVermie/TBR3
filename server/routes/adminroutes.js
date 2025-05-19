// routes/adminRoutes.js

const express = require("express");
const router = express.Router();
const pool = require("../db");
const authorize = require("../middleware/authorize");

// ✅ Apply authorization and admin check globally to all routes
router.use(authorize);
router.use((req, res, next) => {
  if (!req.user?.isAdmin) {
    return res.status(403).json({ msg: "Admins only." });
  }
  next();
});

// GET all users
router.get("/users", async (req, res) => {
  try {
    const result = await pool.query("SELECT id, username, email, is_admin FROM users");
    res.json(result.rows);
  } catch (err) {
    console.error("Admin fetch error:", err.message);
    res.status(500).json({ msg: "Server Error" });
  }
});

// Promote/Demote user
router.put("/users/:id/toggle-admin", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "UPDATE users SET is_admin = NOT is_admin WHERE id = $1 RETURNING id, is_admin",
      [id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Toggle admin error:", err.message);
    res.status(500).json({ msg: "Server Error" });
  }
});

// Delete a user
router.delete("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM users WHERE id = $1", [id]);
    res.json({ msg: "User deleted" });
  } catch (err) {
    console.error("Delete user error:", err.message);
    res.status(500).json({ msg: "Server Error" });
  }
});

// Fetch all posts
router.get("/posts", async (req, res) => {
  console.log("✅ Reached /admin/posts route");
  try {
    const result = await pool.query(`
      SELECT 
        posts.post_id, 
        posts.title, 
        posts.attached_photo,
        users.id AS user_id,
        users.username,
        users.email
      FROM posts
      JOIN users ON posts.user_id = users.id
    `);

    const posts = result.rows.map(post => ({
      ...post,
      attached_photo: post.attached_photo?.toString("base64"),
    }));

    res.json(posts);
  } catch (err) {
    console.error("Admin post fetch error:", err.message);
    res.status(500).json({ msg: "Server error" });
  }
});

// Delete a post
router.delete("/posts/:postId", async (req, res) => {
  try {
    const { postId } = req.params;
    await pool.query("DELETE FROM posts WHERE post_id = $1", [postId]);
    res.json({ msg: "Post deleted" });
  } catch (err) {
    console.error("Admin delete post error:", err.message);
    res.status(500).json({ msg: "Server error" });
  }
});

// Test route
router.get("/test", (req, res) => {
  res.send("Admin test route works!");
});

module.exports = router;
