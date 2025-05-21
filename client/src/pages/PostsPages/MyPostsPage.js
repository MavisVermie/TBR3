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

  // Handler for deleting a post
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

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2>My Posts</h2>
      <div>
        {myPosts.length === 0 ? (
          <p>You haven't posted anything yet.</p>
        ) : (
          myPosts.map((post) => (
            <div key={post.post_id} style={{ border: "1px solid gray", margin: "10px", padding: "10px" }}>
              <h3>{post.title}</h3>
              {post.primary_photo && (
                <img
                 src={`data:image/jpeg;base64,${post.primary_photo}`}
                  alt="Post"
                  width="150"
                />
              )}
              <p>{post.description}</p>
              <p><strong>Location:</strong> {post.location}</p>
              <button onClick={() => handleDelete(post.post_id)} style={{marginRight: '10px', background: '#e74c3c', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px'}}>Delete</button>
              <a href={`/edit_post/${post.post_id}`} style={{background: '#2980b9', color: 'white', padding: '5px 10px', borderRadius: '4px', textDecoration: 'none'}}>Edit</a>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MyPostsPage;