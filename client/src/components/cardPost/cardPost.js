import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import './cardPost.css';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;
const POSTS_PER_PAGE = 12;

const fetchWithRetry = async (url, options = {}, retries = MAX_RETRIES) => {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
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
    'الكل', 'أثاث', 'إلكترونيات', 'ألعاب', 'ملابس', 'كتب',
    'أجهزة منزلية', 'ألعاب', 'أدوات', 'معدات رياضية', 'طعام', 'أخرى'
  ];

  const extractCity = (location) => location?.split(' - ')[0]?.trim() || 'غير معروف';

  const getProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const response = await fetch("http://localhost:5000/Posting/", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      if (response.status === 401) {
        localStorage.removeItem('token');
        return;
      }
      const profileData = await response.json();
      if (Array.isArray(profileData) && profileData.length > 0) {
        setUserZipCode(profileData[0].zip_code);
      }
    } catch (err) {
      console.error('Error fetching profile:', err.message);
    }
  };

  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      };
      const response = await fetch(`http://localhost:5000/posts`, { headers });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
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
        if (isMounted) await fetchPosts();
      } catch (error) {
        if (isMounted) console.error('Error loading data:', error);
      }
    };
    loadData();
    return () => { isMounted = false; };
  }, []);

  const locationOptions = useMemo(() =>
    ['All', ...Array.from(new Set(posts.map(p => extractCity(p.location)).filter(Boolean)))], [posts]);

  const filteredAndSortedPosts = useMemo(() =>
    posts
      .filter(post => selectedCategory === "All" || (post.features?.[0] || "Other") === selectedCategory)
      .filter(post => selectedLocation === "All" || extractCity(post.location) === selectedLocation)
      .filter(post => post.title?.toLowerCase().includes(searchQuery.toLowerCase()))
      .sort((a, b) => {
        const dateA = new Date(a.created_at), dateB = new Date(b.created_at);
        return sortOrder === 'Newest' ? dateB - dateA : dateA - dateB;
      }), [posts, selectedCategory, selectedLocation, searchQuery, sortOrder]);

  const paginatedPosts = useMemo(() =>
    filteredAndSortedPosts.slice(0, currentPage * POSTS_PER_PAGE),
    [filteredAndSortedPosts, currentPage]);

  const handleLoadMore = () => setCurrentPage(prev => prev + 1);

  const LoadingSkeleton = () => (
    <div className="animate-pulse grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="bg-white rounded shadow-sm p-4">
          <div className="w-full h-48 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded mb-4 shimmer"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2 shimmer"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 shimmer"></div>
        </div>
      ))}
    </div>
  );

  return (
    <section className="min-h-screen bg-gray-100 py-12 px-4">
      <div className="max-w-6xl mx-auto text-center mb-8">
        <h1 className="text-4xl font-semibold text-red-700">تصفح جميع المنتجات</h1>

        <div className="flex flex-wrap justify-center gap-6 mt-6">
          <Select label="الفئة" value={selectedCategory} onChange={setSelectedCategory} options={categoryOptions} />
          <Select label="الموقع" value={selectedLocation} onChange={setSelectedLocation} options={locationOptions} />
          <Select label="ترتيب حسب الوقت" value={sortOrder} onChange={setSortOrder} options={['الأحدث', 'الأقدم']} />
          <div>
            <label className="block text-sm text-green-900 mb-1">البحث في العنوان:</label>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="border px-3 py-1 rounded shadow-sm w-40"
              placeholder="مثال: كرسي"
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="max-w-6xl mx-auto mb-8 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <p>{error}</p>
          <button
            onClick={() => { setError(null); fetchPosts(); }}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
          >
            حاول مرة أخرى
          </button>
        </div>
      )}

      {isLoading ? <LoadingSkeleton /> : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-14  mx-auto">
            {paginatedPosts.map(post => (
              <Link to={`/posts/${post.post_id}`} key={post.post_id}>
                <div
                  className="
                    bg-white shadow rounded overflow-hidden 
                   transition-shadow duration-700 ease
                    hover:shadow-xl hover:scale-110 
                    hover:ring-2 hover:ring-green-700 w-l h-80
                  "
                >
                  <div className="w-full h-2/3 bg-gray-200 flex items-center justify-center">
                    {post.image ? (
                      <img
                        src={`data:image/jpeg;base64,${post.image}`}
                        alt={post.title}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-black truncate ">{post.title}</h3>
                    <p className="text-sm text-zinc-600"><span className="font-medium ">الموقع:</span> {extractCity(post.location)}</p>
                    <p className="text-sm text-gray-400"><span className="font-medium">تاريخ النشر:</span> {new Date(post.created_at).toLocaleString()}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {paginatedPosts.length < filteredAndSortedPosts.length && (
            <div className="text-center mt-8">
              <button
                onClick={handleLoadMore}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition "
              >
                عرض المزيد
              </button>
            </div>
          )}
        </>
      )}

      {!isLoading && filteredAndSortedPosts.length === 0 && !error && (
        <div className="text-center py-8 text-gray-600">
          لم يتم العثور على منشورات تطابق معايير البحث.
        </div>
      )}
    </section>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <div>
      <label className="block text-sm text-green-900 mb-1">{label}</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="border px-3 py-1 rounded shadow-sm w-40"
      >
        {options.map(option => (
          <option key={option} value={option}>
            {option === 'All' ? 'الكل' : option}
          </option>
        ))}
      </select>
    </div>
  );
}
