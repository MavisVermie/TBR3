import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

/**
 * مكون UserPosts
 * يعرض منشورات المستخدم مع إمكانية التصفية والترتيب والتعديل والحذف
 */
export default function UserPosts(){
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserPosts = async () => {
      try {
        // التحقق من وجود توكن المستخدم
        const token = localStorage.getItem('token');
        if (!token) {
          toast.error("Please login to view your posts");
          setLoading(false);
          return;
        }

        // إرسال طلب لجلب منشورات المستخدم
        const response = await fetch("http://localhost:5000/posts/user", {
          method: "GET",
          headers: { 
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}` 
          }
        });

        // معالجة مختلف حالات الاستجابة
        if (!response.ok) {
          const errorData = await response.json();
          console.error('Server Error Details:', errorData);
          
          // التحقق من انتهاء صلاحية الجلسة
          if (response.status === 401) {
            toast.error("Your session has expired. Please login again.");
            localStorage.removeItem('token');
            setLoading(false);
            return;
          }
          
          throw new Error(errorData.error || errorData.message || `Server returned ${response.status}`);
        }

        // تحليل البيانات المستلمة
        const data = await response.json();
        console.log('Received data:', data);

        // التحقق من وجود منشورات
        if (!data || data.length === 0) {
          toast.info("You haven't created any posts yet.");
          setPosts([]);
          return;
        }

        // معالجة المنشورات وإضافة قيم افتراضية للحقول المفقودة
        const processedPosts = data.map(post => ({
          ...post,
          post_id: post.post_id || post.id,
          title: post.title || "Untitled Post",
          description: post.description || "",
          attached_photo: post.attached_photo || null,
          features: Array.isArray(post.features) ? post.features : ["Other"],
          location: post.location || "Unknown",
          created_at: post.created_at ? new Date(post.created_at) : new Date()
        }));

        // تحديث حالة المنشورات وإظهار رسالة نجاح
        setPosts(processedPosts);
        toast.success(`Successfully loaded ${processedPosts.length} posts`);
      } catch (err) {
        // معالجة الأخطاء وعرض رسائل مناسبة للمستخدم
        console.error('Error fetching posts:', err);
        let errorMessage = "Error loading your posts";
        
        if (err.message.includes("Server Error")) {
          errorMessage = "Server is not responding. Please try again later.";
        } else if (err.message.includes("Failed to fetch")) {
          errorMessage = "Could not connect to the server. Please check your internet connection.";
        } else {
          errorMessage = err.message;
        }
        
        toast.error(errorMessage);
        setPosts([]);
      } finally {
        // إيقاف حالة التحميل بغض النظر عن نجاح أو فشل العملية
        setLoading(false);
      }
    };

    fetchUserPosts();
  }, []);

  /**
   * حذف منشور
   * @param {string} postId - معرف المنشور المراد حذفه
   */
  const handleDelete = async (postId) => {
    if (!postId) {
      toast.error("Invalid post ID");
      return;
    }

    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          toast.error("Please login to delete posts");
          return;
        }

        toast.info("Deleting post...");

        const response = await fetch(`http://localhost:5000/Posting/${postId}`, {
          method: 'DELETE',
          headers: { 
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}` 
          }
        });

        if (response.status === 401) {
          toast.error("Your session has expired. Please login again.");
          localStorage.removeItem('token');
          return;
        }

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to delete post');
        }

        // تحديث قائمة المنشورات بعد الحذف
        setPosts(posts.filter(post => post.post_id !== postId));
        toast.success("Post deleted successfully");
      } catch (err) {
        console.error('Error deleting post:', err);
        toast.error(err.message || "Error deleting post. Please try again.");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <section className="min-h-screen bg-gray-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-green-700 mb-6">
            My Posts
          </h1>
        </div>

        {!Array.isArray(posts) || posts.length === 0 ? (
          <div className="text-center py-8 bg-white rounded-lg shadow">
            <p className="text-gray-500 mb-4">You haven't created any posts yet.</p>
            <Link
              to="/create_post"
              className="inline-block px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-200 shadow-md"
            >
              Create Your First Post
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {posts.map(post => (
              <div key={post.post_id} className="bg-white shadow-md rounded-lg overflow-hidden">
                <div className="relative h-48">
                  {post.attached_photo ? (
                    <img
                      src={`data:image/jpeg;base64,${post.attached_photo}`}
                      alt={post.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">{post.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">{post.description}</p>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-500">
                      <span className="font-medium">Category:</span> {post.features?.[0] || "Other"}
                    </p>
                    <p className="text-sm text-gray-500">
                      <span className="font-medium">Location:</span> {post.location || "Unknown"}
                    </p>
                    <p className="text-sm text-gray-400">
                      <span className="font-medium">Posted:</span> {new Date(post.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="mt-4 flex justify-between items-center">
                    <Link
                      to={`/edit_post/${post.post_id}`}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-200"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(post.post_id)}
                      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition duration-200"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

