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

    const jordanPhoneRegex = /^(?:\+9627\d{8}|07\d{8})$/;
    if (!jordanPhoneRegex.test(phone_number)) {
      toast.error("يجب أن يكون رقم الهاتف بالتنسيق +9627XXXXXXXX أو 07XXXXXXXX");
      return;
    }

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
        toast.success('تم التسجيل بنجاح');
      } else {
        setAuth(false);
        toast.error('خطأ: غير قادر على التسجيل');
      }
    } catch (err) {
      console.error('خطأ:', err.message);
      toast.error('خطأ: غير قادر على التسجيل');
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* الجانب الأيسر (النموذج) */}
      <div className="w-full md:w-2/3 flex flex-col items-center justify-center bg-gray-100 px-4 py-8 bg-gradient-to-br from-green-200 via-gray-100 to-green-100 font-sans">
        <h2 className="text-3xl font-bold text-green-600 mb-10">التسجيل</h2>
        <form onSubmit={onSubmitForm} className="w-full max-w-md space-y-3">
          {['username', 'email', 'password', 'phone_number', 'zip_code'].map((field, index) => (
            <input
              key={index}
              type={
                field === 'email' ? 'email' :
                field === 'password' ? 'password' :
                field === 'phone_number' ? 'tel' :
                'text'
              }
              name={field}
              value={inputs[field]}
              onChange={onChange}
              placeholder={
                field === 'username' ? 'الاسم الكامل' :
                field === 'phone_number' ? 'مثال: +9627XXXXXXXX أو 07XXXXXXXX' :
                field === 'zip_code' ? 'الرمز البريدي' :
                field.charAt(0).toUpperCase() + field.slice(1)
              }
              className="w-full px-4 py-2 border rounded-full transition duration-200 outline-none
                focus:border-green-500 focus:ring-2 focus:ring-green-400
                hover:ring-2 hover:ring-green-400"
              required={field !== 'zip_code'}
            />
          ))}
          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-full font-semibold transition duration-200"
          >
            إنشاء حساب
          </button>
        </form>
        <p className="text-sm text-center mt-3 text-gray-700">
          هل لديك حساب بالفعل؟{' '}
          <a href="/ar/authentication/login" className="underline font-medium text-green-600">
            تسجيل الدخول
          </a>
        </p>
      </div>

      {/* الجانب الأيمن (الصورة) */}
      <div className="hidden md:block md:w-1/3">
        <img
          src="/reg.jpg"
          alt="جانب"
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );
}
