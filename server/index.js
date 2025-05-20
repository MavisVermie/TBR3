require('dotenv').config();
console.log("JWT Secret loaded:", process.env.JWT_SECRET);
const express = require("express");
const app = express();
const cors = require("cors");
const pool = require("./db");
const fileUpload = require("express-fileupload");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const authorize = require("./middleware/authorize");
const sendemail = require("./middleware/mailer"); //gimme mailer
const jwtSecret = process.env.JWT_SECRET; // Use environment variable
const crypto = require('crypto');
const NodeCache = require('node-cache');
const cache = new NodeCache();
// const sharp = require('sharp');

// Middleware
app.use(cors());
app.use(express.json());
app.use(fileUpload());

// ROUTES
app.use("/admin", require("./routes/adminroutes"));
app.use("/authentication", require("./routes/jwtAuth"));
app.use("/Posting", require("./routes/itemPost"));
// app.use("/images", require("./routes/imageRoutes"));
// Backend Route to Fetch Images by postId
app.get('/images/:postId', async (req, res) => {
  try {
    const { postId } = req.params;
   
    // Query the database to retrieve the image data for the given postId
    const result = await pool.query('SELECT attached_photo FROM posts WHERE post_id = $1', [postId]);

    // Check if an image was found for the given postId
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Image not found' });
    }

    // Extract the image data from the database result
    const imageData = result.rows[0].attached_photo;
    const base64ImageData = imageData.toString('base64');
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Embedded Image</title>
      </head>
      <body>
        <h1>Embedded Image</h1>
        <img src="data:image/;base64,${base64ImageData}" alt="Embedded Image">
      </body>
      </html>
    `;


    // Serve the image data as a response with the appropriate content type
    res.writeHead(200, {
      'Content-Type': 'text/html', // Adjust content type based on your image format
      'Worked': 'yes'
    });
    res.end(htmlContent);
 

  } catch (error) {
    console.error('Error fetching image:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});


// Function to generate JWT token
function generateJWTToken(userId) {
    return jwt.sign({ userId }, jwtSecret, { expiresIn: '1h' });
  }

// Use the 'authorize' middleware to validate the JWT token and extract user information
app.put("/update-credentials", authorize, async (req, res) => {
  try {
    // Extracting the user ID added to the req by the 'authorize' middleware
    const user_id = req.user.id; // This assumes that the authorize middleware adds the user object with 'id' to the req
    
    // Extract user details from request body
    const { username, email, zip_code } = req.body;

    // Update user in the database
    const updateUser = await pool.query(
      "UPDATE users SET username = $1, email = $2, zip_code = $3 WHERE user_id = $4 RETURNING username, email, zip_code",
      [username, email, zip_code, user_id]
    );

    if (updateUser.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    // Send back the updated user information
    res.json(updateUser.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});





// Registration
// Registration Route
app.post("/authentication/registration", async (req, res) => {
  try {
    const { username, password, email, zip_code, phone_number } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const { rows } = await pool.query(
      "INSERT INTO users (username, password, email, zip_code, phone_number) VALUES ($1, $2, $3, $4, $5) RETURNING id",
      [username, hashedPassword, email, zip_code, phone_number]
    );

    const userId = rows[0].id;

    const jwtToken = generateJWTToken(userId);

    res.json({ jwtToken });

  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

app.post("/forgot-password", async (req, res) => {
try{
const {email} = req.body;
//find user from his email
const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
if(user.rows.length === 0){ //checks if the length 0
  return res.status(404).json({message: "User not found"});
}
const userId = user.rows[0].id;

//we are generating random token as the reset token and make it 15mins only
const token = crypto.randomBytes(32).toString('hex');
const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes from now
await pool.query('DELETE FROM password_resets WHERE user_id = $1', [userId]);
//now we store token in database
await pool.query(
  'INSERT INTO password_resets (user_id, token, expires) VALUES ($1, $2, $3)',
  [userId, token, expires]
)
const resetLink = `http://localhost:3000/reset-password?token=${token}`; 
//send email to user
await sendemail(email, resetLink); 
res.json({message: "pass reset link sent to email."});
}catch (err) { //if theres error
  console.error("error in password forgot",err);
  res.status(500).send("Server Error");
}

});
//password reset here
app.post('/reset-password', async (req, res) => {
  try {
    const { token, new_password } = req.body;

//I NEED TO ADD CHECK PASSWORD LENGTH HERE 

    const tokenRes = await pool.query(
      'SELECT user_id, expires FROM password_resets WHERE token = $1',
      [token]
    );
//check token valid or no
    if (tokenRes.rows.length === 0 || new Date() > tokenRes.rows[0].expires) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    const userId = tokenRes.rows[0].user_id;
    const hashedPassword = await bcrypt.hash(new_password, 10); //hash the new password
    // //debug
    console.log(" raw password:", new_password);
    console.log(" hashed password:", hashedPassword);

//update password in database
    await pool.query(
      'UPDATE users SET password = $1 WHERE id = $2',
      [hashedPassword, userId]
    );
//remove the tokenn
    await pool.query('DELETE FROM password_resets WHERE token = $1', [token]);

    res.json({ message: 'pass reset successful yay!!' });

  } catch (err) {
    console.error('error in reset pass:', err.message);
    res.status(500).send('Server Error');
  }
});

app.post("/create_post", async (req, res) => {
  try {
    const token = req.header("jwt_token");
if (!token) return res.status(401).json({ message: "No token provided" });

    const decoded = jwt.verify(token, jwtSecret);
    const userId = decoded.userId;

    if (!req.files || !req.files.images || !req.body.title || !req.body.description) {
      return res.status(400).send("Title, description, and at least one image are required.");
    }

    const { title, description, features, email, phone, location } = req.body;

    const imageFiles = Array.isArray(req.files.images) ? req.files.images : [req.files.images];
    const primaryPhoto = imageFiles[0].data;
    const extraImages = imageFiles.slice(1);

    let parsedFeatures = [];
    try {
      parsedFeatures = features ? JSON.parse(features) : [];
    } catch (err) {
      console.warn("Failed to parse features:", err.message);
    }

    const postInsert = await pool.query(
      `INSERT INTO posts (title, description, primary_photo, user_id, email, phone, features, location)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING post_id`,
      [
        title,
        description,
        primaryPhoto,
        userId,
        email || null,
        phone || null,
        parsedFeatures.length ? parsedFeatures : null,
        location || null
      ]
    );

    const postId = postInsert.rows[0].post_id;

    for (const file of extraImages) {
      await pool.query(
        "INSERT INTO post_images (post_id, image) VALUES ($1, $2)",
        [postId, file.data]
      );
    }

    res.json({ message: "Post created successfully", post_id: postId });
  } catch (err) {
    console.error("Create post error:", err);
res.status(500).json({ message: "Server Error" });
  }
});






app.get('/posts', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const offset = (page - 1) * limit;
    const cacheKey = `posts_${page}_${limit}`;

    // Check cache first
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      return res.json(cachedData);
    }

    // Get total count with caching
    const countCacheKey = 'total_posts_count';
    let totalPosts = cache.get(countCacheKey);
    
    if (!totalPosts) {
      const countResult = await pool.query('SELECT COUNT(*) FROM posts');
      totalPosts = parseInt(countResult.rows[0].count);
      cache.set(countCacheKey, totalPosts, 300); // Cache count for 5 minutes
    }

    // Optimized query with proper indexing and error handling
    const result = await pool.query(`
      SELECT 
        p.post_id, 
        p.title, 
        p.primary_photo,
        p.user_id,
        p.features,
        p.created_at,
        p.location AS post_location,
        p.email,
        p.description,
        u.zip_code
      FROM posts p
      LEFT JOIN users u ON p.user_id = u.id
      ORDER BY p.created_at DESC
      LIMIT $1 OFFSET $2
    `, [limit, offset]);

    if (!result.rows) {
      throw new Error('Database query returned no results');
    }

    // Process images in parallel with optimization and error handling
    const postsWithPhotos = await Promise.all(result.rows.map(async post => {
      try {
        const imageBuffer = post.primary_photo;
        let optimizedImage = null;

        if (imageBuffer) {
          try {
            optimizedImage = await optimizeImage(imageBuffer);
          } catch (imageError) {
            console.error('Image optimization error:', imageError);
            // Continue without optimized image
          }
        }

        return {
          post_id: post.post_id,
          title: post.title,
          email: post.email,
          description: post.description,
          userId: post.user_id,
          zip_code: post.zip_code,
          features: post.features || ["Other"],
          attached_photo: optimizedImage ? optimizedImage.toString('base64') : null,
          created_at: post.created_at,
          location: post.post_location || "Unknown"
        };
      } catch (postError) {
        console.error('Error processing post:', postError);
        return null;
      }
    }));

    // Filter out any null posts from processing errors
    const validPosts = postsWithPhotos.filter(post => post !== null);

    if (validPosts.length === 0) {
      return res.json({
        posts: [],
        pagination: {
          currentPage: page,
          totalPages: 0,
          totalPosts: 0,
          hasMore: false
        }
      });
    }

    const response = {
      posts: validPosts,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalPosts / limit),
        totalPosts,
        hasMore: offset + limit < totalPosts
      }
    };

    // Cache the response
    cache.set(cacheKey, response);
    res.json(response);
  } catch (error) {
    console.error('Error in /posts endpoint:', error);
    res.status(500).json({ 
      message: 'Server Error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});





// Backend Route to Fetch Posts for a Specific User
app.get('/posts/user', authorize, async (req, res) => {
  try {
    // Extracting the user ID from the JWT token added to the req by the 'authorize' middleware
    const user_id = req.user.id; // Adjust this according to how your token payload is structured
    
    // Query the database to retrieve posts only for the logged-in user
    const result = await pool.query('SELECT * FROM posts WHERE user_id = $1', [user_id]);

    // Check if any posts were found
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'No posts found for this user' });
    }

    // Send the posts as the response
    res.json(result.rows.map(post => ({
      ...post,
      attached_photo: post.attached_photo.toString('base64') // Convert BYTEA to base64 string
    })));
  } catch (error) {
    console.error('Error fetching posts for user:', error.message);
    res.status(500).json({ message: 'Server Error' });
  }
});
// DELETE route to delete a post
app.delete('/posts/:postId', authorize, async (req, res) => {
  try {
    const { postId } = req.params;
    const user_id = req.user.id;

    // Delete the post if it belongs to the user
    const deleteQuery = 'DELETE FROM posts WHERE post_id = $1 AND user_id = $2 RETURNING *';
    const result = await pool.query(deleteQuery, [postId, user_id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Post not found or not authorized to delete this post' });
    }

    res.json({ message: 'Post deleted' });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Replace the optimizeImage function with a simpler version
async function optimizeImage(imageBuffer) {
  try {
    // Just return the original buffer for now
    return imageBuffer;
  } catch (error) {
    console.error('Error processing image:', error);
    return imageBuffer;
  }
}

// Add error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    message: 'Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Add process error handlers
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  // Perform cleanup if needed
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Perform cleanup if needed
});

setInterval(() => {
  pool.query('SELECT 1').catch(() => {});
}, 300000);
app.listen(5000, () => {
    console.log("Server has started on port 5000");
});
