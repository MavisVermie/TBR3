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

        const response = await fetch("http://localhost:5000/Posting/", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          }
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch profile');
        }

        const data = await response.json();
        if (data && data.length > 0) {
          const userData = data[0];
          setProfile({
            username: userData.username || '',
            email: userData.email || '',
            phone_number: userData.phone_number || userData.phone || '',
            location: userData.location || '',
            created_at: userData.created_at ? new Date(userData.created_at).toLocaleString() : ''
          });
        }
      } catch (err) {
        console.error('Error fetching profile:', err.message);
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

      const response = await fetch("http://localhost:5000/Posting/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          username: profile.username,
          email: profile.email,
          phone_number: profile.phone_number,
          location: profile.location
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile');
      }

      toast.success("Profile updated successfully");
    } catch (err) {
      console.error('Error updating profile:', err.message);
      toast.error(err.message || "Error updating profile");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordInputChange = (e) => {
    const { name, value } = e.target;
    setPasswords(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      toast.error("New passwords don't match");
      return;
    }

    try {
      setLoading(true);
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
        throw new Error(errorData.message || 'Failed to update password');
      }

      toast.success("Password updated successfully!");
      setPasswords({ current: '', new: '', confirm: '' });
    } catch (err) {
      console.error('Error updating password:', err.message);
      toast.error(err.message || "Error updating password");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 transform transition-all duration-300 hover:shadow-2xl space-y-12">
      <form onSubmit={handleUpdateProfile} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
              <input
                type="text"
                name="username"
                value={profile.username}
                onChange={handleInputChange}
                className="block w-full rounded-xl border-2 border-gray-200 bg-white py-3 px-4"
                placeholder="Enter your username"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={profile.email}
                onChange={handleInputChange}
                className="block w-full rounded-xl border-2 border-gray-200 bg-white py-3 px-4"
                placeholder="Enter your email"
              />
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
              <input
                type="tel"
                name="phone_number"
                value={profile.phone_number}
                onChange={handleInputChange}
                className="block w-full rounded-xl border-2 border-gray-200 bg-white py-3 px-4"
                placeholder="Enter your phone number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
              <input
                type="text"
                name="location"
                value={profile.location}
                onChange={handleInputChange}
                className="block w-full rounded-xl border-2 border-gray-200 bg-white py-3 px-4"
                placeholder="Enter your location"
              />
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Member Since</label>
          <p className="text-lg text-gray-900">{profile.created_at}</p>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-8 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700"
          >
            Update Profile
          </button>
        </div>
      </form>

      {/* Password change section */}
      <div className="border-t pt-8">
        <h3 className="text-2xl font-bold text-gray-800 mb-6">Change Password</h3>
        <form onSubmit={handlePasswordChange} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <input
              type="password"
              name="current"
              value={passwords.current}
              onChange={handlePasswordInputChange}
              className="block w-full rounded-xl border-2 border-gray-200 bg-white py-3 px-4"
              placeholder="Current Password"
              required
            />
            <input
              type="password"
              name="new"
              value={passwords.new}
              onChange={handlePasswordInputChange}
              className="block w-full rounded-xl border-2 border-gray-200 bg-white py-3 px-4"
              placeholder="New Password"
              required
            />
            <input
              type="password"
              name="confirm"
              value={passwords.confirm}
              onChange={handlePasswordInputChange}
              className="block w-full rounded-xl border-2 border-gray-200 bg-white py-3 px-4"
              placeholder="Confirm New Password"
              required
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Change Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUserInfo;
