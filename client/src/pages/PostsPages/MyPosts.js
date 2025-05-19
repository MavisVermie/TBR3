import React, { useState, useEffect } from "react";
import EditPost from "../postlist/EditPost";

const MyPosts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMyPosts = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/posts/user", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.token}`,
        },
      });

      const data = await res.json();
      if (Array.isArray(data)) {
        setPosts(data);
      } else {
        console.error("Unexpected response:", data);
        setPosts([]);
      }
    } catch (err) {
      console.error("Error fetching user's posts:", err.message);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const deletePost = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/posts/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.token}`,
        },
      });

      const data = await res.json();
      if (res.ok && data.message === "Post deleted") {
        fetchMyPosts();
      } else {
        alert(data.message || "Failed to delete post.");
      }
    } catch (err) {
      console.error(err.message);
    }
  };

  useEffect(() => {
    fetchMyPosts();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-10">
      <h2 className="text-3xl font-bold text-center mb-8 text-green-700">My Posts</h2>

      {loading ? (
        <div className="flex justify-center items-center h-48">
          <div className="w-12 h-12 border-4 border-green-500 border-dashed rounded-full animate-spin"></div>
        </div>
      ) : posts.length === 0 ? (
        <p className="text-center text-gray-600">No posts yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <div
              key={post.post_id}
              className="bg-white shadow-lg rounded-2xl overflow-hidden flex flex-col h-full"
            >
              {post.attached_photo && (
                <img
                  src={`data:image/*;base64,${post.attached_photo}`}
                  alt={post.title}
                  className="w-full h-48 object-cover"
                />
              )}

              <div className="p-4 flex flex-col justify-between flex-grow">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  {post.title}
                </h3>

                <div className="flex justify-between items-center mt-auto space-x-2">
                  <EditPost post={post} setPostsChange={fetchMyPosts} />
                  <button
                    onClick={() => deletePost(post.post_id)}
                    className="bg-red-600 text-white text-sm px-4 py-2 rounded-lg shadow hover:bg-red-700 transition"
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
  );
};

export default MyPosts;
