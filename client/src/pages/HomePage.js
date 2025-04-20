import React, { useState, useEffect } from 'react';
import './HomePage.css'; // Import the CSS file

function HomePage() {
  const [userZipCode, setUserZipCode] = useState('');
  const [posts, setPosts] = useState([]);

  // Fetch user's zip code
  const getProfile = async () => {
    try {
      const token = localStorage.getItem('token');
  
      if (!token) {
        console.error('No token found in localStorage');
        return;
      }
  
      const res = await fetch("http://localhost:5000/Posting/", {
        method: "GET",
        headers: { 
          "Authorization": `Bearer ${token}` // ✅ Correct header
        },
      });
  
      const profileData = await res.json();
  
      if (Array.isArray(profileData) && profileData.length > 0) {
        setUserZipCode(profileData[0].zip_code);
      } else {
        console.error('Profile fetch returned no data');
      }
    } catch (err) {
      console.error('Error fetching profile:', err.message);
    }
  };

  // Fetch posts
  const fetchPosts = async () => {
    try {
      const response = await fetch(`http://localhost:5000/posts`, {
        method: "GET",
      });

      const postsData = await response.json();

      console.log("Fetched posts:", postsData); // Debugging

      setPosts(postsData);
    } catch (error) {
      console.error('Error fetching posts:', error.message);
    }
  };

  useEffect(() => {
    getProfile();
    fetchPosts();
  }, []);

  return (
    <div>
      <h1>Items Showing for Zip Code: {userZipCode || "Loading..."}</h1>

      <div className="photo-container">
        {posts
          .filter(post => post.zip_code === userZipCode) // 🛠️ Filter posts by matching zip_code
          .map(post => (
            <div key={post.post_id} className="photo-item">
              <div className="photo-box">
                <p className="photo-title">{post.title}</p>
                <img src={`data:image/*;base64,${post.attached_photo}`} alt={post.title} className="center-image" />
                <p className="photo-email">
                  Contact At: <a href={`mailto:${post.email}`}>{post.email}</a>
                </p>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

export default HomePage;
