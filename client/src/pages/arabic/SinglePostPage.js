import React, { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./SinglePostPage.css";
import { jwtDecode } from 'jwt-decode';

/**
 * SinglePost Component
 * This component displays a single product post with its details, images, and contact information.
 * It includes features like image gallery with navigation, keyboard controls, and contact seller functionality.
 */

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;
const IMAGE_LOAD_TIMEOUT = 5000;

const loadImage = (base64String) => {
  return new Promise((resolve, reject) => {
    if (!base64String) {
      reject(new Error('بيانات الصورة غير صحيحة'));
      return;
    }

    const img = new Image();
    const timeoutId = setTimeout(() => {
      reject(new Error('انتهى وقت تحميل الصورة'));
    }, IMAGE_LOAD_TIMEOUT);

    img.onload = () => {
      clearTimeout(timeoutId);
      resolve(img);
    };

    img.onerror = () => {
      clearTimeout(timeoutId);
      reject(new Error('فشل تحميل الصورة'));
    };

    try {
      img.src = `data:image/jpeg;base64,${base64String}`;
    } catch (error) {
      clearTimeout(timeoutId);
      reject(new Error('صيغة الصورة غير صحيحة'));
    }
  });
};

const fetchWithRetry = async (url, options = {}, retries = MAX_RETRIES) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios({
      url,
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers
      },
      validateStatus: function (status) {
        return status >= 200 && status < 500;
      }
    });

    if (response.status === 401) {
      throw new Error('عدم السماح بالدخول');
    }

    if (response.status === 404) {
      throw new Error('المنشور غير موجود');
    }

    if (response.status >= 500) {
      throw new Error('خطأ في الخادم');
    }

    return response.data;
  } catch (error) {
    if (retries > 0 && error.message !== 'عدم السماح بالدخول') {
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return fetchWithRetry(url, options, retries - 1);
    }
    throw error;
  }
};

export default function ShowDataProduct() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [showContact, setShowContact] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadedImages, setLoadedImages] = useState({});
  const [cache, setCache] = useState({});
  const imageLoadQueue = useRef([]);
  const isProcessingQueue = useRef(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        console.log("Decoded token:", decoded)
        setCurrentUserId(decoded.userId);
        setIsAdmin(decoded.isAdmin);
      } catch (e) {
        console.error("فشل في فك تشفير التوكن", e);
      }
    }
  }, []);

  const processImageQueue = useCallback(async () => {
    if (isProcessingQueue.current || imageLoadQueue.current.length === 0) return;

    isProcessingQueue.current = true;
    const imageToLoad = imageLoadQueue.current.shift();

    try {
      await loadImage(imageToLoad.base64);
      setLoadedImages(prev => ({
        ...prev,
        [imageToLoad.id]: true
      }));
    } catch (error) {
      console.error('خطأ في تحميل الصورة', error);
    }

    isProcessingQueue.current = false;
    processImageQueue();
  }, []);

  const fetchPost = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (!id) {
        throw new Error('معرف المنشور غير صالح');
      }

      if (cache[id]) {
        setPost(cache[id]);
        setIsLoading(false);
        return;
      }

      const data = await fetchWithRetry(`http://localhost:5000/Posting/posts/${id}`);

      if (!data || typeof data !== 'object') {
        throw new Error('صيغة الاستجابة غير صحيحة');
      }

      setCache(prev => ({
        ...prev,
        [id]: data
      }));

      setPost(data);

      if (data.primary_photo) {
        imageLoadQueue.current.push({
          id: 'primary',
          base64: data.primary_photo
        });
      }

      if (data.extra_images?.length) {
        data.extra_images.forEach((img, index) => {
          if (img) {
            imageLoadQueue.current.push({
              id: `extra_${index}`,
              base64: img
            });
          }
        });
      }

      processImageQueue();
    } catch (error) {
      console.error("خطأ في جلب المنشور", error);
      let errorMessage = "فشل في تحميل المنشور ";

      if (error.message === 'عدم السماح بالدخول') {
        errorMessage += "يرجى تسجيل الدخول لعرض هذا المنشور";
        navigate('/login');
      } else if (error.message === 'المنشور غير موجود') {
        errorMessage += "المنشور الذي تبحث عنه غير موجود";
        navigate('/');
      } else if (error.message === 'خطأ في الخادم') {
        errorMessage += "الخادم غير متاح حالياً. يرجى المحاولة لاحقاً";
      } else {
        errorMessage += "يرجى المحاولة مرة أخرى";
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [id, cache, processImageQueue, navigate]);

  useEffect(() => {
    fetchPost();
  }, [fetchPost]);

  const allImages = useMemo(() => {
    if (!post) return [];
    return [
      post.primary_photo,
      ...(post.extra_images || [])
    ].filter(Boolean);
  }, [post]);

  const handleImageClick = useCallback((index) => {
    setCurrentImageIndex(index);
  }, []);

  const handleNextImage = useCallback(() => {
    setCurrentImageIndex(prev => (prev + 1) % allImages.length);
  }, [allImages.length]);

  const handlePrevImage = useCallback(() => {
    setCurrentImageIndex(prev => (prev - 1 + allImages.length) % allImages.length);
  }, [allImages.length]);

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
  }, [handleNextImage, handlePrevImage]);

  const showEditButton = post && (
    String(currentUserId) === String(post.user_id)
  );

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 py-10 px-4 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">خطأ في تحميل المنشور</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-4">
            <button
              onClick={fetchPost}
              className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
            >
              حاول مرة أخرى
            </button>
            <button
              onClick={() => navigate('/')}
              className="w-full px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors duration-200"
            >
              العودة للرئيسية
            </button>
          </div>
        </div>
      </div>
    );
  }
}
 if (!post) return (
  <div className="min-h-screen bg-gray-100 py-10 px-4">
    <div className="max-w-7xl mx-auto">
      {/* Header Skeleton */}
      <div className="bg-white p-8 rounded-xl shadow-lg mb-8 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-3/4 mb-3"></div>
        <div className="flex items-center justify-between">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column Skeleton */}
        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="bg-gray-200 rounded-xl h-[500px] mb-4"></div>
            <div className="grid grid-cols-5 gap-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-gray-200 rounded-lg h-[120px]"></div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column Skeleton */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
            <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="space-y-6">
              <div>
                <div className="h-5 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
              <div>
                <div className="h-5 bg-gray-200 rounded w-1/3 mb-3"></div>
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-4 bg-gray-200 rounded w-full"></div>
                  ))}
                </div>
              </div>
              <div className="border-t pt-6">
                <div className="h-5 bg-gray-200 rounded w-1/3 mb-3"></div>
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="space-y-2">
                      <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="pt-4">
                <div className="h-12 bg-gray-200 rounded-lg w-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

return (
  <div className="min-h-screen bg-gray-100 py-10 px-4 font-mono">
    <div className="max-w-full mx-auto">
      {/* Header Section - Title and Basic Info */}
      <div className="bg-white/90 p-8 rounded-xl shadow-md mb-8">
        <h1 className="text-4xl font-semibold text-green-600 font-sans">{post.title}</h1>
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            نُشِر بواسطة <span className="font-semibold text-gray-800">{post.username}</span>
          </p>
          <p className="text-sm text-gray-500">
            :الموقع<span className="font-semibold text-gray-800">{post.location}</span>
          </p>
        </div>
        <div className="w-1/6">
          {showEditButton && (
            <button
              onClick={() => navigate(`/edit_post/${post.post_id}`)}
              className="w-full bg-red-600 text-white px-8 py-4 rounded-lg hover:bg-red-800
                transition text-lg font-semibold shadow-md mt-4"
            >
              تعديل الإعلان
            </button>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left Column - Image Gallery */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-lg">
            <div className="image-gallery">
              {/* Main Image Container with Navigation Arrows */}
              <div className="main-image-container mb-5 bg-white rounded-lg relative">
                {/* Previous Image Button */}
                <button
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition z-10"
                  onClick={handlePrevImage}
                  aria-label="الصورة السابقة"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                {/* Main Image Display */}
                <div className="flex items-center justify-center p-4">
                  {allImages[currentImageIndex] && (
                    <img
                      src={`data:image/jpeg;base64,${allImages[currentImageIndex]}`}
                      alt="الصورة الرئيسية"
                      className={`max-w-full max-h-[500px] w-auto h-auto object-contain rounded-sm transition-opacity duration-300 ${
                        loadedImages[`extra_${currentImageIndex}`] ? 'opacity-100' : 'opacity-0'
                      }`}
                      loading="lazy"
                      onLoad={(e) => {
                        setLoadedImages(prev => ({
                          ...prev,
                          [`extra_${currentImageIndex}`]: true
                        }));
                      }}
                    />
                  )}
                </div>

                {/* Next Image Button */}
                <button
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition z-10"
                  onClick={handleNextImage}
                  aria-label="الصورة التالية"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              {/* Thumbnail Gallery - Shows all available images */}
              {allImages.length > 1 && (
                <div className="thumbnail-gallery mt-4 p-5">
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
                          alt={`مصغرة الصورة ${idx + 1}`}
                          className={`max-w-full max-h-full w-auto h-auto object-contain transition-all duration-300 ${
                            loadedImages[`extra_${idx}`] ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                          }`}
                          loading="lazy"
                          onLoad={(e) => {
                            setLoadedImages(prev => ({
                              ...prev,
                              [`extra_${idx}`]: true
                            }));
                          }}
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
          <div className="bg-white p-6 rounded-l shadow-lg mb-8">
            <h2 className="text-xl font-semibold text-green-700 mb-4">تفاصيل المنتج</h2>

            <div className="space-y-6">
              {/* Product Description */}
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">الوصف</h3>
                <p className="text-gray-700 leading-relaxed">{post.description}</p>
              </div>

              {/* Product Features */}
              {post.features && post.features.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-3">المميزات</h3>
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
                <h3 className="text-lg font-semibold text-red-600 mb-3">معلومات الاتصال</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">البريد الإلكتروني</p>
                    <p className="text-gray-800 font-medium">{post.email}</p>
                  </div>
                  {post.phone_number && (
                    <div>
                      <p className="text-sm text-gray-500">رقم الهاتف</p>
                      <p className="text-gray-800 font-medium">{post.phone_number}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-500">الموقع</p>
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
                  التواصل مع البائع
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
            <h2 className="text-2xl font-bold text-green-700 mb-6">معلومات الاتصال</h2>

            {/* Email Section */}
            <div className="mb-6">
              <p className="text-gray-800 font-medium mb-2">البريد الإلكتروني:</p>
              <a
                href={`mailto:${post.email}`}
                className="text-blue-600 underline break-words hover:text-blue-800"
              >
                {post.email}
              </a>
            </div>

            {/* Phone Number Section */}
            {post.phone_number && (
              <div className="mb-6">
                <p className="text-gray-800 font-medium mb-2">رقم الواتساب:</p>
                <a
                  href={`https://wa.me/${post.phone_number}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-600 underline hover:text-green-800"
                >
                  {post.phone_number}
                </a>
              </div>
            )}

            <button
              onClick={() => setShowContact(false)}
              className="mt-6 w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-lg shadow-md transition"
            >
              إغلاق
            </button>
          </div>
        </div>
      )}
    </div>
  </div>
);


