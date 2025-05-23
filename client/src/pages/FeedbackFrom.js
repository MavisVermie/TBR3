import React, { useState } from "react";
import axios from "axios";
import StarRating from "./StarRating"; // تأكدي من المسار الصحيح

const FeedbackForm = ({ donorId, onSubmitted }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      setError("Please provide a rating.");
      return;
    }

    try {
      setSubmitting(true);
      await axios.post("/api/feedback", {
        receiver_id: donorId,
        rating,
        comment,
      });

      setRating(0);
      setComment("");
      setError("");
      if (onSubmitted) onSubmitted();
    } catch (err) {
      setError("Failed to submit feedback.");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border rounded-xl shadow mt-4">
      <h2 className="text-lg font-bold mb-2">Leave Feedback</h2>

      {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

      <div className="mb-4">
        <p className="mb-1 font-medium">Rating:</p>
        <StarRating rating={rating} setRating={setRating} />
      </div>

      <label className="block mb-2">
        Comment:
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="w-full border p-2 rounded mt-1"
          placeholder="Write your thoughts..."
        ></textarea>
      </label>

      <button
        type="submit"
        disabled={submitting}
        className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        {submitting ? "Submitting..." : "Submit Feedback"}
      </button>
    </form>
  );
};

export default FeedbackForm;