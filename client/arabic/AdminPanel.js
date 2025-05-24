import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

export default function لوحة_تحكم_المشرف() {
  const [المستخدمون, تعيين_المستخدمون] = useState([]);
  const [يتم_التحميل, تعيين_يتم_التحميل] = useState(true);
  const انتقال = useNavigate();

  useEffect(() => {
    const الرمز = localStorage.getItem("token");
    if (!الرمز) return انتقال("/login");

    try {
      const مفكوك = jwtDecode(الرمز);
      if (!مفكوك.isAdmin) return انتقال("/not-authorized");
    } catch (خطأ) {
      console.error("الرمز غير صالح", خطأ);
      return انتقال("/login");
    }

    const جلب_المستخدمين = async () => {
      try {
        const استجابة = await fetch("http://localhost:5000/admin/users", {
          headers: {
            Authorization: `Bearer ${الرمز}`,
          },
        });

        const بيانات = await استجابة.json();
        تعيين_المستخدمون(Array.isArray(بيانات) ? بيانات : []);
      } catch (خطأ) {
        console.error("فشل جلب المستخدمين", خطأ);
        تعيين_المستخدمون([]);
      } finally {
        تعيين_يتم_التحميل(false);
      }
    };

    جلب_المستخدمين();
  }, [انتقال]);

  const تبديل_المسؤول = async (معرف) => {
    try {
      const استجابة = await fetch(`http://localhost:5000/admin/users/${معرف}/toggle-admin`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const محدث = await استجابة.json();
      تعيين_المستخدمون((سابق) =>
        سابق.map((مستخدم) =>
          مستخدم.id === محدث.id ? { ...مستخدم, is_admin: محدث.is_admin } : مستخدم
        )
      );
    } catch (خطأ) {
      console.error("فشل في تبديل حالة المسؤول", خطأ);
    }
  };

  const حذف_مستخدم = async (معرف) => {
    if (!window.confirm("هل أنت متأكد أنك تريد حذف هذا المستخدم؟")) return;
    try {
      await fetch(`http://localhost:5000/admin/users/${معرف}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      تعيين_المستخدمون((سابق) => سابق.filter((مستخدم) => مستخدم.id !== معرف));
    } catch (خطأ) {
      console.error("فشل حذف المستخدم", خطأ);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-semibold text-red-600 text-center">لوحة تحكم المشرف – إدارة المستخدمين</h2>
        <button
          onClick={() => انتقال("/admin/posts")}
          className="bg-black hover:bg-blue-700 text-white px-5 py-2 rounded-md text-sm font-semibold"
        >
          إدارة المنشورات
        </button>
      </div>

      {يتم_التحميل ? (
        <div className="flex justify-center items-center h-32">
          <div className="w-10 h-10 border-4 border-green-900 border-dashed rounded-full animate-spin"></div>
        </div>
      ) : !Array.isArray(المستخدمون) ? (
        <p className="text-center text-red-500">حدث خطأ أثناء تحميل المستخدمين</p>
      ) : المستخدمون.length === 0 ? (
        <p className="text-center text-gray-600">لا يوجد مستخدمون.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white shadow-md rounded-md overflow-hidden">
            <thead>
              <tr className="bg-green-900 text-white font-semibold font-serif">
                <th className="py-3 px-4 text-center">اسم المستخدم</th>
                <th className="py-3 px-4 text-center">البريد الإلكتروني</th>
                <th className="py-3 px-4 text-center">مسؤول</th>
                <th className="py-3 px-4 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {المستخدمون.map((مستخدم) => (
                <tr key={مستخدم.id} className="border-t">
                  <td className="py-3 px-4 text-center">{مستخدم.username}</td>
                  <td className="py-3 px-4 text-center">{مستخدم.email}</td>
                  <td className="py-3 px-4 text-center">
                    {مستخدم.is_admin ? (
                      <span className="text-green-600 font-semibold">نعم</span>
                    ) : (
                      <span className="text-gray-500">لا</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center space-x-2">
                    <button
                      onClick={() => تبديل_المسؤول(مستخدم.id)}
                      className="bg-blue-600 hover:bg-purple-500 text-white px-3 py-1 rounded-md text-sm"
                    >
                      {مستخدم.is_admin ? "إزالة كمسؤول" : "تعيين كمسؤول"}
                    </button>
                    <button
                      onClick={() => حذف_مستخدم(مستخدم.id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-sm"
                    >
                      حذف
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
