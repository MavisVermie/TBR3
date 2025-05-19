import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function HomePage() {
  const [userZipCode, setUserZipCode] = useState('');
  const [posts, setPosts] = useState([]);

  // Fetch user's zip code
  const getProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const res = await fetch("http://localhost:5000/Posting/", {
        method: "GET",
        headers: { "Authorization": `Bearer ${token}` }
      });

      const profileData = await res.json();
      if (Array.isArray(profileData) && profileData.length > 0) {
        setUserZipCode(profileData[0].zip_code);
      }
    } catch (err) {
      console.error('Error fetching profile:', err.message);
    }
  };

  // Fetch posts
  const fetchPosts = async () => {
    try {
      const response = await fetch(`http://localhost:5000/posts`);
      const postsData = await response.json();
      if (Array.isArray(postsData)) {
        setPosts(postsData);
      } else {
        console.error("Unexpected posts response:", postsData);
        setPosts([]);
      }
    } catch (error) {
      console.error('Error fetching posts:', error.message);
      setPosts([]);
    }
  };

  useEffect(() => {
    getProfile();
    fetchPosts();
  }, []);

  const filteredPosts = posts.filter(post => post.zip_code === userZipCode);

  return (
    <section className="min-h-screen bg-gray-100 py-12 px-4">
      <div className="max-w-6xl mx-auto text-center mb-10">
        <h1 className="text-3xl font-bold text-green-700">
          Items in Your Area ({userZipCode || "Loading..."})
        </h1>
        <p className="text-sm text-gray-600 mt-2">Only showing posts matching your zip code</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {filteredPosts.map(post => (
          <Link to={`/posts/${post.post_id}`} key={post.post_id}>
            <div className="bg-white shadow-md rounded-lg overflow-hidden hover:shadow-lg transition duration-300">
              {post.attached_photo ? (
                <img
                  src={`data:image/*;base64,${post.attached_photo}`}
                  alt={post.title}
                  className="w-full h-48 object-cover"
                />
              ) : (
                <div className="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-500">
                  No Image
                </div>
              )}
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-800 truncate">{post.title}</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Contact at: <button 
                    onClick={(e) => {
                      e.preventDefault();
                      window.location.href = `mailto:${post.email}`;
                    }}
                    className="text-green-600 hover:underline"
                  >
                    {post.email}
                  </button>
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default HomePage;
