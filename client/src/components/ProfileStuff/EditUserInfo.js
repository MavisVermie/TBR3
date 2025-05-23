/**
 * مكون تعديل معلومات المستخدم
 * 
 * هذا المكون يقوم بما يلي:
 * 1. عرض نموذج لتعديل معلومات المستخدم (اسم المستخدم، البريد الإلكتروني، رقم الهاتف، الموقع)
 * 2. جلب بيانات المستخدم الحالية من الخادم عند تحميل المكون
 * 3. السماح للمستخدم بتحديث معلوماته
 * 4. عرض رسائل نجاح أو خطأ عند تحديث المعلومات
 * 5. عرض مؤشر تحميل أثناء جلب البيانات
 * 
 * المكون يستخدم:
 * - useState لإدارة حالة البيانات
 * - useEffect لجلب البيانات عند تحميل المكون
 * - fetch للتواصل مع الخادم
 * - toast لعرض الإشعارات
 */

import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const EditUserInfo = () => {
  // حالة لتخزين معلومات الملف الشخصي
  const [profile, setProfile] = useState({
    username: '',
    email: '',
    phone_number: '',
    location: '',
    created_at: ''
  });
  // حالة لتتبع حالة التحميل
  const [loading, setLoading] = useState(true);

  /**
   * دالة جلب بيانات الملف الشخصي
   * تقوم هذه الدالة بما يلي:
   * 1. التحقق من وجود توكن المستخدم
   * 2. إرسال طلب GET إلى الخادم لجلب البيانات
   * 3. تحديث حالة الملف الشخصي بالبيانات المستلمة
   * 4. معالجة الأخطاء وعرض رسائل مناسبة
   */
  useEffect(() => {
    const getProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          toast.error("Please login to view your profile");
          setLoading(false);
          return;
        }

        const response = await fetch("http://localhost:5000/Posting/", {
          method: "GET",
          headers: { 
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}` 
          }
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch profile');
        }

        const data = await response.json();
        console.log("Received profile data:", data);
        
        if (data && data.length > 0) {
          const userData = data[0];
          console.log("Profile data from first item:", userData);
          
          setProfile({
            username: userData.username || '',
            email: userData.email || '',
            phone_number: userData.phone_number || userData.phone || '',
            location: userData.location || '',
            created_at: userData.created_at ? new Date(userData.created_at).toLocaleString() : ''
          });
        }
      } catch (err) {
        console.error('Error fetching profile:', err.message);
        toast.error(err.message || "Error loading profile");
      } finally {
        setLoading(false);
      }
    };

    getProfile();
  }, []);

  /**
   * دالة تحديث معلومات الملف الشخصي
   * تقوم هذه الدالة بما يلي:
   * 1. منع السلوك الافتراضي للنموذج
   * 2. التحقق من وجود توكن المستخدم
   * 3. إرسال طلب PUT إلى الخادم لتحديث البيانات
   * 4. عرض رسالة نجاح أو خطأ حسب نتيجة العملية
   */
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error("Please login to update your profile");
        return;
      }

      const response = await fetch("http://localhost:5000/Posting/update", {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          username: profile.username,
          email: profile.email,
          phone_number: profile.phone_number,
          location: profile.location
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile');
      }

      toast.success("Profile updated successfully");
    } catch (err) {
      console.error('Error updating profile:', err.message);
      toast.error(err.message || "Error updating profile");
    }
  };

  /**
   * دالة معالجة تغيير قيم الحقول
   * تقوم هذه الدالة بما يلي:
   * 1. استخراج اسم الحقل وقيمته من الحدث
   * 2. تحديث حالة الملف الشخصي بالقيمة الجديدة للحقل
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // عرض مؤشر التحميل أثناء جلب البيانات
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-600"></div>
      </div>
    );
  }

  // عرض نموذج تعديل الملف الشخصي
  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 transform transition-all duration-300 hover:shadow-2xl">
      <form onSubmit={handleUpdateProfile} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <input
                  type="text"
                  name="username"
                  value={profile.username}
                  onChange={handleInputChange}
                  className="pl-10 block w-full rounded-xl border-2 border-gray-200 bg-white py-3 px-4 text-gray-800 placeholder-gray-400 shadow-sm focus:border-green-500 focus:ring-2 focus:ring-green-400 focus:outline-none transition duration-200"
                  placeholder="Enter your username"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <input
                  type="email"
                  name="email"
                  value={profile.email}
                  onChange={handleInputChange}
                  className="pl-10 block w-full rounded-xl border-2 border-gray-200 bg-white py-3 px-4 text-gray-800 placeholder-gray-400 shadow-sm focus:border-green-500 focus:ring-2 focus:ring-green-400 focus:outline-none transition duration-200"
                  placeholder="Enter your email"
                />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <input
                  type="tel"
                  name="phone_number"
                  value={profile.phone_number}
                  onChange={handleInputChange}
                  className="pl-10 block w-full rounded-xl border-2 border-gray-200 bg-white py-3 px-4 text-gray-800 placeholder-gray-400 shadow-sm focus:border-green-500 focus:ring-2 focus:ring-green-400 focus:outline-none transition duration-200"
                  placeholder="Enter your phone number"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  name="location"
                  value={profile.location}
                  onChange={handleInputChange}
                  className="pl-10 block w-full rounded-xl border-2 border-gray-200 bg-white py-3 px-4 text-gray-800 placeholder-gray-400 shadow-sm focus:border-green-500 focus:ring-2 focus:ring-green-400 focus:outline-none transition duration-200"
                  placeholder="Enter your location"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Member Since</label>
          <p className="text-lg text-gray-900">{profile.created_at}</p>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-8 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transform transition-all duration-200 hover:scale-105"
          >
            Update Profile
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditUserInfo; 