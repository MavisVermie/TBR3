const router = require("express").Router();
const authorize = require("../middleware/authorize");
const pool = require("../db");

// Get user profile info (username, email, zip_code)
router.get("/", authorize, async (req, res) => {   // ✅ Add authorize here
  try {
    const userId = req.user.id;  // ✅ authorize middleware sets req.user.id

    const user = await pool.query(
      "SELECT username, email, zip_code FROM users WHERE id = $1",
      [userId]
    );

    res.json(user.rows);
  } catch (err) {
    console.error("Error fetching user profile:", err.message);
    res.status(500).send("Server error");
  }
});

// Create post (not used here - done in index.js)
/*
router.post("/create-post", authorize, async (req, res) => {
  try {
    const { title } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).send("No files were uploaded.");
    }

    const imageData = file.buffer;

    const newPost = await pool.query(
      "INSERT INTO posts (title, attached_photo, user_id) VALUES ($1, $2, $3) RETURNING *",
      [title, imageData, req.user.id]
    );

    res.json(newPost.rows[0]);
  } catch (err) {
    console.error("Error creating post:", err.message);
    res.status(500).send("Server error");
  }
});
*/

// Update a post
router.put("/update-post/:id", authorize, async (req, res) => {
  try {
    const { id } = req.params;
    const { title } = req.body;

    const updatePost = await pool.query(
      "UPDATE posts SET title = $1 WHERE post_id = $2 AND user_id = $3 RETURNING *",
      [title, id, req.user.id]
    );

    if (updatePost.rows.length === 0) {
      return res.json("This post is not yours or does not exist.");
    }

    res.json("Post updated successfully.");
  } catch (err) {
    console.error("Error updating post:", err.message);
    res.status(500).send("Server error");
  }
});

// Delete a post
router.delete("/delete-post/:id", authorize, async (req, res) => {
  try {
    const { id } = req.params;

    const deletePost = await pool.query(
      "DELETE FROM posts WHERE post_id = $1 AND user_id = $2 RETURNING *",
      [id, req.user.id]
    );

    if (deletePost.rows.length === 0) {
      return res.json("This post is not yours or does not exist.");
    }

    res.json("Post deleted successfully.");
  } catch (err) {
    console.error("Error deleting post:", err.message);
    res.status(500).send("Server error");
  }
});
// GET single post by ID with extra images
router.get("/posts/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch main post details with user info
    const postResult = await pool.query(`
      SELECT 
        posts.post_id, posts.title, posts.description, posts.primary_photo,
        users.username, users.email, users.phone_number
      FROM posts
      LEFT JOIN users ON posts.user_id = users.id
      WHERE posts.post_id = $1
    `, [id]);

    if (postResult.rows.length === 0) {
      return res.status(404).json({ message: "Post not found" });
    }

    const post = postResult.rows[0];

    // Fetch secondary images (correct column name is 'image')
    const extraImagesResult = await pool.query(
      "SELECT image FROM post_images WHERE post_id = $1",
      [id]
    );

    const extraImages = extraImagesResult.rows.map(img =>
      img.image?.toString("base64")
    );

    // Final JSON response
    res.json({
      post_id: post.post_id,
      title: post.title,
      description: post.description,
      primary_photo: post.primary_photo?.toString("base64") || null,
      extra_images: extraImages,
      username: post.username,
      email: post.email,
      phone_number: post.phone_number
    });
  } catch (err) {
    console.error("Error fetching post by ID:", err.message);
    res.status(500).send("Server Error");
  }
});



module.exports = router;
