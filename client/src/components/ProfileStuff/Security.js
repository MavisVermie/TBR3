/**
 * مكون إعدادات الأمان
 * 
 * هذا المكون يقوم بما يلي:
 * 1. تغيير كلمة المرور
 * 2. إدارة المصادقة الثنائية (2FA)
 * 3. إدارة الجلسات النشطة
 * 
 * المكون يتضمن:
 * - نموذج تغيير كلمة المرور
 * - خيار تفعيل/تعطيل المصادقة الثنائية
 * - قائمة بالجلسات النشطة
 * - خيار تسجيل الخروج من جميع الأجهزة
 */

import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const Security = () => {
  // حالة لتخزين كلمات المرور
  const [passwords, setPasswords] = useState({
    current: '',    // كلمة المرور الحالية
    new: '',        // كلمة المرور الجديدة
    confirm: ''     // تأكيد كلمة المرور الجديدة
  });
  const [loading, setLoading] = useState(true);      // حالة التحميل
  const [userData, setUserData] = useState(null);    // بيانات المستخدم
  const [sessions, setSessions] = useState([]);      // الجلسات النشطة

  /**
   * تأثير لجلب بيانات المستخدم والجلسات النشطة عند تحميل المكون
   */
  useEffect(() => {
    // دالة جلب بيانات المستخدم
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          toast.error("Please login to access security settings");
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
          throw new Error('Failed to fetch user data');
        }

        const data = await response.json();
        if (data && data.length > 0) {
          setUserData(data[0]);
        }
      } catch (err) {
        console.error('Error fetching user data:', err.message);
        toast.error("Error loading user data");
      } finally {
        setLoading(false);
      }
    };

    // دالة جلب الجلسات النشطة
    const fetchSessions = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch("http://localhost:5000/sessions", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch sessions');
        }

        const data = await response.json();
        setSessions(data);
      } catch (err) {
        console.error('Error fetching sessions:', err.message);
        toast.error("Error loading active sessions");
      }
    };

    fetchUserData();
    fetchSessions();
  }, []);

  /**
   * دالة معالجة تغيير قيم حقول كلمة المرور
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setPasswords(prev => ({
      ...prev,
      [name]: value
    }));
  };

  /**
   * دالة تغيير كلمة المرور
   * تقوم بما يلي:
   * 1. التحقق من تطابق كلمتي المرور الجديدتين
   * 2. إرسال طلب تغيير كلمة المرور للخادم
   * 3. عرض رسالة نجاح أو فشل العملية
   */
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      toast.error("New passwords don't match");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch("http://localhost:5000/change-password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: passwords.current,
          newPassword: passwords.new
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update password');
      }

      toast.success("Password updated successfully!");
      setPasswords({ current: '', new: '', confirm: '' });
    } catch (err) {
      console.error('Error updating password:', err.message);
      toast.error(err.message || "Error updating password");
    } finally {
      setLoading(false);
    }
  };

  /**
   * دالة تفعيل/تعطيل المصادقة الثنائية
   */
  const handle2FAToggle = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch("http://localhost:5000/toggle-2fa", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update 2FA settings');
      }

      toast.success("2FA settings updated successfully!");
    } catch (err) {
      console.error('Error updating 2FA:', err.message);
      toast.error(err.message || "Error updating 2FA settings");
    } finally {
      setLoading(false);
    }
  };

  /**
   * دالة تسجيل الخروج من جميع الأجهزة
   */
  const handleSignOutAll = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch("http://localhost:5000/signout-all", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to sign out from all devices');
      }

      toast.success("Signed out from all devices successfully!");
      setSessions([]);
    } catch (err) {
      console.error('Error signing out:', err.message);
      toast.error("Error signing out from all devices");
    } finally {
      setLoading(false);
    }
  };

  // عرض مؤشر التحميل أثناء جلب البيانات
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* قسم تغيير كلمة المرور */}
      <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] p-8">
        <div className="flex items-center space-x-4 mb-8">
          <div className="p-3 bg-gradient-to-br from-green-100 to-green-50 rounded-xl shadow-sm">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-800">Change Password</h3>
            <p className="text-gray-600">Update your password to keep your account secure</p>
          </div>
        </div>

        <form onSubmit={handlePasswordChange} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  type="password"
                  name="current"
                  value={passwords.current}
                  onChange={handleChange}
                  className="pl-10 block w-full rounded-xl border-2 border-gray-200 bg-white py-3 px-4 text-gray-800 placeholder-gray-400 shadow-sm focus:border-green-500 focus:ring-2 focus:ring-green-400 focus:outline-none transition duration-200"
                  placeholder="Enter current password"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  type="password"
                  name="new"
                  value={passwords.new}
                  onChange={handleChange}
                  className="pl-10 block w-full rounded-xl border-2 border-gray-200 bg-white py-3 px-4 text-gray-800 placeholder-gray-400 shadow-sm focus:border-green-500 focus:ring-2 focus:ring-green-400 focus:outline-none transition duration-200"
                  placeholder="Enter new password"
                  required
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <input
                type="password"
                name="confirm"
                value={passwords.confirm}
                onChange={handleChange}
                className="pl-10 block w-full rounded-xl border-2 border-gray-200 bg-white py-3 px-4 text-gray-800 placeholder-gray-400 shadow-sm focus:border-green-500 focus:ring-2 focus:ring-green-400 focus:outline-none transition duration-200"
                placeholder="Confirm new password"
                required
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transform transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>

      {/* قسم المصادقة الثنائية */}
      <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] p-8 transform transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.16)] hover:-translate-y-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-50 rounded-xl shadow-sm">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-800">Two-Factor Authentication</h3>
              <p className="text-gray-600">Add an extra layer of security to your account</p>
            </div>
          </div>
          <button
            onClick={handle2FAToggle}
            disabled={loading}
            className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transform transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Updating...' : 'Enable 2FA'}
          </button>
        </div>
      </div>

      {/* قسم إدارة الجلسات */}
      <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] p-8 transform transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.16)] hover:-translate-y-1">
        <div className="flex items-center space-x-4 mb-8">
          <div className="p-3 bg-gradient-to-br from-purple-100 to-purple-50 rounded-xl shadow-sm">
            <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-800">Active Sessions</h3>
            <p className="text-gray-600">Manage your active sessions and devices</p>
          </div>
        </div>

        <div className="space-y-4">
          {sessions.map((session, index) => (
            <div key={index} className="flex items-center justify-between p-6 bg-gradient-to-br from-gray-50 to-white rounded-xl hover:bg-gradient-to-br hover:from-gray-100 hover:to-gray-50 transition-all duration-300 shadow-sm">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-gradient-to-br from-green-100 to-green-50 rounded-lg shadow-sm">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-800">{session.device || 'Unknown Device'}</p>
                  <p className="text-sm text-gray-500">Last active: {new Date(session.lastActive).toLocaleString()}</p>
                </div>
              </div>
              <span className="px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">Active</span>
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSignOutAll}
            disabled={loading}
            className="px-8 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transform transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing out...' : 'Sign out from all devices'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Security; 