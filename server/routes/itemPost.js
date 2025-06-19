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

const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

// UPDATE POST
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
      features,
      deletedImages = "[]", // Expecting array of URLs
    } = req.body;

    // Parse features
    let parsedFeatures = [];
    try {
      parsedFeatures = features ? JSON.parse(features) : [];
    } catch (err) {
      console.warn("Failed to parse features:", err.message);
    }

    // Parse deleted image URLs
    let deletedImageUrls = [];
    try {
      deletedImageUrls = JSON.parse(deletedImages);
    } catch (err) {
      console.warn("Failed to parse deletedImages:", err.message);
    }

    // Update the post details
    const updateQuery = `
      UPDATE posts
      SET title = $1,
          description = $2,
          email = $3,
          phone = $4,
          location = $5,
          features = $6
      WHERE post_id = $7 AND user_id = $8
      RETURNING post_id
    `;

    const result = await pool.query(updateQuery, [
      title,
      description,
      email || null,
      phone || null,
      location || null,
      parsedFeatures.length ? parsedFeatures : null,
      id,
      userId
    ]);

    if (result.rows.length === 0) {
      return res.status(403).json({ message: "Not authorized or post not found" });
    }

    const postId = result.rows[0].post_id;

    // Delete selected images
    if (deletedImageUrls.length > 0) {
      await pool.query(
        `DELETE FROM post_images 
         WHERE post_id = $1 AND image_url = ANY($2::text[])`,
        [postId, deletedImageUrls]
      );

      // Optionally: delete physical files
      for (const url of deletedImageUrls) {
        const filePath = path.join("/var/www/tbr3", new URL(url).pathname);
        if (fs.existsSync(filePath)) {
          fs.unlink(filePath, (err) => {
            if (err) console.warn(`Failed to delete ${filePath}:`, err.message);
          });
        }
      }
    }

    // Handle new uploaded images
    const imageFiles = req.files?.images;
    const uploadedImages = Array.isArray(imageFiles)
      ? imageFiles
      : imageFiles ? [imageFiles] : [];

    const uploadDir = path.join("/var/www/tbr3/uploads/posts");

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    for (const file of uploadedImages) {
      const ext = path.extname(file.name).toLowerCase();
      const fileName = `${uuidv4()}${ext}`;
      const filePath = path.join(uploadDir, fileName);

      await file.mv(filePath);

      const imageUrl = `${process.env.BASE_URL}/uploads/posts/${fileName}`;

      await pool.query(
        `INSERT INTO post_images (post_id, image_url) VALUES ($1, $2)`,
        [postId, imageUrl]
      );
    }

    res.json({ message: "Post updated successfully" });

  } catch (err) {
    console.error("Error updating post:", err.message);
    res.status(500).send("Server error");
  }
});

module.exports = router;


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
const primaryImage = imageUrls[0] || null;
const extraImages = imageUrls.slice(1);

// Final response
res.json({
  post_id: post.post_id,
  title: post.title,
  description: post.description,
  primary_photo: primaryImage,
  extra_images: extraImages,
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
    console.log("Fetching posts for userId:", userId);

    // Get all posts created by this user
    const myPostsRes = await pool.query(
      `SELECT post_id, title, description, location, created_at 
       FROM posts 
       WHERE user_id = $1 
       ORDER BY created_at DESC`,
      [userId]
    );

    const posts = myPostsRes.rows;

    // For each post, fetch its images from post_images table
    const postsWithImages = await Promise.all(
      posts.map(async (post) => {
        const imagesRes = await pool.query(
          `SELECT image_url FROM post_images WHERE post_id = $1`,
          [post.post_id]
        );

        const images = imagesRes.rows.map((row) => row.image_url);

        return {
          ...post,
          images, // can rename to extra_images if needed
        };
      })
    );

    res.json(postsWithImages);
  } catch (err) {
    console.error("Error fetching user's posts:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});




module.exports = router;
