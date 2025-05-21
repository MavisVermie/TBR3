import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useDropzone } from 'react-dropzone';
import { jwtDecode } from 'jwt-decode';
import ContactInfo from '../../components/contactInfo/contactInfo';
import LocationMap from '../../components/contactInfo/locationMap';

function EditPostPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [features, setFeatures] = useState(['']);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [initialLocation, setInitialLocation] = useState('');
  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [deletedExistingImages, setDeletedExistingImages] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  // 🔐 User ownership check
  const [currentUserId, setCurrentUserId] = useState(null);
  const [postOwnerId, setPostOwnerId] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const categoryOptions = [
    "أثاث", "إلكترونيات", "ألعاب", "ملابس", "كتب",
    "أجهزة منزلية", "ألعاب", "أدوات", "معدات رياضية", "طعام", "أخرى"
  ];

  // 🔐 Decode user info from token
  useEffect(() => {
    if (token) {
      try {
const decoded = jwtDecode(token);
        setCurrentUserId(decoded.userId);
        setIsAdmin(decoded.isAdmin);
      } catch (e) {
        console.error("Failed to decode token", e);
      }
    }
  }, [token]);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await fetch(`http://localhost:5000/Posting/posts/${id}`);
        const data = await res.json();

        if (res.ok && data) {

          setTitle(data.title || '');
          setDescription(data.description || '');
          setEmail(data.email || '');
          setPhone(data.phone_number || '');
          setLocation(data.location || '');
          setInitialLocation(data.location || '');
          setPostOwnerId(data.user_id); // 🔐 set post owner ID

          const parsedFeatures = data.features || [];

          const fetchedCategory = (parsedFeatures[0] || '').trim();
          if (categoryOptions.includes(fetchedCategory)) {
            setCategory(fetchedCategory);
          } else {
            setCategory('');
          }

          setFeatures(parsedFeatures.slice(1));

          const base64Images = [];
          if (data.primary_photo) base64Images.push(data.primary_photo);
          if (data.extra_images && Array.isArray(data.extra_images)) {
            base64Images.push(...data.extra_images);
          }
          setExistingImages(base64Images);
        } else {
          toast.error("Failed to load post");
          navigate('/');
        }
      } catch (error) {
        console.error("Error fetching post:", error);
        toast.error("Something went wrong");
        navigate('/');
      } finally {
        setLoadingData(false);
      }
    };

    fetchPost();
  }, [id, navigate]);

  const onDrop = useCallback((acceptedFiles) => {
    const validFiles = acceptedFiles.filter(file =>
      file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024
    );
    if (validFiles.length !== acceptedFiles.length) {
      toast.warning("تم رفض بعض الملفات. يُسمح فقط بالصور التي لا تتجاوز 5 ميجابايت.");
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
      toast.error("الرجاء اختيار فئة");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("email", email);
    formData.append("phone", phone);
    formData.append("location", location);
    const filteredFeatures = features.filter(f => f.trim() !== '');
    const allFeatures = [category, ...filteredFeatures];
    formData.append("features", JSON.stringify(allFeatures));

    images.forEach((img) => {
      formData.append("images", img);
    });

    formData.append("deletedImages", JSON.stringify(deletedExistingImages));

    setIsUploading(true);

    try {
      const response = await fetch(`http://localhost:5000/Posting/update-post/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        toast.success("تم تحديث المنشور بنجاح");
        navigate(`/posts/${id}`);
      } else {
        const errorText = await response.text();
        toast.error(errorText || "فشل تحديث المنشور");
      }
    } catch (err) {
      console.error("Submit Error:", err);
      toast.error("حدث خطأ أثناء تحديث المنشور.");
    } finally {
      setIsUploading(false);
    }
  };

  const isOwner = currentUserId === postOwnerId;

  return (
    <div className="w-full min-h-screen bg-gray-100 pt-5">
      <div className="container mx-auto bg-white p-6  w-2/3 shadow-md rounded-lg mt-5">
        <h1 className="text-4xl  text-red-700 font-semibold text-center mb-6">تعديل المنشور</h1>
        {loadingData ? (
          <p>جاري تحميل بيانات المنشور...</p>
        ) : !isOwner /* && !isAdmin */ ? ( // <-- Uncomment `&& !isAdmin` if you want admins to bypass
          <p className="text-red-600 text-center font-semibold">
            ❌ غير مصرح لك بتعديل هذا المنشور.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 ">
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required className="w-full border p-2 rounded " placeholder="العنوان" />

            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={5} required className="w-full border p-2 rounded resize-none " placeholder="الوصف"  />

            <select value={category} onChange={(e) => setCategory(e.target.value)} required className="w-full border p-2 rounded">
              <option value="" disabled>-- اختر فئة --</option>
              {categoryOptions.map((opt, i) => (
                <option key={i} value={opt}>{opt}</option>
              ))}
            </select>

            <div {...getRootProps()} className="border-dashed border-2 p-4 text-center rounded cursor-pointer text-slate-600">
              <input {...getInputProps()} />
              {isDragActive ? <p>اسحب الصور هنا...</p> : <p>انقر أو اسحب الصور للرفع (الحد الأقصى 5 ميجابايت لكل صورة)</p>}
            </div>

            {(existingImages.length > 0 || images.length > 0) && (
              <div className="grid grid-cols-3 gap-3">
                {existingImages.map((img, idx) => (
                  !deletedExistingImages.includes(idx) && (
                    <div key={`existing-${idx}`} className="relative">
                      <img src={`data:image/jpeg;base64,${img}`} alt={`existing-${idx}`} className="w-full h-24 object-cover rounded" />
                      <button
                        type="button"
                        onClick={() => setDeletedExistingImages(prev => [...prev, idx])}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                      >
                        ×
                      </button>
                    </div>
                  )
                ))}

                {images.map((img, idx) => (
                  <div key={`new-${idx}`} className="relative">
                    <img src={URL.createObjectURL(img)} alt={`img-${idx}`} className="w-full h-24 object-cover rounded" />
                    <button type="button" onClick={() => removeImage(idx)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1">×</button>
                  </div>
                ))}
              </div>
            )}

            <LocationMap onLocationSelect={setLocation} initialLocation={initialLocation} />
            {location && <p className="text-sm text-gray-600">الموقع المحدد: {location}</p>}

            <ContactInfo email={email} setEmail={setEmail} phone={phone} setPhone={setPhone} />

            <button type="submit" disabled={isUploading} className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-red-700">
              {isUploading ? "جاري التحديث..." : "تحديث المنشور"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default EditPostPage;
