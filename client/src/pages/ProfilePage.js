import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import EditUserInfo from '../components/ProfileStuff/EditUserInfo';
import Security from '../components/ProfileStuff/Security';
import Notifications from '../components/ProfileStuff/Notifications';
import ProfileInfo from '../components/ProfileStuff/ProfileInfo';

/**
 * مكون صفحة الملف الشخصي
 * يتضمن:
 * - عرض معلومات الملف الشخصي
 * - تعديل المعلومات
 * - إعدادات الأمان
 * - إعدادات الإشعارات
 */
export default function ProfilePage(){
  const [activeTab, setActiveTab] = useState('profile');
  const [userInfo, setUserInfo] = useState({
    username: '',
    email: '',
    phone_number: '',
    created_at: ''
  });
  const [loading, setLoading] = useState(true);

  /**
   * جلب بيانات المستخدم عند تحميل المكون
   */
  useEffect(() => {
    const fetchUserInfo = async () => {
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
          throw new Error(errorData.message || 'Failed to fetch user information');
        }

        const data = await response.json();
        if (data && data.length > 0) {
          const userData = data[0];
          setUserInfo({
            username: userData.username || '',
            email: userData.email || '',
            phone_number: userData.phone_number || userData.phone || '',
            created_at: userData.created_at ? new Date(userData.created_at).toLocaleString() : ''
          });
        }
      } catch (err) {
        console.error('Error fetching user info:', err.message);
        toast.error("Error loading profile information");
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, []);

  /**
   * عرض مؤشر التحميل
   */
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-green-50 to-white">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-600"></div>
      </div>
    );
  }

  /**
   * عرض محتوى التبويب النشط
   */
  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileInfo userInfo={userInfo} />;
      case 'edit':
        return <EditUserInfo />;
      case 'security':
        return <Security />;
      case 'notifications':
        return <Notifications />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white py-12">
      <div className="container mx-auto px-4">
        {/* شريط التنقل */}
        <div className="mb-8">
          <nav className="flex space-x-4 bg-white rounded-2xl shadow-lg p-2">
            {[
              { id: 'profile', label: 'Profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
              { id: 'edit', label: 'Edit Profile', icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' },
              { id: 'security', label: 'Security', icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' },
              { id: 'notifications', label: 'Notifications', icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9' }
            ].map(({ id, label, icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                  activeTab === id
                    ? 'bg-green-600 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={icon} />
                </svg>
                {label}
              </button>
            ))}
          </nav>
        </div>

        {/* منطقة المحتوى */}
        {renderContent()}
      </div>
    </div>
  );
};