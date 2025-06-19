import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

function AdminFlaggedPosts() {
  const [flaggedPosts, setFlaggedPosts] = useState([]);

  const fetchFlaggedPosts = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/admin/flagged-posts`, {
        headers: { jwt_token: localStorage.getItem("token") },
      });
      const data = await res.json();
      setFlaggedPosts(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load flagged posts");
    }
  };

  const handleApprove = async (postId) => {
    try {
      await fetch(`${process.env.REACT_APP_API_URL}/admin/posts/${postId}/approve`, {
        method: "PUT",
        headers: { jwt_token: localStorage.getItem("token") },
      });
      toast.success("Post approved");
      fetchFlaggedPosts();
    } catch {
      toast.error("Failed to approve post");
    }
  };

  const handleReject = async (postId) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try {
      await fetch(`${process.env.REACT_APP_API_URL}/admin/posts/${postId}`, {
        method: "DELETE",
        headers: { jwt_token: localStorage.getItem("token") },
      });
      toast.success("Post deleted");
      fetchFlaggedPosts();
    } catch {
      toast.error("Failed to delete post");
    }
  };

  useEffect(() => {
    fetchFlaggedPosts();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Flagged Posts for Review</h2>
      {flaggedPosts.length === 0 ? (
        <p>No flagged posts.</p>
      ) : (
        <div className="space-y-6">
          {flaggedPosts.map(post => (
            <div key={post.post_id} className="bg-white p-4 rounded shadow-md flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">{post.title}</h3>
                <p className="text-sm text-gray-600">By: {post.username} ({post.email})</p>
                <p className="text-sm text-gray-500 mt-1">{post.description?.slice(0, 100)}...</p>
              </div>
              <div className="flex items-center gap-3">
                {post.primary_image_url && (
                  <img src={post.primary_image_url} alt="Post" className="w-24 h-24 object-cover rounded" />
                )}
                <div className="flex flex-col gap-2">
                  <button onClick={() => handleApprove(post.post_id)} className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700">
                    Approve
                  </button>
                  <button onClick={() => handleReject(post.post_id)} className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700">
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminFlaggedPosts;
