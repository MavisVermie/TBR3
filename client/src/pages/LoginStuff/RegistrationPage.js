import React, { useState } from 'react';
import { toast } from 'react-toastify';

export default function RegistrationPage({ setAuth }) {
  const [inputs, setInputs] = useState({
    username: '',
    email: '',
    password: '',
    zip_code: '',
    phone_number: ''
  });

  const { username, email, password, zip_code, phone_number } = inputs;

  const onChange = e =>
    setInputs({ ...inputs, [e.target.name]: e.target.value });

  const onSubmitForm = async e => {
    e.preventDefault();

    // ✅ Jordanian phone number validation
    const jordanPhoneRegex = /^(?:\+9627\d{8}|07\d{8})$/;

    if (!jordanPhoneRegex.test(phone_number)) {
      toast.error("Phone number must be in format +9627XXXXXXXX or 07XXXXXXXX");
      return;
    }

    // ✅ Format to +9627 if it starts with 07
    const formattedPhone =
      phone_number.startsWith("07") ? "+962" + phone_number.slice(1) : phone_number;

    try {
      const body = {
        username,
        password,
        email,
        zip_code,
        phone_number: formattedPhone
      };

      const response = await fetch(
        'http://localhost:5000/authentication/registration',
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
    <div className="bg-grey-lighter min-h-screen flex flex-col">
      <div className="container max-w-sm mx-auto flex-1 flex flex-col items-center justify-center px-4">
        <div className="bg-white px-6 py-8 rounded shadow-md text-black w-full">
          <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-green-600">
            Registration
          </h2>

          <div className="mt-10">
            <form onSubmit={onSubmitForm}>
              <input
                type="text"
                className="block border border-grey-light w-full p-3 rounded mb-4"
                name="username"
                value={username}
                placeholder="Full Name"
                onChange={onChange}
                required
              />

              <input
                type="email"
                className="block border border-grey-light w-full p-3 rounded mb-4"
                name="email"
                value={email}
                placeholder="Email"
                onChange={onChange}
                required
              />

              <input
                type="password"
                className="block border border-grey-light w-full p-3 rounded mb-4"
                name="password"
                value={password}
                placeholder="Password"
                onChange={onChange}
                required
              />

              <input
                type="text"
                className="block border border-grey-light w-full p-3 rounded mb-4"
                name="zip_code"
                value={zip_code}
                placeholder="Zip Code"
                onChange={onChange}
                required
              />

              <input
                type="tel"
                className="block border border-grey-light w-full p-3 rounded mb-4"
                name="phone_number"
                value={phone_number}
                placeholder="e.g. +9627XXXXXXXX or 07XXXXXXXX"
                onChange={onChange}
                required
              />

              <button
                type="submit"
                className="mt-8 flex w-full justify-center rounded-md bg-green-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-green-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
              >
                Create Account
              </button>
            </form>
          </div>
        </div>

        <div className="text-green-600 mt-6">
          Already have an account?{' '}
          <a
            className="no-underline border-b border-blue text-green"
            href="/authentication/login"
          >
            Log in
          </a>
        </div>
      </div>
    </div>
  );
}
