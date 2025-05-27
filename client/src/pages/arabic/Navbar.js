import { Link } from "react-router-dom";
import { Disclosure, Menu, Transition } from '@headlessui/react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import logo from '../../assets/T.png';
import profile from '../../assets/profilepic.png';
import React, { Fragment, useState, useEffect } from "react";
import { toast } from 'react-toastify';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function Navbar({ setAuth, isAuthenticated }) {
  const [name, setName] = useState("");

  useEffect(() => {
    const getProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${process.env.REACT_APP_API_URL}/Posting/`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });
        const parseData = await res.json();
        setName(parseData[0]?.username || "");
      } catch (err) {
        console.error(err.message);
      }
    };
    getProfile();
  }, []);

  const logout = (e) => {
    e.preventDefault();
    try {
      localStorage.removeItem("token");
      setAuth(false);
      toast.success("تم تسجيل الخروج بنجاح");
    } catch (err) {
      console.error(err.message);
    }
  };

  const navigation = [
    { name: 'الرئيسية', href: '/' },
    { name: 'مخصص لي', href: '/feed' },
    { name: 'إنشاء حساب', href: '/create_post' },
    ...(isAuthenticated ? [{ name: 'منشوراتي', href: '/myposts' }] : []),
    { name: 'معلومات عنا', href: '/about' },
  ];

  return (
    <Disclosure as="nav" className="bg-green-700 z-50">
      {({ open }) => (
        <>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 font-sans">
            <div className="flex h-16 items-center justify-between">
              {/* زر القائمة في الجوال */}
              <div className="flex sm:hidden">
                <Disclosure.Button className="p-2 rounded-md text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white">
                  <span className="sr-only">تبديل القائمة</span>
                  {open ? (
                    <XMarkIcon className="h-6 w-6" />
                  ) : (
                    <Bars3Icon className="h-6 w-6" />
                  )}
                </Disclosure.Button>
              </div>

              {/* الشعار والقائمة */}
              <div className="flex flex-1 items-center justify-between sm:justify-start">
                <img className="h-20 w-auto" src={logo} alt="تبرع" />

                <div className="hidden sm:flex sm:ml-10 space-x-8">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className="text-white text-base font-medium hover:text-green-400 hover:underline underline-offset-4 transition duration-200"
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>

              {/* أزرار الدخول/الحساب */}
              <div className="flex items-center space-x-4">
                {isAuthenticated ? (
                  <Menu as="div" className="relative">
                    <Menu.Button className="flex items-center text-sm focus:outline-none">
                      <img
                        className="h-8 w-8 rounded-full border border-white"
                        src={profile}
                        alt="صورة المستخدم"
                      />
                    </Menu.Button>
                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-100"
                      enterFrom="transform opacity-0 scale-95"
                      enterTo="transform opacity-100 scale-100"
                      leave="transition ease-in duration-75"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95"
                    >
                      <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right bg-white/90 backdrop-blur-md rounded-md shadow-lg ring-1 ring-black ring-opacity-5">
                        <Menu.Item>
                          {({ active }) => (
                            <Link
                              to="/profile"
                              className={classNames(
                                active ? 'bg-green-100 text-green-700' : 'text-green-600',
                                'block px-4 py-2 text-sm'
                              )}
                            >
                              الملف الشخصي ({name || "مستخدم"})
                            </Link>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }) => (
                            <Link
                              to="/create_post"
                              className={classNames(
                                active ? 'bg-green-100 text-green-700' : 'text-green-600',
                                'block px-4 py-2 text-sm'
                              )}
                            >
                              إنشاء منشور
                            </Link>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              onClick={logout}
                              className={classNames(
                                active ? 'bg-green-100 text-green-700' : 'text-green-600',
                                'w-full text-right px-4 py-2 text-sm'
                              )}
                            >
                              تسجيل الخروج
                            </button>
                          )}
                        </Menu.Item>
                      </Menu.Items>
                    </Transition>
                  </Menu>
                ) : (
                  <>
                    <Link
                      to="/authentication/login"
                      className="rounded-full text-white border border-white px-4 py-1.5 font-semibold hover:bg-white hover:text-green-600 transition"
                    >
                      تسجيل الدخول
                    </Link>
                    <Link
                      to="/authentication/registration"
                      className="rounded-full bg-green-600 text-white px-4 py-1.5 font-semibold hover:bg-green-700 transition"
                    >
                      إنشاء حساب
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* قائمة الجوال */}
          <Disclosure.Panel className="sm:hidden px-4 pb-3 pt-2 backdrop-blur-md bg-white/10">
            {navigation.map((item) => (
              <Disclosure.Button
                key={item.name}
                as={Link}
                to={item.href}
                className="block text-white hover:text-green-400 hover:underline px-3 py-2 text-base font-medium transition"
              >
                {item.name}
              </Disclosure.Button>
            ))}
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
}
