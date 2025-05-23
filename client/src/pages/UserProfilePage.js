import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import UserFeedback from "./UserFeedbak";
import FeedbackForm from "./FeedbackFrom";
import axios from "axios";

const UserProfilePage = () => {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        setError(null);
        // يفترض أن لديك endpoint مثل /api/users/:userId
        const res = await axios.get(`/api/users/${userId}`);
        setUser(res.data);
      } catch (err) {
        setError("تعذر جلب بيانات المستخدم");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [userId]);

  if (loading) return <div className="p-6">جاري التحميل...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!user) return <div className="p-6">لا يوجد بيانات لهذا المستخدم</div>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">User Profile</h1>
      <div className="mb-6 border p-4 rounded-xl shadow">
        <p><strong>Username:</strong> {user.username}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Zip Code:</strong> {user.zip_code || "غير متوفر"}</p>
      </div>
      {/* عرض الفيدباك */}
      <UserFeedback userId={userId} />
      {/* فورم التقييم */}
      <FeedbackForm donorId={userId} onSubmitted={() => window.location.reload()} />
    </div>
  );
};

export default UserProfilePage;