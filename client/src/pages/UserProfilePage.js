import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const StarRating = ({ rating, setRating }) => {
  const handleClick = (value) => {
    if (setRating) setRating(value);
  };

  return (
    <div className="flex space-x-1 cursor-pointer">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          onClick={() => handleClick(star)}
          xmlns="http://www.w3.org/2000/svg"
          fill={star <= rating ? "#facc15" : "none"}
          viewBox="0 0 24 24"
          stroke="currentColor"
          className="w-6 h-6 text-yellow-500 hover:scale-125 transition-transform duration-300 hover:text-yellow-400"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l2.065 6.34a1 1 0 00.95.69h6.634c.969 0 1.371 1.24.588 1.81l-5.37 3.886a1 1 0 00-.364 1.118l2.065 6.34c.3.921-.755 1.688-1.538 1.118l-5.37-3.887a1 1 0 00-1.176 0l-5.37 3.887c-.783.57-1.838-.197-1.538-1.118l2.065-6.34a1 1 0 00-.364-1.118L2.812 11.767c-.783-.57-.38-1.81.588-1.81h6.634a1 1 0 00.95-.69l2.065-6.34z"
          />
        </svg>
      ))}
    </div>
  );
};

const UserProfilePage = () => {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setCurrentUserId(decoded.userId);
      } catch (err) {
        console.error("Invalid token:", err);
      }
    }
  }, [token]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`/api/users/${userId}`);
        setUser(res.data);
      } catch (err) {
        setError("Failed to fetch user data");
      }
    };

    const fetchFeedback = async () => {
      try {
        const res = await axios.get(`/api/feedback/${userId}`);
        setFeedbacks(res.data.feedbacks);
        setAverageRating(res.data.average_rating);
      } catch (err) {
        console.error("Error fetching feedback:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
    fetchFeedback();
  }, [userId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");
    if (!token || rating === 0) {
      setSubmitError("Please login to provide a rating.");
      return;
    }

    try {
      setSubmitting(true);
      await axios.post(
        "/api/feedback",
        { receiver_id: userId, rating, comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Feedback submitted successfully!");
      setRating(0);
      setComment("");
      setTimeout(() => window.location.reload(), 1500);
    } catch (err) {
      if (
        err.response?.status === 400 &&
        err.response.data.message === "You already submitted feedback for this user."
      ) {
        setSubmitError("You already submitted feedback.");
      } else {
        setSubmitError("Failed to submit feedback.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`/api/feedback/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.info("Feedback deleted.");
      setTimeout(() => window.location.reload(), 1500);
    } catch (err) {
      setSubmitError("Failed to delete feedback.");
    }
  };

  if (loading)
    return <div className="p-6 animate-pulse text-gray-500">Loading profile...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!user) return <div className="p-6">No user data available.</div>;

  return (
    <div className="max-w-3xl mx-auto p-6 animate-fadeIn">
      <ToastContainer />
      <h1 className="text-3xl font-bold mb-6 text-green-700">User Profile</h1>
      <div className="mb-6 border p-6 rounded-xl shadow bg-white transition-transform hover:scale-[1.01]">
        <p className="text-lg"><strong>Username:</strong> {user.username}</p>
        <p className="text-lg"><strong>Email:</strong> {user.email}</p>
      </div>

      <div className="p-6 border rounded-xl shadow bg-white mb-6 transition-transform hover:scale-[1.01]">
        <h2 className="text-2xl font-bold mb-4">Feedback</h2>
        <p className="mb-4 text-gray-700">Average Rating: <strong>{averageRating}</strong> / 5</p>

        {feedbacks.length === 0 ? (
          <p className="text-gray-500 italic">No feedback yet.</p>
        ) : (
          <ul className="space-y-3">
            {feedbacks.map((f, index) => (
              <li key={index} className="border p-4 rounded-xl bg-gray-50 relative transition-transform hover:scale-[1.01]">
                <strong>{f.giver_username}</strong>: {f.rating} / 5
                <p className="text-sm text-gray-600 mt-1">{f.comment}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(f.created_at).toLocaleDateString()}
                </p>
                {f.giver_id === currentUserId && (
                  <button
                    onClick={handleDelete}
                    className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm"
                  >
                    Delete
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="p-6 border rounded-xl shadow bg-white mt-4 transition-transform hover:scale-[1.01]">
        <h2 className="text-xl font-bold mb-3">Leave Feedback</h2>
        {submitError && <p className="text-red-500 text-sm mb-2">{submitError}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <p className="mb-1 font-medium">Rating:</p>
            <StarRating rating={rating} setRating={setRating} />
          </div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full border p-2 rounded"
            placeholder="Write your thoughts..."
          ></textarea>
          <button
            type="submit"
            disabled={submitting}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition shadow"
          >
            {submitting ? "Submitting..." : "Submit Feedback"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UserProfilePage;
