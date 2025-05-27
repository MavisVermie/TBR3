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
      console.error("Invalid token:", err);
      return navigate("/login");
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 flex flex-col items-center text-center">
      <h1 className="text-4xl font-semibold mb-8 text-red-700">Admin Panel</h1>

      <div className="flex flex-col gap-6 w-full max-w-sm">
        <button
          onClick={() => navigate("/admin/users")}
          className="bg-green-600 hover:bg-green-800 text-white py-3 px-6 rounded-lg font-semibold text-lg"
        >
          Manage Users
        </button>

        <button
          onClick={() => navigate("/admin/posts")}
          className="bg-blue-500 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-semibold text-lg"
        >
          Manage Posts
        </button>

        <button
          onClick={() => navigate("/admin/events")}
          className="bg-black/80 hover:bg-black text-white py-3 px-6 rounded-lg font-semibold text-lg"
        >
          Manage Events
        </button>

        <button
          onClick={() => navigate("/admin/create-event")}
          className="bg-red-500 hover:bg-red-700 text-white py-3 px-6 rounded-lg font-semibold text-lg"
        >
          + Create New Event
        </button>
      </div>
    </div>
  );
}
