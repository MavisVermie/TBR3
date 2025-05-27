import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import logo from "../../assets/TBR.png";

export default function SignInPage({ setAuth }) {
  const [inputs, setInputs] = useState({
    email: "",
    password: ""
  });

  const { email, password } = inputs;

  const onChange = e =>
    setInputs({ ...inputs, [e.target.name]: e.target.value });

  const onSubmitForm = async e => {
    e.preventDefault();
    try {
      const body = { email, password };
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/authentication/login`,
        {
          method: "POST",
          headers: {
            "Content-type": "application/json"
          },
          body: JSON.stringify(body)
        }
      );
      const parseRes = await response.json();

      if (parseRes.jwtToken) {
        localStorage.setItem("token", parseRes.jwtToken);
        setAuth(true);
        toast.success("تم تسجيل الدخول بنجاح");
      } else {
        setAuth(false);
        toast.error(parseRes);
      }
    } catch (err) {
      console.error(err.message);
    }
  };

  return (
    <section className="bg-bannerImg bg-no-repeat bg-cover w-full min-h-screen flex items-center justify-center">
      <div className=" w-full max-w-md px-6 py-12 shadow-2xl bg-white/10 backdrop-blur-md rounded-2xl transition-all duration-500 ease ">
        <div className="flex flex-col items-center text-center gap-8">
          {/* شعار الموقع */}
          <img src={logo} alt="شعار TBR3" className="w-1/2 h-29" />

          <form onSubmit={onSubmitForm} className="w-full text-left space-y-6">
            {/* حقل البريد الإلكتروني */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-green-600 mb-2"
              >
                البريد الإلكتروني
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={onChange}
                className="w-full rounded-xl border border-gray-300 bg-white py-2 px-4 text-gray-800 placeholder-gray-400 shadow-md
                  focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 sm:text-sm
                  hover:ring-green-400 hover:ring-4 transition duration-300"
              />
            </div>

            {/* حقل كلمة المرور */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-green-600 mb-2"
              >
                كلمة المرور
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={onChange}
                className="w-full rounded-xl border border-gray-300 bg-white py-2 px-4 text-gray-800 placeholder-gray-400 shadow-md
                  focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 sm:text-sm
                  hover:ring-green-400 hover:ring-4 transition duration-300"
              />
            </div>

            {/* رابط نسيت كلمة المرور */}
            <p className="text-sm text-center">
              <a
                href="/forgot-password"
                className="text-white hover:underline transition duration-150"
              >
                هل نسيت كلمة المرور؟
              </a>
            </p>

            {/* زر تسجيل الدخول */}
            <button
              type="submit"
              className="w-full rounded-xl bg-green-600 px-5 py-2 text-sm font-semibold text-white shadow-lg transition duration-200 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              تسجيل الدخول
            </button>

            {/* رابط التسجيل */}
            <p className="text-sm text-center text-white">
              لا تملك حساب؟{" "}
              <a
                href="/authentication/registration"
                className="text-green-600 hover:underline transition duration-150"
              >
                سجل الآن
              </a>
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}
if (!post) return (
  <div className="min-h-screen bg-gray-100 py-10 px-4">
    <div className="max-w-7xl mx-auto">
      {/* Header Skeleton */}
      <div className="bg-white p-8 rounded-xl shadow-lg mb-8 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-3/4 mb-3"></div>
        <div className="flex items-center justify-between">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column Skeleton */}
        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="bg-gray-200 rounded-xl h-[500px] mb-4"></div>
            <div className="grid grid-cols-5 gap-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-gray-200 rounded-lg h-[120px]"></div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column Skeleton */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
            <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="space-y-6">
              <div>
                <div className="h-5 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
              <div>
                <div className="h-5 bg-gray-200 rounded w-1/3 mb-3"></div>
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-4 bg-gray-200 rounded w-full"></div>
                  ))}
                </div>
              </div>
              <div className="border-t pt-6">
                <div className="h-5 bg-gray-200 rounded w-1/3 mb-3"></div>
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="space-y-2">
                      <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="pt-4">
                <div className="h-12 bg-gray-200 rounded-lg w-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

