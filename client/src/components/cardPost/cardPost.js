import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import './cardPost.css';

// ثوابت للتحكم في إعادة المحاولات
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;
const POSTS_PER_PAGE = 12;

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
    if (retries > 0) {
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
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

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

  // دالة محسنة لجلب بيانات الملف الشخصي
  const getProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No token found');
        return;
      }

      const response = await fetch("http://localhost:5000/Posting/", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (response.status === 401) {
        console.log('Token expired or invalid');
        localStorage.removeItem('token');
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const profileData = await response.json();
      if (Array.isArray(profileData) && profileData.length > 0) {
        setUserZipCode(profileData[0].zip_code);
      }
    } catch (err) {
      console.error('Error fetching profile:', err.message);
    }
  };

  // دالة محسنة لجلب المنشورات
  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json'
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`http://localhost:5000/posts`, {
        headers
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.posts && Array.isArray(data.posts)) {
        const processedPosts = data.posts.map(post => ({
          ...post,
          image: post.attached_photo || null
        }));
        
        setPosts(processedPosts);
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

  // تحسين الأداء باستخدام useMemo
  const locationOptions = useMemo(() => 
    ['All', ...Array.from(new Set(
      posts.map(p => extractCity(p.location)).filter(Boolean)
    ))], [posts]);

  const filteredAndSortedPosts = useMemo(() => 
    posts
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
      }), [posts, selectedCategory, selectedLocation, searchQuery, sortOrder]);

  const paginatedPosts = useMemo(() => 
    filteredAndSortedPosts.slice(0, currentPage * POSTS_PER_PAGE),
    [filteredAndSortedPosts, currentPage]);

  const LoadingSkeleton = () => (
    <div className="animate-pulse">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="relative">
              <div className="w-full h-48 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-shimmer"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shine"></div>
            </div>
            
            <div className="p-5 space-y-4">
              <div className="space-y-2">
                <div className="h-5 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded animate-shimmer w-3/4"></div>
                <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded animate-shimmer w-1/2"></div>
              </div>
              
              <div className="space-y-2">
                <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded animate-shimmer w-2/3"></div>
                <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded animate-shimmer w-1/2"></div>
              </div>
              
              <div className="space-y-2">
                <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded animate-shimmer w-1/3"></div>
                <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded animate-shimmer w-1/4"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const handleLoadMore = () => {
    setCurrentPage(prev => prev + 1);
  };

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
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {paginatedPosts.map(post => (
              <Link to={`/posts/${post.post_id}`} key={post.post_id}>
                <div className="bg-white shadow-md rounded-lg overflow-hidden hover:shadow-lg transition duration-300 transform hover:-translate-y-1">
                  <div className="card-image-container">
                    {post.image ? (
                      <img
                        src={`data:image/jpeg;base64,${post.image}`}
                        alt={post.title}
                        className="card-image"
                        loading="lazy"
                        onLoad={(e) => e.target.classList.add('opacity-100')}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/placeholder-image.png';
                        }}
                      />
                    ) : (
                      <div className="no-image-placeholder">
                        <svg className="no-image-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-semibold text-gray-800 truncate mb-2">{post.title}</h3>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">
                        Contact: <button
                          onClick={(e) => {
                            e.preventDefault();
                            window.location.href = `mailto:${post.email}`;
                          }}
                          className="text-green-600 hover:text-green-700 hover:underline transition-colors duration-200"
                        >
                          {post.email}
                        </button>
                      </p>
                      <p className="text-sm text-gray-500">
                        <span className="font-medium">Category:</span> {post.features?.[0] || "Other"}
                      </p>
                      <p className="text-sm text-gray-500">
                        <span className="font-medium">Location:</span> {post.location?.split(" - ")[0] || "Unknown"}
                      </p>
                      <p className="text-sm text-gray-400">
                        <span className="font-medium">Posted:</span> {new Date(post.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {paginatedPosts.length < filteredAndSortedPosts.length && (
            <div className="text-center mt-8">
              <button
                onClick={handleLoadMore}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
              >
                Load More
              </button>
            </div>
          )}
        </>
      )}

      {!isLoading && filteredAndSortedPosts.length === 0 && !error && (
        <div className="text-center py-8 text-gray-600">
          No posts found matching your criteria
        </div>
      )}
    </section>
  );
}

const styles = `
@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

@keyframes shine {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

.animate-shimmer {
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.animate-shine {
  animation: shine 1.5s infinite;
}
`;

const styleSheet = document.createElement("style");
styleSheet.textContent = styles;
document.head.appendChild(styleSheet);
