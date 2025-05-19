import React, { useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { useDropzone } from 'react-dropzone'; // مكتبة لتحسين تجربة رفع الملفات
import { useNavigate } from 'react-router-dom'; // إضافة useNavigate للتنقل
import ContactInfo from '../../components/contactInfo/contactInfo';

function CreatePostPage({ onPostCreated }) {
  const navigate = useNavigate(); // تهيئة useNavigate
  // حالة النموذج
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState([]); // مصفوفة لتخزين الصور المختارة
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0); // تتبع تقدم الرفع
  const [features, setFeatures] = useState(['']); // مصفوفة لتخزين المواصفات

  // إضافة مواصفة جديدة
  const addFeature = () => {
    setFeatures([...features, '']);
  };

  // حذف مواصفة
  const removeFeature = (index) => {
    setFeatures(features.filter((_, i) => i !== index));
  };

  // تحديث قيمة مواصفة
  const updateFeature = (index, value) => {
    const newFeatures = [...features];
    newFeatures[index] = value;
    setFeatures(newFeatures);
  };

  // معالج سحب وإفلات الصور
  const onDrop = useCallback((acceptedFiles) => {
    // التحقق من نوع وحجم الملفات
    const validFiles = acceptedFiles.filter(file => 
      file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024 // حد أقصى 5 ميجابايت
    );

    if (validFiles.length !== acceptedFiles.length) {
      toast.warning("Some files were rejected. Only images under 5MB are allowed.");
    }

    setImages(prev => [...prev, ...validFiles]);
  }, []);

  // إعداد منطقة السحب والإفلات
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif'] // أنواع الملفات المسموح بها
    },
    maxSize: 5 * 1024 * 1024 // 5 ميجابايت
  });

  // حذف صورة من المصفوفة
  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  // معالج إرسال النموذج
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (images.length === 0) {
      toast.error("Please upload at least one image");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("features", JSON.stringify(features.filter(f => f.trim() !== ''))); // إضافة المواصفات
    
    // إضافة جميع الصور إلى النموذج
    images.forEach((image, index) => {
      formData.append("images", image);
    });

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const response = await fetch("http://localhost:5000/create_post", {
        method: "POST",
        headers: {
          jwt_token: localStorage.getItem("token"),
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        toast.success("Created Item Post Successfully");
        
        // إعادة تعيين النموذج
        setTitle("");
        setDescription("");
        setImages([]);
        setFeatures(['']);
        setUploadProgress(0);

        // التنقل إلى صفحة المنشور الجديد
        if (data.post_id) {
          navigate(`/posts/${data.post_id}`);
        } else {
          navigate('/'); // إذا لم يتم إرجاع معرف المنشور، انتقل إلى الصفحة الرئيسية
        }

        if (onPostCreated) onPostCreated();
      } else {
        toast.error("Unable to create Item Post");
      }
    } catch (err) {
      console.error(err.message);
      toast.error("An error occurred");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex justify-center items-start min-h-screen bg-gray-100 pt-20">
      <div className="container mx-auto p-6 max-w-2xl bg-white shadow-md rounded-lg mt-12">
        <h1 className="text-2xl font-bold text-center mb-6">Create a New Post</h1>

        {/* شريط تقدم الرفع */}
        {isUploading && (
          <div className="mb-4">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-green-600 h-2.5 rounded-full" 
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <p className="text-center text-sm text-gray-600 mt-2">Uploading... {uploadProgress}%</p>
          </div>
        )}

        <form onSubmit={handleSubmit} encType="multipart/form-data" className="space-y-4">
          {/* حقل العنوان */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title:</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="mt-1 block w-full border rounded-md py-2 px-3 shadow-sm"
            />
          </div>

          {/* حقل الوصف */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description:</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={4}
              className="mt-1 block w-full border rounded-md py-2 px-3 shadow-sm"
            />
          </div>

          {/* منطقة رفع الصور */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Images:</label>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
                ${isDragActive ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-green-500'}`}
            >
              <input {...getInputProps()} />
              {isDragActive ? (
                <p className="text-green-600">Drop the images here...</p>
              ) : (
                <div>
                  <p className="text-gray-600">Drag & drop images here, or click to select files</p>
                  <p className="text-sm text-gray-500 mt-1">Supported formats: JPEG, PNG, GIF (max 5MB each)</p>
                </div>
              )}
            </div>
          </div>

          {/* معاينة الصور */}
          {images.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
              {images.map((image, index) => (
                <div key={index} className="relative group">
                  <img
                    src={URL.createObjectURL(image)}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* حقل المواصفات */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Features:</label>
            {features.map((feature, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={feature}
                  onChange={(e) => updateFeature(index, e.target.value)}
                  placeholder="Enter a feature"
                  className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                />
                <button
                  type="button"
                  onClick={() => removeFeature(index)}
                  className="px-3 py-2 text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addFeature}
              className="mt-2 text-sm text-green-600 hover:text-green-800"
            >
              + Add Feature
            </button>
          </div>
          {/*  ادخل على ال component --> contactInfo --> */}
          <ContactInfo/>
          {/* زر الإرسال */}
          <button
            type="submit"
            disabled={isUploading || images.length === 0}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? 'Uploading...' : 'Create Post'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreatePostPage;