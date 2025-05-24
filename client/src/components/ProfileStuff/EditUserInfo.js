import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const EditUserInfo = () => {
  const [profile, setProfile] = useState({
    username: '',
    email: '',
    phone_number: '',
    created_at: ''
  });

  const [passwords, setPasswords] = useState({
    new: '',
    confirm: ''
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch("http://localhost:5000/profile", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          }
        });

        if (!response.ok) throw new Error('Failed to fetch profile');

        const data = await response.json();
        const user = data[0];
        setProfile({
          username: user.username || '',
          email: user.email || '',
          phone_number: user.phone_number || '',
          created_at: user.created_at ? new Date(user.created_at).toLocaleString() : ''
        });
      } catch (err) {
        toast.error(err.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    getProfile();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (passwords.new && passwords.new !== passwords.confirm) {
      return toast.error("New passwords don't match");
    }

    try {
      const token = localStorage.getItem('token');
      const body = {
        ...profile,
        newPassword: passwords.new || undefined
      };

      const response = await fetch("http://localhost:5000/update-credentials", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile');
      }

      toast.success("Profile updated successfully");
      setPasswords({ new: '', confirm: '' });
    } catch (err) {
      toast.error(err.message || "Update failed");
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
    <div className="max-w-6xl mx-auto px-4 py-8 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Edit Profile */}
        <div className="bg-white shadow-xl rounded-2xl p-6 space-y-6 transition-transform duration-300 hover:scale-[1.02]">
          <h2 className="text-2xl font-bold text-center text-green-700">Edit Profile</h2>
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            {['username', 'email', 'phone_number'].map((field) => (
              <div key={field}>
                <label className="block text-sm font-medium text-gray-700 capitalize mb-1">
                  {field.replace('_', ' ')}
                </label>
                <input
                  type={field === 'email' ? 'email' : 'text'}
                  name={field}
                  value={profile[field]}
                  onChange={handleInputChange}
                  className="w-full border rounded-xl py-2 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 shadow-sm transition"
                  placeholder={`Enter your ${field.replace('_', ' ')}`}
                />
              </div>
            ))}


            <div className="text-right">
              <button
                type="submit"
                className="bg-green-600 text-white font-semibold px-6 py-2 rounded-xl hover:bg-green-700 transition-all shadow"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>

        {/* Change Password */}
        <div className="bg-white shadow-xl rounded-2xl p-6 space-y-6 transition-transform duration-300 hover:scale-[1.02]">
          <h2 className="text-2xl font-bold text-center text-green-700">Change Password</h2>
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            {['new', 'confirm'].map((type) => (
              <div key={type}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {type === 'new' ? 'New Password' : 'Confirm Password'}
                </label>
                <input
                  type="password"
                  name={type}
                  value={passwords[type]}
                  onChange={handlePasswordInputChange}
                  placeholder={`${type === 'new' ? 'Enter new' : 'Confirm new'} password`}
                  className="w-full border rounded-xl py-2 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 shadow-sm transition"
                  required={type === 'new'}
                />
              </div>
            ))}

            <div className="text-right">
              <button
                type="submit"
                className="bg-green-600 text-white font-semibold px-6 py-2 rounded-xl hover:bg-green-700 transition-all shadow"
              >
                Update Password
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
};

export default EditUserInfo;
