import React, { useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';
import ContactInfo from '../../components/contactInfo/contactInfo';
import LocationMap from '../../components/contactInfo/locationMap';

function CreatePostPage({ onPostCreated }) {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('');
  const [features, setFeatures] = useState(['']);

  const categoryOptions = [
    "Furniture",
    "Electronics",
    "Games",
    "Clothing",
    "Books",
    "Appliances",
    "Toys",
    "Tools",
    "Sports Equipment",
    "Food",
    "Other"
  ];

  const onDrop = useCallback((acceptedFiles) => {
    const validFiles = acceptedFiles.filter(file =>
      file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024
    );
    if (validFiles.length !== acceptedFiles.length) {
      toast.warning("Some files were rejected. Only images under 5MB are allowed.");
    }
    setImages(prev => [...prev, ...validFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.gif'] },
    maxSize: 5 * 1024 * 1024
  });

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!category) {
      toast.error("Please select a category");
      return;
    }

    if (images.length === 0) {
      toast.error("Please upload at least one image");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("features", JSON.stringify(features.filter(f => f.trim() !== '')));
    
    // إضافة الصور إلى النموذج
    if (images.length > 0) {
      formData.append("primary", images[0]); // الصورة الرئيسية
    }

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
        setCategory("");
        setEmail("");
        setPhone("");
        setLocation("");
        setUploadProgress(0);

        // التنقل إلى صفحة المنشور الجديد
        if (data.post_id) {
          navigate(`/posts/${data.post_id}`);
        } else {
          navigate('/'); // إذا لم يتم إرجاع معرف المنشور، انتقل إلى الصفحة الرئيسية
        }

        if (onPostCreated) onPostCreated();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Unable to create Item Post");
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

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
              className="block w-full border rounded-md py-2 px-3 shadow-sm focus:border-green-500 focus:ring-green-500"
            >
              <option value="" disabled>-- Select a Category --</option>
              {categoryOptions.map((option, index) => (
                <option key={index} value={option}>{option}</option>
              ))}
            </select>
          </div>

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

          <LocationMap onLocationSelect={setLocation} />
          {location && (
            <p className="text-sm text-gray-600">Selected Location: {location}</p>
          )}

          <ContactInfo email={email} setEmail={setEmail} phone={phone} setPhone={setPhone} />

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
