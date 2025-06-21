import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const RegistrationPage = ({ setAuth }) => {
  const navigate = useNavigate();

  const [inputs, setInputs] = useState({
    username: '',
    email: '',
    password: '',
    phone_number: '',
  });

  const [otp, setOtp] = useState('');
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [isSending, setIsSending] = useState(false);

  const { username, email, password, phone_number } = inputs;

  const jordanPhoneRegex = /^(?:\+9627\d{8}|07\d{8})$/;

  const onChange = (e) => {
    setInputs({ ...inputs, [e.target.name]: e.target.value });
  };

  const sendOtp = async () => {
    if (!jordanPhoneRegex.test(phone_number)) {
      toast.error("Phone number must be in format +9627XXXXXXXX or 07XXXXXXXX");
      return;
    }

    if (cooldown > 0) {
      toast.warn(`Please wait ${cooldown} seconds before resending`);
      return;
    }

    const formattedPhone =
      phone_number.startsWith('07') ? '+962' + phone_number.slice(1) : phone_number;

    try {
      setIsSending(true);

      // 🔒 Check if phone is already registered
      const checkRes = await fetch(`${process.env.REACT_APP_API_URL}/api/users/check-phone`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: formattedPhone }),
      });

      const checkData = await checkRes.json();

      if (!checkRes.ok || !checkData.success) {
        throw new Error(checkData.error || 'Phone already registered');
      }

      // ✅ Send OTP if not registered or if bypassed
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/verify/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: formattedPhone }),
      });

      if (!res.ok) throw new Error(await res.text());

      setOtpSent(true);
      toast.success('OTP sent to your phone');

      // ⏳ Start 60-second cooldown
      setCooldown(60);
      const interval = setInterval(() => {
        setCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

    } catch (err) {
      toast.error('Error: ' + err.message);
    } finally {
      setIsSending(false);
    }
  };

  const verifyOtp = async () => {
    const formattedPhone =
      phone_number.startsWith('07') ? '+962' + phone_number.slice(1) : phone_number;

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/verify/check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: formattedPhone, code: otp }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success('Phone verified successfully');
        setPhoneVerified(true);
      } else {
        toast.error('Verification failed: ' + (data.error || 'Invalid code'));
      }
    } catch (err) {
      toast.error('Verification error: ' + err.message);
    }
  };

  const onSubmitForm = async (e) => {
    e.preventDefault();

    if (!phoneVerified) {
      toast.error('Please verify your phone number first');
      return;
    }

    const formattedPhone =
      phone_number.startsWith('07') ? '+962' + phone_number.slice(1) : phone_number;

    try {
      const body = { username, email, password, phone_number: formattedPhone };

      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/authentication/registration`,
        {
          method: 'POST',
          headers: { 'Content-type': 'application/json' },
          body: JSON.stringify(body),
        }
      );

      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(errorMessage);
      }

      const parseRes = await response.json();

      if (parseRes.jwtToken) {
        localStorage.setItem('token', parseRes.jwtToken);
        setAuth(true);
        toast.success('Registered Successfully');
        navigate('/feed');
      } else {
        setAuth(false);
        toast.error('Error: Unable to register');
      }
    } catch (err) {
      console.error('Error:', err.message);
      toast.error('Error: Unable to register');
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left side (Form) */}
      <div className="w-full md:w-2/3 flex flex-col items-center justify-center bg-gray-100 px-4 py-8 font-sans">
        <h2 className="text-3xl font-bold text-green-600 mb-10">Registration</h2>
        <form onSubmit={onSubmitForm} className="w-full max-w-md space-y-3">
          {['username', 'email', 'password'].map((field, index) => (
            <input
              key={index}
              type={field === 'email' ? 'email' : field === 'password' ? 'password' : 'text'}
              name={field}
              value={inputs[field]}
              onChange={onChange}
              placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
              className="w-full px-4 py-2 border rounded-full outline-none transition duration-200
                focus:border-green-500 focus:ring-2 focus:ring-green-400
                hover:ring-2 hover:ring-green-400"
              required
            />
          ))}

          {/* Phone Number Input + OTP Button */}
          <div className="flex items-center gap-2">
            <input
              type="tel"
              name="phone_number"
              value={phone_number}
              onChange={onChange}
              placeholder="e.g. +9627XXXXXXXX or 07XXXXXXXX"
              className="w-full px-4 py-2 border rounded-full outline-none transition duration-200
                focus:border-green-500 focus:ring-2 focus:ring-green-400
                hover:ring-2 hover:ring-green-400"
              required
            />
            <button
              type="button"
              onClick={sendOtp}
              disabled={cooldown > 0 || isSending}
              className={`px-4 py-2 text-white rounded-full transition duration-200 ${
                cooldown > 0 || isSending
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600'
              }`}
            >
              {isSending
                ? 'Sending...'
                : cooldown > 0
                ? `Resend in ${cooldown}s`
                : 'Send OTP'}
            </button>
          </div>

          {/* OTP Input + Verify */}
          {otpSent && !phoneVerified && (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter OTP"
                className="w-full px-4 py-2 border rounded-full outline-none transition duration-200
                  focus:border-green-500 focus:ring-2 focus:ring-green-400
                  hover:ring-2 hover:ring-green-400"
              />
              <button
                type="button"
                onClick={verifyOtp}
                className="px-4 py-2 bg-green-500 text-white rounded-full hover:bg-green-600"
              >
                Verify
              </button>
            </div>
          )}

          {phoneVerified && (
            <p className="text-sm text-green-600 font-medium">✅ Phone verified</p>
          )}

          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-full font-semibold transition duration-200"
          >
            Create Account
          </button>
        </form>

        <p className="text-sm text-center mt-3 text-gray-700">
          Already have an account?{' '}
          <Link to="/authentication/login" className="underline font-medium text-green-600">
            Log in
          </Link>
        </p>
      </div>

      {/* Right side (Image) */}
      <div className="hidden md:block md:w-1/3">
        <img src="/reg.jpg" alt="Side" className="w-full h-full object-cover" />
      </div>
    </div>
  );
};

export default RegistrationPage;
