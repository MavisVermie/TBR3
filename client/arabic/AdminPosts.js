import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

export default function منشورات_المشرف() {
  const [المنشورات, تعيين_المنشورات] = useState([]);
  const [يتم_التحميل, تعيين_يتم_التحميل] = useState(true);
  const انتقال = useNavigate();

  // دالة لجلب المنشورات من الخادم
  const جلب_المنشورات = async () => {
    try {
      const استجابة = await fetch("http://localhost:5000/admin/posts", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!استجابة.ok) {
        console.error(":فشل في جلب المنشورات. الحالة", استجابة.status);
        return تعيين_المنشورات([]);
      }

      const بيانات = await استجابة.json();

      if (Array.isArray(بيانات)) {
        تعيين_المنشورات(بيانات);
      } else {
        console.error("تنسيق البيانات غير صحيح:", بيانات);
        تعيين_المنشورات([]);
      }
    } catch (خطأ) {
      console.error("حدث خطأ أثناء جلب المنشورات:", خطأ.message);
      تعيين_المنشورات([]);
    } finally {
      تعيين_يتم_التحميل(false);
    }
  };

  // دالة لحذف منشور
  const حذف_منشور = async (معرف_المنشور) => {
    if (!window.confirm("هل أنت متأكد أنك تريد حذف هذا المنشور؟")) return;

    try {
      const استجابة = await fetch(`http://localhost:5000/admin/posts/${معرف_المنشور}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (استجابة.ok) {
        تعيين_المنشورات((سابق) => سابق.filter((م) => م.post_id !== معرف_المنشور));
      } else {
        console.error("فشل في حذف المنشور");
      }
    } catch (خطأ) {
      console.error("خطأ أثناء حذف المنشور:", خطأ.message);
    }
  };

  useEffect(() => {
    const التوكن = localStorage.getItem("token");

    if (!التوكن) return انتقال("/login");

    try {
      const مفكوك = jwtDecode(التوكن);
      if (!مفكوك.isAdmin) return انتقال("/not-authorized");
    } catch (خطأ) {
      console.error("توكن غير صالح:", خطأ);
      return انتقال("/login");
    }

    جلب_المنشورات();
  }, [انتقال]);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h2 className="text-3xl font-semibold text-center text-red-700 mb-8">
        لوحة تحكم المشرف – إدارة المنشورات
      </h2>

      {يتم_التحميل ? (
        <div className="flex justify-center items-center h-32">
          <div className="w-10 h-10 border-4 border-green-500 border-dashed rounded-full animate-spin"></div>
        </div>
      ) : المنشورات.length === 0 ? (
        <p className="text-center text-gray-600 text-lg">لا توجد منشورات حالياً.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-11">
          {المنشورات.map((منشور) => (
            <div
              key={منشور.post_id}
              className="bg-white shadow-lg rounded-l overflow-hidden border border-gray-200"
            >
              {منشور.primary_photo && (
                <img
                  src={`data:image/jpeg;base64,${منشور.primary_photo}`}
                  alt="منشور"
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-1">{منشور.title}</h3>
                <p className="text-sm text-gray-600 mb-2">
                  نُشر بواسطة:{" "}
                  <span className="font-medium">{منشور.username}</span> ({منشور.email})
                </p>
                <button
                  onClick={() => حذف_منشور(منشور.post_id)}
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-md transition"
                >
                  حذف المنشور
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
