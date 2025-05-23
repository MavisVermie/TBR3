import React from 'react';

/**
 * مكون عرض معلومات الملف الشخصي
 * يعرض معلومات المستخدم الأساسية مثل:
 * - اسم المستخدم
 * - البريد الإلكتروني
 * - رقم الهاتف
 * - تاريخ الانضمام
 */
const ProfileInfo = ({ userInfo }) => {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 transform transition-all duration-300 hover:shadow-2xl">
      {/* معلومات الملف الشخصي */}
      <div className="flex items-center space-x-6 mb-8">
        <div className="h-24 w-24 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-lg">
          <span className="text-3xl font-bold text-white">
            {userInfo.username ? userInfo.username[0].toUpperCase() : '?'}
          </span>
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{userInfo.username}</h1>
          <p className="text-gray-600 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Member since {userInfo.created_at}
          </p>
        </div>
      </div>
      
      {/* تفاصيل الملف الشخصي */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition-colors duration-300">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Email</h3>
            <p className="text-lg text-gray-900 flex items-center">
              <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              {userInfo.email}
            </p>
          </div>
          <div className="bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition-colors duration-300">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Phone Number</h3>
            <p className="text-lg text-gray-900 flex items-center">
              <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              {userInfo.phone_number || 'Not provided'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileInfo; 