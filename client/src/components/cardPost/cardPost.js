import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './cardPost.css';

export default function CardPost() {
  const [userZipCode, setUserZipCode] = useState('');
  const [posts, setPosts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [sortOrder, setSortOrder] = useState('Newest');
  const [searchQuery, setSearchQuery] = useState('');

  const categoryOptions = [
    'All',
    'Furniture',
    'Electronics',
    'Games',
    'Clothing',
    'Books',
    'Appliances',
    'Toys',
    'Tools',
    'Sports Equipment',
    'Food',
    'Other',
  ];

  const extractCity = (location) => {
    return location?.split(' - ')[0]?.trim() || 'Unknown';
  };

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

  const locationOptions = ['All', ...Array.from(new Set(
    posts.map(p => extractCity(p.location)).filter(Boolean)
  ))];

  const filteredAndSortedPosts = posts
    .filter(post => {
      const category = post.features?.[0] || "Other";
      return selectedCategory === "All" || category === selectedCategory;
    })
    .filter(post => {
      const city = extractCity(post.location);
      return selectedLocation === "All" || city === selectedLocation;
    })
    .filter(post =>
      post.title?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      const dateA = new Date(a.created_at);
      const dateB = new Date(b.created_at);
      if (isNaN(dateA) || isNaN(dateB)) return 0;
      return sortOrder === 'Newest' ? dateB - dateA : dateA - dateB;
    });

  return (
    <section className="min-h-screen bg-gray-100 py-12 px-4">
      <div className="max-w-6xl mx-auto text-center mb-8">
        <h1 className="text-3xl font-bold text-green-700">
          Browsing All Items
        </h1>

        <div className="flex flex-wrap justify-center gap-4 mt-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Category:</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="border rounded px-3 py-1 shadow-sm"
            >
              {categoryOptions.map((cat, index) => (
                <option key={index} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Location:</label>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="border rounded px-3 py-1 shadow-sm"
            >
              {locationOptions.map((loc, index) => (
                <option key={index} value={loc}>{loc}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Sort by Time:</label>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="border rounded px-3 py-1 shadow-sm"
            >
              <option value="Newest">Newest First</option>
              <option value="Oldest">Oldest First</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Search Title:</label>
            <input
              type="text"
              placeholder="e.g. chair"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border rounded px-3 py-1 shadow-sm"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {filteredAndSortedPosts.map(post => (
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
                <p className="text-xs text-gray-500 mt-1">
                  Category: {post.features?.[0] || "Other"}
                </p>
                <p className="text-xs text-gray-400">
                  Location: {post.location?.split(" - ")[0] || "Unknown"}
                </p>
                <p className="text-xs text-gray-400">
                  Posted: {new Date(post.created_at).toLocaleString()}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
