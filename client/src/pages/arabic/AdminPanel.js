import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

export default function AdminDashboard() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/login");

    try {
      const decoded = jwtDecode(token);
      if (!decoded.isAdmin) return navigate("/not-authorized");
    } catch (err) {
      console.error("رمز غير صالح:", err);
      return navigate("/login");
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 flex flex-col items-center text-center font-[Cairo]">
      <h1 className="text-4xl font-bold mb-8 text-red-700">لوحة تحكم المشرف</h1>

      <div className="flex flex-col gap-6 w-full max-w-sm">
        <button
          onClick={() => navigate("/admin/users")}
          className="bg-green-700 hover:bg-green-800 text-white py-3 px-6 rounded-lg font-semibold text-lg"
        >
          إدارة المستخدمين
        </button>

        <button
          onClick={() => navigate("/admin/posts")}
          className="bg-blue-700 hover:bg-blue-800 text-white py-3 px-6 rounded-lg font-semibold text-lg"
        >
          إدارة المنشورات
        </button>

        <button
          onClick={() => navigate("/admin/events")}
          className="bg-yellow-600 hover:bg-yellow-700 text-white py-3 px-6 rounded-lg font-semibold text-lg"
        >
          إدارة الفعاليات
        </button>

        <button
          onClick={() => navigate("/admin/create-event")}
          className="bg-red-600 hover:bg-red-700 text-white py-3 px-6 rounded-lg font-semibold text-lg"
        >
          + إنشاء فعالية جديدة
        </button>
      </div>
    </div>
  );
}
