import React, { useState } from "react";
import { toast } from "react-toastify";

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
        "http://localhost:5000/authentication/login",
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
        toast.success("Logged in Successfully");
      } else {
        setAuth(false);
        toast.error(parseRes);
      }
    } catch (err) {
      console.error(err.message);
    }
  };

  return (
<div className="flex-1 flex items-center justify-center bg-gradient-to-b from-white to-[#EFEBE3]">
      <div className="w-full max-w-sm px-6 py-12">
        <h2 className="text-center text-3xl font-extrabold tracking-tight text-green-600 drop-shadow-sm mb-10">
          Sign in to your account
        </h2>
        <form onSubmit={onSubmitForm}>
          <div className="mb-6">
            <label htmlFor="email" className="block text-sm font-medium leading-6 text-green-600 mb-2">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="block w-full rounded-xl border border-gray-300 bg-white py-2 px-4 text-gray-800 placeholder-gray-400 shadow-md focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-200 sm:text-sm"
              value={email}
              onChange={onChange}
            />
          </div>

          <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-medium leading-6 text-green-600 mb-2">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="block w-full rounded-xl border border-gray-300 bg-white py-2 px-4 text-gray-800 placeholder-gray-400 shadow-md focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-200 sm:text-sm"
              value={password}
              onChange={onChange}
            />
          </div>

          <p className="mb-4 text-center text-sm">
            <a href="/forgot-password" className="text-green-600 hover:underline transition-colors duration-150">
              Forgot your password?
            </a>
          </p>

          <button
            type="submit"
            className="w-full rounded-xl bg-green-600 px-5 py-2 text-sm font-semibold text-white shadow-lg transition duration-200 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            Sign in
          </button>
        </form>

        <p className="mt-10 text-center text-sm text-gray-500">
          Not a member?{" "}
          <a href="/authentication/registration" className="font-semibold text-green-600 hover:text-green-700 transition-colors duration-150">
            Create an Account
          </a>
        </p>
      </div>
    </div>
  );
}
