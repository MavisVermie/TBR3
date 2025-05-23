import React from "react";

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
          fill={star <= rating ? "gold" : "none"}
          viewBox="0 0 24 24"
          stroke="currentColor"
          className="w-6 h-6 text-yellow-500 hover:scale-110 transition-transform"
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

export default StarRating;