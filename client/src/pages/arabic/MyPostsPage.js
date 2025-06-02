import React, { useEffect, useState } from "react";
import axios from "axios";

const MyPostsPage = () => {
  const [myPosts, setMyPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyPosts = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/Posting/my-posts`, {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        });

        setMyPosts(res.data);
        setLoading(false);
      } catch (err) {
        console.error("خطأ في جلب المنشورات:", err.message);
        setLoading(false);
      }
    };

    fetchMyPosts();
  }, []);

  const handleDelete = async (postId) => {
    if (!window.confirm("هل أنت متأكد أنك تريد حذف هذا المنشور؟")) return;
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/Posting/delete-post/${postId}`, {
        headers: { Authorization: "Bearer " + localStorage.getItem("token") },
      });
      setMyPosts(myPosts.filter((post) => post.post_id !== postId));
    } catch (err) {
      alert("فشل في حذف المنشور.");
      console.error("خطأ في الحذف:", err.message);
    }
  };

  if (loading) return <div className="text-center py-10">جاري التحميل...</div>;

  return (
    <section className="bg-gray-100 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h2 className="text-4xl font-semibold mb-6 text-center text-green-500">منشوراتي</h2>

        {myPosts.length === 0 ? (
          <div className="flex items-center justify-center min-h-40">
            <p className="text-center text-red-600 font-bold text-4xl font-sans">لم تقم بنشر أي شيء بعد.</p>
          </div>
        ) : (
          <div className="flex flex-wrap -mx-3">
            {myPosts.map((post) => (
              <div
                key={post.post_id}
                className="w-full sm:w-1/2 lg:w-1/3 px-3 mb-6"
              >
                <div className="rounded-lg p-4 shadow-2xl bg-white h-full flex flex-col">
                  {post.primary_photo && (
                    <img
                      src={`data:image/jpeg;base64,${post.primary_photo}`}
                      alt="المنشور"
                      className="w-full h-auto mb-3 rounded"
                    />
                  )}
                  <h3 className="text-xl font-semibold mb-2">{post.title}</h3>
                  <div className="mt-auto flex space-x-4">
                    <button
                      onClick={() => handleDelete(post.post_id)}
                      className="bg-red-600 text-white px-4 py-1 rounded hover:bg-red-700"
                    >
                      حذف
                    </button>
                    <a
                      href={`/ar/edit_post/${post.post_id}`}
                      className="bg-gray-700 text-white px-4 py-1 rounded hover:bg-blue-700"
                    >
                      تعديل
                    </a>
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

export default MyPostsPage;
