import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const RegistrationPage = ({ setAuth }) => {
  const navigate = useNavigate();
  const [inputs, setInputs] = useState({
    username: '',
    email: '',
    password: '',
    phone_number: ''
  });

  const { username, email, password, phone_number } = inputs;

  const onChange = (e) => {
    setInputs({ ...inputs, [e.target.name]: e.target.value });
  };

  const onSubmitForm = async (e) => {
    e.preventDefault();

    const jordanPhoneRegex = /^(?:\+9627\d{8}|07\d{8})$/;
    if (!jordanPhoneRegex.test(phone_number)) {
      toast.error("Phone number must be in format +9627XXXXXXXX or 07XXXXXXXX");
      return;
    }

    const formattedPhone =
      phone_number.startsWith("07") ? "+962" + phone_number.slice(1) : phone_number;

    try {
      const body = {
        username,
        email,
        password,
        phone_number: formattedPhone
      };

      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/authentication/registration`,
        {
          method: 'POST',
          headers: {
            'Content-type': 'application/json'
          },
          body: JSON.stringify(body)
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
      <div className="w-full md:w-2/3 flex flex-col items-center justify-center bg-gray-100 px-4 py-8  font-sans">
        <h2 className="text-3xl font-bold text-green-600 mb-10">Registration</h2>
        <form onSubmit={onSubmitForm} className="w-full max-w-md space-y-3">
          {['username', 'email', 'password', 'phone_number'].map((field, index) => (
            <input
              key={index}
              type={field === 'email' ? 'email' : field === 'password' ? 'password' : field === 'phone_number' ? 'tel' : 'text'}
              name={field}
              value={inputs[field]}
              onChange={onChange}
              placeholder={
                field === 'username' ? 'Full Name'
                : field === 'phone_number' ? 'e.g. +9627XXXXXXXX or 07XXXXXXXX'
                : field.charAt(0).toUpperCase() + field.slice(1)
              }
              className="w-full px-4 py-2 border rounded-full transition duration-200 outline-none
                focus:border-green-500 focus:ring-2 focus:ring-green-400
                hover:ring-2 hover:ring-green-400"
              required={field !== 'phone_number'}
            />
          ))}

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
        <img
          src="/reg.jpg"
          alt="Side"
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );
};

export default RegistrationPage;