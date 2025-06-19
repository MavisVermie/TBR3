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

router.put("/update-post/:id", authorize, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const {
      title,
      description,
      email,
      phone,
      location,
      features
    } = req.body;

    let parsedFeatures = [];
    try {
      parsedFeatures = features ? JSON.parse(features) : [];
    } catch (err) {
      console.warn("Failed to parse features:", err.message);
    }

    const files = req.files?.images;
    const imageFiles = Array.isArray(files) ? files : files ? [files] : [];

    const primaryPhoto = imageFiles[0]?.data || null;
    const extraImages = imageFiles.slice(1);

    // 🔄 Step 1: Update the post
    const updateQuery = `
      UPDATE posts
      SET title = $1,
          description = $2,
          email = $3,
          phone = $4,
          location = $5,
          features = $6,
          primary_photo = COALESCE($7, primary_photo)
      WHERE post_id = $8 AND user_id = $9
      RETURNING post_id
    `;

    const result = await pool.query(updateQuery, [
      title,
      description,
      email || null,
      phone || null,
      location || null,
      parsedFeatures.length ? parsedFeatures : null,
      primaryPhoto,
      id,
      userId
    ]);

    if (result.rows.length === 0) {
      return res.status(403).json({ message: "Not authorized or post not found" });
    }

    const postId = result.rows[0].post_id;

    // 🔄 Step 2: Optionally delete old extra images
    await pool.query("DELETE FROM post_images WHERE post_id = $1", [postId]);

    // 🔄 Step 3: Insert new extra images
    for (const file of extraImages) {
      await pool.query(
        "INSERT INTO post_images (post_id, image) VALUES ($1, $2)",
        [postId, file.data]
      );
    }

    return res.json({ message: "Post updated successfully" });

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
router.get("/posts/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch post data
    const postResult = await pool.query(`
      SELECT  
        posts.post_id,
        posts.title,
        posts.description,
        posts.location,
        posts.features,
        posts.user_id,
        users.username,
        users.email,
        posts.phone
      FROM posts
      LEFT JOIN users ON posts.user_id = users.id
      WHERE posts.post_id = $1
    `, [id]);

    if (postResult.rows.length === 0) {
      return res.status(404).json({ message: "Post not found" });
    }

    const post = postResult.rows[0];

    // Parse features if needed
    let parsedFeatures = [];
    if (post.features && typeof post.features === 'string') {
      parsedFeatures = post.features
        .replace(/[{}"]/g, '')
        .split(',')
        .map(f => f.trim())
        .filter(f => f);
    } else if (Array.isArray(post.features)) {
      parsedFeatures = post.features;
    }

    // Get ALL images (primary + extra), already stored as full URLs
    const imagesResult = await pool.query(
      "SELECT image_url FROM post_images WHERE post_id = $1 ORDER BY id ASC",
      [id]
    );

    const imageUrls = imagesResult.rows.map(row => row.image_url);

    // Final response
    res.json({
      post_id: post.post_id,
      title: post.title,
      description: post.description,
      images: imageUrls,
      username: post.username,
      email: post.email,
      phone: post.phone,
      location: post.location || '',
      features: parsedFeatures,
      user_id: post.user_id
    });

  } catch (err) {
    console.error("Error fetching post by ID:", err.message);
    res.status(500).send("Server Error");
  }
});


// ... كود الراوتات السابقة

// ✅ Route جديد: Get posts of the logged-in user only
router.get("/my-posts", authorize, async (req, res) => {
  try {
    const userId = req.user.id;
    console.log("Fetching posts for userId:", userId); // Debug log

    // Only get posts for the logged-in user
    const myPosts = await pool.query(
      "SELECT post_id, title, description, primary_photo, location, created_at FROM posts WHERE user_id = $1 ORDER BY created_at DESC",
      [userId]
    );
    console.log("Number of posts found:", myPosts.rows.length); // Debug log

    const formattedPosts = myPosts.rows.map(post => ({
      ...post,
      primary_photo: post.primary_photo?.toString("base64") || null
    }));

    res.json(formattedPosts);
  } catch (err) {
    console.error("Error fetching user's posts:", err.message);
    res.status(500).send("Server error");
  }
});




module.exports = router;
