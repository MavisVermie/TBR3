import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

export default function SinglePost() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [showContact, setShowContact] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null); // ✅ for full-screen image preview

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/Posting/posts/${id}`);
        setPost(res.data);
      } catch (error) {
        console.error("Error fetching post:", error);
      }
    };
    fetchPost();
  }, [id]);

  if (!post) return <div className="text-center mt-10">Loading post...</div>;

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4 flex justify-center">
      <div className="bg-white p-6 rounded-xl shadow-lg max-w-4xl w-full">
        <h1 className="text-3xl font-bold text-green-700 mb-2">{post.title}</h1>
        <p className="text-sm text-gray-500 mb-6">
          Made by <span className="font-semibold text-gray-800">{post.username}</span>
        </p>
        <p className="mb-6 text-gray-700">{post.description}</p>

        {/* Primary Image */}
        {post.primary_photo && (
          <img
            src={`data:image/jpeg;base64,${post.primary_photo}`}
            alt="Primary"
            className="w-full rounded-xl mb-6 cursor-pointer hover:opacity-90 transition"
            onClick={() => setSelectedImage(`data:image/jpeg;base64,${post.primary_photo}`)}
          />
        )}

        {/* Secondary Images */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {post.extra_images.map((img, idx) => (
            <img
              key={idx}
              src={`data:image/jpeg;base64,${img}`}
              alt={`Extra ${idx + 1}`}
              className="rounded-lg cursor-pointer hover:opacity-80"
              onClick={() => setSelectedImage(`data:image/jpeg;base64,${img}`)}
            />
          ))}
        </div>

        {/* Contact Button */}
        <div className="mt-10 text-center">
          <button
            onClick={() => setShowContact(true)}
            className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition"
          >
            CONTACT
          </button>
        </div>

        {/* Contact Popup */}
{showContact && (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
    <div className="bg-white p-6 rounded-xl shadow-xl text-center w-80">
      <h2 className="text-xl font-bold text-green-700 mb-4">Contact Info</h2>

      <div className="mb-4">
        <p className="text-gray-800 font-medium">Email:</p>
        <a
          href={`mailto:${post.email}`}
          className="text-blue-600 underline break-words"
        >
          {post.email}
        </a>
      </div>

      <div className="mb-4">
        <p className="text-gray-800 font-medium">Phone Number:</p>
        <p className="text-gray-700">{post.phone_number || "Not provided"}</p>

        {post.phone_number && (
          <a
            href={`https://wa.me/${post.phone_number.replace(/[^0-9]/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center mt-2 px-4 py-2 bg-green-500 text-white rounded-lg shadow hover:bg-green-600 transition"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M20.52 3.48a11.9 11.9 0 0 0-16.86 0 11.9 11.9 0 0 0-2.65 13.07L.3 23.7l7.32-1.92a11.91 11.91 0 0 0 5.9 1.54 11.9 11.9 0 0 0 8.4-20.84zM12 21.48a9.39 9.39 0 0 1-4.77-1.3l-.34-.2-4.34 1.14 1.15-4.22-.22-.35a9.38 9.38 0 1 1 8.52 4.93zm5.26-7.32c-.28-.14-1.67-.82-1.92-.91-.26-.1-.45-.14-.63.14s-.73.9-.9 1.1c-.16.18-.33.2-.6.07-.28-.14-1.18-.44-2.25-1.4-.83-.74-1.39-1.65-1.55-1.92-.16-.28-.02-.43.12-.57.12-.12.28-.3.41-.45.14-.16.18-.28.28-.46.1-.18.05-.35-.02-.49-.07-.14-.63-1.5-.87-2.05-.23-.56-.47-.48-.63-.49h-.54c-.18 0-.46.06-.7.3s-.91.9-.91 2.2c0 1.3.94 2.55 1.07 2.73.14.18 1.85 2.83 4.48 3.96.63.27 1.12.43 1.5.55.63.2 1.2.17 1.66.1.51-.08 1.67-.68 1.9-1.34.23-.65.23-1.2.16-1.34-.08-.14-.26-.2-.54-.34z" />
            </svg>
            Chat on WhatsApp
          </a>
        )}
      </div>

      <button
        onClick={() => setShowContact(false)}
        className="mt-6 px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition"
      >
        Close
      </button>
    </div>
  </div>
)}


        {/* Full Image Modal */}
        {selectedImage && (
          <div
            className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center"
            onClick={() => setSelectedImage(null)}
          >
            <img
              src={selectedImage}
              alt="Full View"
              className="max-h-[90vh] max-w-[90vw] rounded-xl shadow-2xl"
            />
          </div>
        )}
      </div>
    </div>
  );
}
