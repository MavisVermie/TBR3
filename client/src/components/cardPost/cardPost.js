import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './cardPost.css';

// ثوابت للتحكم في إعادة المحاولات
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;
const TIMEOUT_DURATION = 10000; // 10 ثواني للوقت الأقصى للطلب

// دالة محسنة لجلب البيانات مع إعادة المحاولة
const fetchWithRetry = async (url, options = {}, retries = MAX_RETRIES) => {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw error;
    }
    
    if (retries > 0) {
      console.log(`Retrying request... (${retries} attempts left)`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return fetchWithRetry(url, options, retries - 1);
    }
    throw error;
  }
};

export default function CardPost() {
  const [userZipCode, setUserZipCode] = useState('');
  const [posts, setPosts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [sortOrder, setSortOrder] = useState('Newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState(null);

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

  // دالة محسنة لجلب المنشورات
  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetchWithRetry(`http://localhost:5000/posts`);
      
      if (response.posts && Array.isArray(response.posts)) {
        setPosts(response.posts);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error fetching posts:', error.message);
      setError("Failed to load posts. Please try again.");
      setPosts([]);
    } finally {
      setIsLoading(false);
    }
  };

  // دالة محسنة لجلب بيانات الملف الشخصي
  const getProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const profileData = await fetchWithRetry("http://localhost:5000/Posting/", {
        method: "GET",
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (Array.isArray(profileData) && profileData.length > 0) {
        setUserZipCode(profileData[0].zip_code);
      }
    } catch (err) {
      console.error('Error fetching profile:', err.message);
      setError('Failed to load profile data');
    }
  };

  // تحسين useEffect للتعامل مع تحميل البيانات
  useEffect(() => {
    let isMounted = true;
    
    const loadData = async () => {
      try {
        await getProfile();
        if (isMounted) {
          await fetchPosts();
        }
      } catch (error) {
        if (isMounted) {
          console.error('Error loading data:', error);
        }
      }
    };
    
    loadData();
    
    return () => {
      isMounted = false;
    };
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

  const LoadingSkeleton = () => (
    <div className="animate-pulse">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="w-full h-48 bg-gray-200"></div>
            <div className="p-4 space-y-3">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/4"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

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

      {error && (
        <div className="max-w-6xl mx-auto mb-8 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <p>{error}</p>
          <button
            onClick={() => {
              setError(null);
              fetchPosts();
            }}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
          >
            Try Again
          </button>
        </div>
      )}

      {isLoading ? (
        <LoadingSkeleton />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {filteredAndSortedPosts.map(post => (
            <Link to={`/posts/${post.post_id}`} key={post.post_id}>
              <div className="bg-white shadow-md rounded-lg overflow-hidden hover:shadow-lg transition duration-300">
                {post.attached_photo ? (
                  <div className="relative w-full h-48">
                    <img
                      src={`data:image/jpeg;base64,${post.attached_photo}`}
                      alt={post.title}
                      className="w-full h-48 object-cover transition-opacity duration-300"
                      onLoad={(e) => e.target.classList.add('opacity-100')}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/placeholder-image.png';
                      }}
                    />
                  </div>
                ) : (
                  <div className="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-500">
                    No Image Available
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
      )}

      {!isLoading && filteredAndSortedPosts.length === 0 && !error && (
        <div className="text-center py-8 text-gray-600">
          No posts found matching your criteria
        </div>
      )}
    </section>
  );
}
