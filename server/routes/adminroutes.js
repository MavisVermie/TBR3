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

// Fetch all posts with image URLs
router.get("/posts", async (req, res) => {
  console.log("✅ Reached /admin/posts route");
  try {
    // Get all posts with user info
    const result = await pool.query(`
      SELECT 
        posts.post_id, 
        posts.title, 
        users.id AS user_id,
        users.username,
        users.email
      FROM posts
      JOIN users ON posts.user_id = users.id
    `);

    const posts = await Promise.all(result.rows.map(async (post) => {
      // Fetch first image URL for each post
      const imgRes = await pool.query(
        "SELECT image_url FROM post_images WHERE post_id = $1 LIMIT 1",
        [post.post_id]
      );

      const primary_image_url = imgRes.rows[0]?.image_url || null;

      return {
        ...post,
        primary_image_url,
      };
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
router.get("/flagged-posts", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        posts.post_id,
        posts.title,
        posts.description,
        posts.status,
        users.id AS user_id,
        users.username,
        users.email
      FROM posts
      JOIN users ON posts.user_id = users.id
      WHERE posts.status = 'flagged'
      ORDER BY posts.post_id DESC
    `);

    const flaggedPosts = await Promise.all(result.rows.map(async (post) => {
      const imgRes = await pool.query(
        "SELECT image_url FROM post_images WHERE post_id = $1 LIMIT 1",
        [post.post_id]
      );
      return {
        ...post,
        primary_image_url: imgRes.rows[0]?.image_url || null,
      };
    }));

    res.json(flaggedPosts);
  } catch (err) {
    console.error("Fetch flagged posts error:", err.message);
    res.status(500).json({ msg: "Server error" });
  }
});
router.put("/posts/:postId/approve", async (req, res) => {
  try {
    const { postId } = req.params;
    await pool.query(`UPDATE posts SET status = 'active' WHERE post_id = $1`, [postId]);
    res.json({ msg: "Post approved and reactivated" });
  } catch (err) {
    console.error("Approve post error:", err.message);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
