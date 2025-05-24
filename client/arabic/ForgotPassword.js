import React, { useState } from "react";
import { toast } from "react-toastify";

const نسيت_كلمة_المرور = () => {
  const [البريد_الإلكتروني, تعيين_البريد_الإلكتروني] = useState("");

  const عند_الإرسال = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:5000/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: البريد_الإلكتروني }),
      });

      const { message } = await response.json();
      response.ok ? toast.success(message) : toast.error(message);
    } catch (error) {
      console.error("خطأ في إرسال رابط إعادة كلمة المرور", error);
      toast.error("فشل في إرسال بريد إلكتروني لإعادة التعيين");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-8 font-sans">
      <div className="w-full max-w-md bg-green-600 shadow-2xl shadow-green-100 rounded-xl p-8">
        <h1 className="text-3xl font-semibold text-center text-white mb-6">
          نسيت كلمة السر؟
        </h1>

        <form onSubmit={عند_الإرسال} className="space-y-4">
          <input
            type="email"
            name="email"
            placeholder="أدخل بريدك الإلكتروني"
            required
            value={البريد_الإلكتروني}
            onChange={(e) => تعيين_البريد_الإلكتروني(e.target.value)}
            className="w-full px-4 py-2 rounded-md border border-gray-300 shadow-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
          />

          <button
            type="submit"
            className="w-full bg-white hover:bg-gray-700 text-green-500 font-semibold py-2 px-4 rounded-md shadow transition duration-200"
          >
            أرسل رابط إعادة الضبط
          </button>
        </form>
      </div>
    </div>
  );
};

export default نسيت_كلمة_المرور;
