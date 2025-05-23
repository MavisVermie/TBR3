import React, { useEffect, useState } from "react";
import axios from "axios";

const UserFeedback = ({ userId }) => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const res = await axios.get(`/api/feedback/${userId}`);
        setFeedbacks(res.data.feedbacks);
        setAverageRating(res.data.average_rating);
      } catch (err) {
        console.error("Error fetching feedback", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeedback();
  }, [userId]);

  if (loading) return <p>Loading feedback...</p>;

  return (
    <div className="p-4 border rounded-xl shadow">
      <h2 className="text-xl font-bold mb-2">User Feedback</h2>
      <p className="mb-4">Average Rating: {averageRating} / 5</p>

      {feedbacks.length === 0 ? (
        <p>No feedback yet.</p>
      ) : (
        <ul className="space-y-2">
          {feedbacks.map((f, index) => (
            <li key={index} className="border p-2 rounded">
              <strong>{f.giver_username}</strong>: {f.rating} / 5
              <p className="text-sm text-gray-600">{f.comment}</p>
              <p className="text-xs text-gray-400">{new Date(f.created_at).toLocaleDateString()}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default UserFeedback;