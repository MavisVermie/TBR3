import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import logo from "../../assets/TBR.png";

export default function SignInPage({ setAuth }) {
  const [inputs, setInputs] = useState({ email: "", password: "" });
  const { email, password } = inputs;

  const onChange = (e) =>
    setInputs({ ...inputs, [e.target.name]: e.target.value });

  const onSubmitForm = async (e) => {
    e.preventDefault();
    try {
      const body = { email, password };
      const response = await fetch(
        "http://localhost:5000/authentication/login",
        {
          method: "POST",
          headers: {
            "Content-type": "application/json",
          },
          body: JSON.stringify(body),
        }
      );
      const parseRes = await response.json();

      if (parseRes.jwtToken) {
        localStorage.setItem("token", parseRes.jwtToken);
        setAuth(true);
        toast.success("Logged in Successfully");
      } else {
        setAuth(false);
        toast.error(parseRes);
      }
    } catch (err) {
      console.error(err.message);
    }
  };

  // ✅ Preload background image
  const [bgReady, setBgReady] = useState(false);
  useEffect(() => {
    const img = new Image();
    img.src = "/bgtest3.jpg"; // image in public/
    img.onload = () => setBgReady(true);
  }, []);

  return (
    <section
      className={`w-full min-h-screen flex items-center justify-center  ${
        bgReady ? "bg-bannerImg opacity-100" : "opacity-0"
      } bg-no-repeat bg-center bg-cover`}
    >
      {/* Optional loader text */}
      {!bgReady && (
        <div className="absolute top-5 text-white text-sm font-medium animate-pulse">
          Loading background...
        </div>
      )}

      <div className="w-full max-w-md px-6 py-12 shadow-2xl bg-white/10 backdrop-blur-md rounded-2xl transition-all duration-500 ease">
        <div className="flex flex-col items-center text-center gap-8">
          <img src={logo} alt="TBR3 Logo" className="w-1/2 h-29" />

          <form onSubmit={onSubmitForm} className="w-full text-left space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-green-600 mb-2"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={onChange}
                className="w-full rounded-xl border border-gray-300 bg-white py-2 px-4 text-gray-800 placeholder-gray-400 shadow-md focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 sm:text-sm hover:ring-green-400 hover:ring-4 transition duration-300"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-green-600 mb-2"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={onChange}
                className="w-full rounded-xl border border-gray-300 bg-white py-2 px-4 text-gray-800 placeholder-gray-400 shadow-md focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 sm:text-sm hover:ring-green-400 hover:ring-4 transition duration-300"
              />
            </div>

            <p className="text-sm text-center">
              <a
                href="/forgot-password"
                className="text-white hover:underline transition duration-150"
              >
                Forgot your password?
              </a>
            </p>

            <button
              type="submit"
              className="w-full rounded-xl bg-green-600 px-5 py-2 text-sm font-semibold text-white shadow-lg transition duration-200 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              Sign in
            </button>

            <p className="text-sm text-center text-white">
              Don't have an account?{" "}
              <a
                href="/authentication/registration"
                className="text-green-600 hover:underline transition duration-150"
              >
                Register
              </a>
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}
