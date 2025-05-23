import React, { useEffect, useState } from "react";
import axios from "axios";

const MyPostsPage = () => {
  const [myPosts, setMyPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyPosts = async () => {
      try {
        const res = await axios.get("http://localhost:5000/Posting/my-posts", {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        });

        setMyPosts(res.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching my posts:", err.message);
        setLoading(false);
      }
    };

    fetchMyPosts();
  }, []);

  const handleDelete = async (postId) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try {
      await axios.delete(`http://localhost:5000/Posting/delete-post/${postId}`, {
        headers: { Authorization: "Bearer " + localStorage.getItem("token") },
      });
      setMyPosts(myPosts.filter((post) => post.post_id !== postId));
    } catch (err) {
      alert("Failed to delete post.");
      console.error("Delete error:", err.message);
    }
  };

  if (loading) return <div className="text-center py-10">loading...</div>;

  return (
    <section className="bg-gray-100 min-h-screen">
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h2 className="text-4xl font-semibold mb-6 text-center text-green-500">My Posts</h2>
     
      {myPosts.length === 0 ? (
      <div className=" flex items-center justify-center min-h-40"> 
        <p className="text-center text-red-600 text-bold text-4xl font-sans">You haven't posted anything yet.</p></div>
      ) : (
        <div className="flex flex-wrap -mx-3">
          {myPosts.map((post) => (
            <div
              key={post.post_id}
              className="w-full sm:w-1/2 lg:w-1/3 px-3 mb-6"
            >
              <div className=" rounded-lg p-4 shadow-2xl bg-white h-full flex flex-col">
               
                {post.primary_photo && (
                  <img
                    src={`data:image/jpeg;base64,${post.primary_photo}`}
                    alt="Post"
                    className="w-full h-auto mb-3 rounded"
                  />
                )} 
                <h3 className="text-xl font-semibold mb-2">{post.title}</h3>
                <div className="mt-auto flex space-x-4">
                  <button
                    onClick={() => handleDelete(post.post_id)}
                    className="bg-red-600 text-white px-4 py-1 rounded hover:bg-red-700"
                  >
                    Delete
                  </button>
                  <a
                    href={`/edit_post/${post.post_id}`}
                    className="bg-gray-700 text-white px-4 py-1 rounded hover:bg-blue-700"
                  >
                    Edit
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div></section>
  );
};

export default MyPostsPage;
