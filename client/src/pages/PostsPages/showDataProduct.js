import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "./showDataProduct.css";

/**
 * SinglePost Component
 * This component displays a single product post with its details, images, and contact information.
 * It includes features like image gallery with navigation, keyboard controls, and contact seller functionality.
 */
export default function ShowDataProduct() {
  // Get the post ID from URL parameters
  const { id } = useParams();
  
  // State management
  const [post, setPost] = useState(null); // Stores the post data
  const [showContact, setShowContact] = useState(false); // Controls contact popup visibility
  const [selectedImage, setSelectedImage] = useState(null); // Currently selected image for full view
  const [currentImageIndex, setCurrentImageIndex] = useState(0); // Index of currently displayed image

  // Fetch post data when component mounts
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

  // Add keyboard navigation for images
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') {
        handleNextImage();
      } else if (e.key === 'ArrowLeft') {
        handlePrevImage();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentImageIndex]);

  // Combine primary and extra images into a single array
  const allImages = post ? [
    post.primary_photo,
    ...(post.extra_images || [])
  ].filter(Boolean) : [];

  // Image navigation handlers
  const handleImageClick = (index) => {
    setCurrentImageIndex(index);
  };

  const handleNextImage = () => {
    const nextIndex = (currentImageIndex + 1) % allImages.length;
    setCurrentImageIndex(nextIndex);
  };

  const handlePrevImage = () => {
    const prevIndex = (currentImageIndex - 1 + allImages.length) % allImages.length;
    setCurrentImageIndex(prevIndex);
  };

  // Show loading state while fetching data
  if (!post) return <div className="text-center mt-10">Loading post...</div>;

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header Section - Title and Basic Info */}
        <div className="bg-white p-8 rounded-xl shadow-lg mb-8">
          <h1 className="text-4xl font-bold text-green-700 mb-3">{post.title}</h1>
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Posted by <span className="font-semibold text-gray-800">{post.username}</span>
            </p>
            <p className="text-sm text-gray-500">
              Location: <span className="font-semibold text-gray-800">{post.location}</span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Image Gallery */}
          <div className="lg:col-span-2">
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Product Images</h2>
              
              {/* Main Image Gallery with Navigation */}
              <div className="image-gallery">
                {/* Main Image Container with Navigation Arrows */}
                <div className="main-image-container mb-4 bg-gray-100 rounded-xl relative">
                  {/* Previous Image Button */}
                  <button
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition z-10"
                    onClick={handlePrevImage}
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>

                  {/* Main Image Display */}
                  <div className="flex items-center justify-center p-4">
                    <img
                      src={`data:image/jpeg;base64,${allImages[currentImageIndex]}`}
                      alt="Main"
                      className="max-w-full max-h-[500px] w-auto h-auto object-contain rounded-xl shadow-md"
                    />
                  </div>

                  {/* Next Image Button */}
                  <button
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition z-10"
                    onClick={handleNextImage}
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>

                {/* Thumbnail Gallery - Shows all available images */}
                {allImages.length > 1 && (
                  <div className="thumbnail-gallery mt-4">
                    <div className="grid grid-cols-5 gap-3">
                      {allImages.map((img, idx) => (
                        <div
                          key={idx}
                          className={`thumbnail-container relative w-[120px] h-[120px] cursor-pointer rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center ${
                            currentImageIndex === idx ? 'ring-2 ring-green-500' : 'hover:ring-2 hover:ring-green-300'
                          }`}
                          onClick={() => handleImageClick(idx)}
                        >
                          <img
                            src={`data:image/jpeg;base64,${img}`}
                            alt={`Thumbnail ${idx + 1}`}
                            className="max-w-full max-h-full w-auto h-auto object-contain transition-transform duration-300 hover:scale-110"
                          />
                          {/* Selected Image Indicator */}
                          {currentImageIndex === idx && (
                            <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Product Details */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Product Details</h2>
              <div className="space-y-6">
                {/* Product Description */}
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">Description</h3>
                  <p className="text-gray-700 leading-relaxed">{post.description}</p>
                </div>

                {/* Product Features */}
                {post.features && post.features.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-800 mb-3">Features</h3>
                    <ul className="space-y-3">
                      {post.features.map((feature, index) => (
                        <li key={index} className="flex items-start text-gray-700">
                          <svg className="w-6 h-6 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Contact Information */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-medium text-gray-800 mb-3">Contact Information</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="text-gray-800 font-medium">{post.email}</p>
                    </div>
                    {post.phone_number && (
                      <div>
                        <p className="text-sm text-gray-500">Phone Number</p>
                        <p className="text-gray-800 font-medium">{post.phone_number}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-gray-500">Location</p>
                      <p className="text-gray-800 font-medium">{post.location}</p>
                    </div>
                  </div>
                </div>

                {/* Contact Seller Button */}
                <div className="pt-4">
                  <button
                    onClick={() => setShowContact(true)}
                    className="w-full bg-green-600 text-white px-8 py-4 rounded-lg hover:bg-green-700 transition text-lg font-semibold shadow-md"
                  >
                    Contact Seller
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Popup Modal */}
        {showContact && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-8 rounded-xl shadow-xl text-center w-96">
              <h2 className="text-2xl font-bold text-green-700 mb-6">Contact Information</h2>

              {/* Email Section */}
              <div className="mb-6">
                <p className="text-gray-800 font-medium mb-2">Email:</p>
                <a
                  href={`mailto:${post.email}`}
                  className="text-blue-600 underline break-words hover:text-blue-800"
                >
                  {post.email}
                </a>
              </div>

              {/* Phone Number Section */}
              <div className="mb-6">
                <p className="text-gray-800 font-medium mb-2">Phone Number:</p>
                <p className="text-gray-700 mb-3">{post.phone_number || "Not provided"}</p>

                {/* WhatsApp Button */}
                {post.phone_number && (
                  <a
                    href={`https://wa.me/${post.phone_number.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center px-6 py-3 bg-green-500 text-white rounded-lg shadow hover:bg-green-600 transition w-full"
                  >
                    <svg
                      className="w-6 h-6 mr-2"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M20.52 3.48a11.9 11.9 0 0 0-16.86 0 11.9 11.9 0 0 0-2.65 13.07L.3 23.7l7.32-1.92a11.91 11.91 0 0 0 5.9 1.54 11.9 11.9 0 0 0 8.4-20.84zM12 21.48a9.39 9.39 0 0 1-4.77-1.3l-.34-.2-4.34 1.14 1.15-4.22-.22-.35a9.38 9.38 0 1 1 8.52 4.93zm5.26-7.32c-.28-.14-1.67-.82-1.92-.91-.26-.1-.45-.14-.63.14s-.73.9-.9 1.1c-.16.18-.33.2-.6.07-.28-.14-1.18-.44-2.25-1.4-.83-.74-1.39-1.65-1.55-1.92-.16-.28-.02-.43.12-.57.12-.12.28-.3.41-.45.14-.16.18-.28.28-.46.1-.18.05-.35-.02-.49-.07-.14-.63-1.5-.87-2.05-.23-.56-.47-.48-.63-.49h-.54c-.18 0-.46.06-.7.3s-.91.9-.91 2.2c0 1.3.94 2.55 1.07 2.73.14.18 1.85 2.83 4.48 3.96.63.27 1.12.43 1.5.55.63.2 1.2.17 1.66.1.51-.08 1.67-.68 1.9-1.34.23-.65.23-1.2.16-1.34-.08-.14-.26-.2-.54-.34z" />
                    </svg>
                    Chat on WhatsApp
                  </a>
                )}
              </div>

              {/* Close Button */}
              <button
                onClick={() => setShowContact(false)}
                className="mt-4 px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition w-full"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
