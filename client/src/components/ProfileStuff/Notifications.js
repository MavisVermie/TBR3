/**
 * مكون إعدادات الإشعارات
 * 
 * هذا المكون يقوم بما يلي:
 * 1. عرض خيارات الإشعارات المختلفة للمستخدم
 * 2. السماح للمستخدم بتفعيل/تعطيل أنواع الإشعارات
 * 3. حفظ تفضيلات الإشعارات في الخادم
 * 
 * أنواع الإشعارات المتاحة:
 * - إشعارات البريد الإلكتروني
 * - إشعارات الدفع (Push Notifications)
 * - رسائل التسويق
 */

import React, { useState } from 'react';
import { toast } from 'react-toastify';

const Notifications = () => {
  // حالة لتخزين إعدادات الإشعارات
  const [notifications, setNotifications] = useState({
    email: true,      // إشعارات البريد الإلكتروني
    push: true,       // إشعارات الدفع
    marketing: false  // رسائل التسويق
  });

  /**
   * دالة تبديل حالة الإشعارات
   * تقوم بتغيير حالة نوع الإشعار المحدد (تفعيل/تعطيل)
   * @param {string} name - اسم نوع الإشعار المراد تبديله
   */
  const handleToggle = (name) => {
    setNotifications(prev => ({
      ...prev,
      [name]: !prev[name]
    }));
  };

  /**
   * دالة حفظ تفضيلات الإشعارات
   * تقوم بما يلي:
   * 1. إرسال الإعدادات الجديدة إلى الخادم
   * 2. عرض رسالة نجاح أو فشل العملية
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch("http://localhost:5000/notifications", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(notifications)
      });

      if (response.ok) {
        toast.success("Notification preferences updated successfully!");
      } else {
        throw new Error("Failed to update notification preferences");
      }
    } catch (err) {
      console.error(err.message);
      toast.error("Error updating notification preferences");
    }
  };

  // عرض واجهة إعدادات الإشعارات
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-xl p-8 transform transition-all duration-300 hover:shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* قسم إشعارات البريد الإلكتروني */}
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition-colors duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Email Notifications</h3>
                    <p className="text-gray-600">Receive email updates about your posts</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={notifications.email}
                      onChange={() => handleToggle('email')}
                    />
                    <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-green-600"></div>
                  </label>
                </div>
              </div>

              {/* قسم إشعارات الدفع */}
              <div className="bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition-colors duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Push Notifications</h3>
                    <p className="text-gray-600">Receive push notifications on your device</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={notifications.push}
                      onChange={() => handleToggle('push')}
                    />
                    <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-green-600"></div>
                  </label>
                </div>
              </div>

              {/* قسم رسائل التسويق */}
              <div className="bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition-colors duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Marketing Emails</h3>
                    <p className="text-gray-600">Receive marketing and promotional emails</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={notifications.marketing}
                      onChange={() => handleToggle('marketing')}
                    />
                    <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-green-600"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* زر حفظ التفضيلات */}
            <button
              type="submit"
              className="w-full px-8 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transform transition-all duration-200 hover:scale-105"
            >
              Save Preferences
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Notifications; 