import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const EditUserInfo = () => {
  const [profile, setProfile] = useState({
    username: '',
    email: '',
    phone_number: '',
    location: '',
    created_at: ''
  });

  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          toast.error("Please login to view your profile");
          setLoading(false);
          return;
        }

        const response = await fetch("http://localhost:5000/profile", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          }
        });

        if (!response.ok) throw new Error("Failed to fetch profile");

        const data = await response.json();
        const user = data[0];
        setProfile({
          username: user.username || '',
          email: user.email || '',
          phone_number: user.phone_number || '',
          location: user.location || '',
          created_at: user.created_at ? new Date(user.created_at).toLocaleString() : ''
        });
      } catch (err) {
        toast.error(err.message || "Error loading profile");
      } finally {
        setLoading(false);
      }
    };

    getProfile();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error("Please login to update your profile");
        return;
      }

      const response = await fetch("http://localhost:5000/update-credentials", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(profile)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile');
      }

      toast.success("Profile updated successfully");
    } catch (err) {
      toast.error(err.message || "Error updating profile");
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      toast.error("New passwords don't match");
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch("http://localhost:5000/change-password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: passwords.current,
          newPassword: passwords.new
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to change password');
      }

      toast.success("Password updated successfully");
      setPasswords({ current: '', new: '', confirm: '' });
    } catch (err) {
      toast.error(err.message || "Error updating password");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordInputChange = (e) => {
    const { name, value } = e.target;
    setPasswords(prev => ({ ...prev, [name]: value }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 font-sans">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Edit Profile */}
        <div className="bg-white rounded-2xl shadow-lg p-6 space-y-6">
          <h2 className="text-2xl font-semibold text-gray-800 text-center">Edit Your Profile</h2>
          <form onSubmit={handleUpdateProfile} className="space-y-6">
            <div className="space-y-4">
              {['username', 'email', 'phone_number', 'location'].map((field) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-green-700 capitalize text-left mb-3">
                    {field.replace('_', ' ')}
                  </label>
                  <input
                    type={field === 'email' ? 'email' : 'text'}
                    name={field}
                    value={profile[field]}
                    onChange={handleInputChange}
                    className="w-full rounded-xl border border-gray-300 bg-white py-2 px-3 focus:outline-none focus:border-green-500"
                    placeholder={`Enter your ${field.replace('_', ' ')}`}
                  />
                </div>
              ))}
            </div>

            <div className="text-sm text-gray-500 text-left">
              <strong>Member Since:</strong> {profile.created_at}
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-6 py-2 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition"
              >
                Update Profile
              </button>
            </div>
          </form>
        </div>

        {/* Change Password */}
        <div className="bg-white rounded-2xl shadow-lg p-6 space-y-6">
          <h2 className="text-2xl font-semibold text-gray-800 text-center">Change Your Password</h2>
          <form onSubmit={handlePasswordChange} className="space-y-6">
            <div className="space-y-4">
              {['current', 'new', 'confirm'].map((type) => (
                <div key={type}>
                  <label className="block text-sm font-medium text-green-700 text-left mb-3">
                    {`${type.charAt(0).toUpperCase() + type.slice(1)} Password`}
                  </label>
                  <input
                    type="password"
                    name={type}
                    value={passwords[type]}
                    onChange={handlePasswordInputChange}
                    placeholder={`${type.charAt(0).toUpperCase() + type.slice(1)} Password`}
                    className="w-full rounded-xl border border-gray-300 bg-white py-2 px-3 focus:outline-none focus:border-green-500"
                    required
                  />
                </div>
              ))}
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition disabled:opacity-50"
              >
                {loading ? 'Updating...' : 'Change Password'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditUserInfo;
