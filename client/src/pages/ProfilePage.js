import React, { useEffect, useState, useRef } from 'react';
import HomePage from './myFeed';
import { toast } from 'react-toastify';

export default function ProfilePage({ isAuthenticated, checkAuthenticated }) {
  const [inputs, setInputs] = useState({
    username: '',
    email: '',
    password: '',
    zip_code: ''
  });
  const [loading, setLoading] = useState(true);
  const { username, email, zip_code } = inputs;

  const emailRef = useRef(null);
  const zipCodeRef = useRef(null);
  const usernameRef = useRef(null);

  const onChange = e => setInputs({ ...inputs, [e.target.name]: e.target.value });

  const focusInput = (inputRef) => {
    if (inputRef && inputRef.current) {
      inputRef.current.focus();
    }
  };

  const getProfile = async () => {
    try {
      const res = await fetch('http://localhost:5000/Posting/', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${localStorage.token}`
        }
      });
      const parseData = await res.json();

      if (Array.isArray(parseData) && parseData.length > 0) {
        setInputs({
          username: parseData[0].username,
          zip_code: parseData[0].zip_code,
          email: parseData[0].email,
          password: ''
        });
      }
    } catch (err) {
      console.error("Error in getProfile:", err.message);
    }
  };

  const onSubmitCredentials = async (e) => {
    e.preventDefault();
    try {
      const body = { username, email, zip_code };
      const res = await fetch('http://localhost:5000/authentication/update-credentials', {
        method: 'PUT',
        headers: {
          'Content-type': 'application/json',
          Authorization: `Bearer ${localStorage.token}`
        },
        body: JSON.stringify(body)
      });

      if (!res.ok) throw new Error(await res.text());

      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(`Failed to update profile: ${err.message}`);
    }
  };

  useEffect(() => {
    const init = async () => {
      await checkAuthenticated();
      await getProfile();
      setLoading(false);
    };
    init();
  }, []);

  if (loading) return <div className="text-center text-gray-500 mt-20">Loading...</div>;

  return isAuthenticated ? (
    <section className="bg-gray-50 min-h-screen py-10 px-4 sm:px-10">
      <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-2xl p-8">
        <div className="flex flex-col md:flex-row md:items-start md:gap-10">
          {/* Profile Info */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left w-full md:w-1/3">
            <div className="w-30 h-32 bg-green-700 rounded-full overflow-hidden mb-4 shadow-md">
              <img src="profilepic.png" alt="Profile" className="w-full h-full object-cover" />
            </div>
            <h1 className="text-2xl font-bold text-gray-700">{username}</h1>
            <p className="text-gray-500">{email}</p>
          </div>

          {/* Update Form */}
          <div className="w-full md:w-2/3 mt-6 md:mt-0">
            <h2 className="text-lg font-semibold text-green-600 mb-4">Update Profile</h2>
            <form onSubmit={onSubmitCredentials} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Email</label>
                <div className="flex gap-2">
                  <input
                    ref={emailRef}
                    type="email"
                    name="email"
                    value={email}
                    onChange={onChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Email"
                  />
                  <button type="button" onClick={() => focusInput(emailRef)} className="text-green-600 hover:underline">Change</button>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Zip Code</label>
                <div className="flex gap-2">
                  <input
                    ref={zipCodeRef}
                    type="text"
                    name="zip_code"
                    value={zip_code}
                    onChange={onChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Zip Code"
                  />
                  <button type="button" onClick={() => focusInput(zipCodeRef)} className="text-green-600 hover:underline">Change</button>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Username</label>
                <div className="flex gap-2">
                  <input
                    ref={usernameRef}
                    type="text"
                    name="username"
                    value={username}
                    onChange={onChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Username"
                  />
                  <button type="button" onClick={() => focusInput(usernameRef)} className="text-green-600 hover:underline">Change</button>
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-green-600 text-white py-2 rounded-xl font-semibold hover:bg-green-700 transition-all"
              >
                Update Profile
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  ) : (
    <HomePage />
  );
} 
