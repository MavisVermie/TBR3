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

const jwtSecret = process.env.JWT_SECRET; // Use environment variable

// Middleware
app.use(cors());
app.use(express.json());
app.use(fileUpload());

// ROUTES
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
    const user_id = req.user; // This assumes that the authorize middleware adds the user object with 'id' to the req
    
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
    const { username, password, email, zip_code } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const { rows } = await pool.query(
      "INSERT INTO users (username, password, email, zip_code) VALUES ($1, $2, $3, $4) RETURNING id",
      [username, hashedPassword, email, zip_code]
    );

    const userId = rows[0].id;

    const jwtToken = generateJWTToken(userId);

    res.json({ jwtToken });

  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});



//Create post
app.post("/create_post", async (req, res) => {
  try {
    console.log("Received request to create post:", req.body);

    if (!req.files || !req.files.pic || !req.body.title) {
      return res.status(400).send("Title and Image are required.");
    }

    const { title } = req.body;
    const { data } = req.files.pic;

    // ✅ Correct way to read jwt_token from headers
    const token = req.header("jwt_token");
    const decoded = jwt.verify(token, jwtSecret);
    const userId = decoded.userId;

    console.log("Extracted user_id:", userId);

    const newPost = await pool.query(
      "INSERT INTO posts (title, attached_photo, user_id) VALUES ($1, $2, $3) RETURNING *",
      [title, data, userId]
    );

    res.json("Upload Success");
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});



app.get('/posts', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        posts.post_id, 
        posts.title, 
        posts.attached_photo, 
        posts.user_id,
        users.email,
        users.zip_code
      FROM posts
      LEFT JOIN users ON posts.user_id = users.id
    `);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'No posts found' });
    }

    const postsWithPhotos = result.rows.map(post => ({
      post_id: post.post_id,
      title: post.title,
      email: post.email,
      userId: post.user_id,
      zip_code: post.zip_code, // ✅ Now zip_code will be correctly attached!
      attached_photo: post.attached_photo.toString('base64')
    }));

    res.json(postsWithPhotos);
  } catch (error) {
    console.error('Error fetching posts:', error.message);
    res.status(500).json({ message: 'Server Error' });
  }
});



// Backend Route to Fetch Posts for a Specific User
app.get('/posts/user', authorize, async (req, res) => {
  try {
    // Extracting the user ID from the JWT token added to the req by the 'authorize' middleware
    const user_id = req.user; // Adjust this according to how your token payload is structured
    
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
    const user_id = req.user;

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


app.listen(5000, () => {
    console.log("Server has started on port 5000");
});
