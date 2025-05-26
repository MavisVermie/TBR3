import React, { Fragment, useState, useEffect } from 'react';
import { Disclosure, Menu, Transition } from '@headlessui/react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { SunIcon, MoonIcon } from '@heroicons/react/24/solid';
import { Link } from 'react-router-dom';
import logo from '../../assets/T.png';
import profile from '../../assets/profilepic.png';
import { toast } from 'react-toastify';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function Navbar({ setAuth, isAuthenticated }) {
  const [name, setName] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() =>
    document.documentElement.classList.contains("dark")
  );

  useEffect(() => {
    const getProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const res = await fetch("http://localhost:5000/Posting/", {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });
        const parseData = await res.json();
        setName(parseData[0]?.username || "");
        setIsAdmin(parseData[0]?.is_admin || false);
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
      toast.success("Successfully logged out");
    } catch (err) {
      console.error(err.message);
    }
  };

  const toggleDarkMode = () => {
    if (document.documentElement.classList.contains("dark")) {
      document.documentElement.classList.remove("dark");
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add("dark");
      setIsDarkMode(true);
    }
  };

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'My Feed', href: '/feed' },
    { name: 'Events', href: '/events' },
    { name: 'Create Post', href: '/create_post' },
    ...(isAuthenticated ? [{ name: 'My Posts', href: '/myposts' }] : []),
    ...(isAdmin ? [{ name: 'Admin Panel', href: '/admin' }] : []),
    { name: 'About Us', href: '/about' },
  ];

  return (
    <Disclosure as="nav" className="w-full bg-green-700 dark:bg-gray-900">
      {({ open }) => (
        <>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 font-sans">
            <div className="flex h-16 items-center justify-between">
              <div className="flex sm:hidden">
                <Disclosure.Button className="p-2 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-white">
                  <span className="sr-only">Toggle menu</span>
                  {open ? (
                    <XMarkIcon className="h-6 w-6" />
                  ) : (
                    <Bars3Icon className="h-6 w-6" />
                  )}
                </Disclosure.Button>
              </div>

              <div className="flex flex-1 items-center justify-between sm:justify-start">
                <Link to="/">
                  <img className="h-20 w-auto" src={logo} alt="TBR3" />
                </Link>
                <div className="hidden sm:flex sm:ml-10 space-x-8">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className="text-white dark:text-gray-200 text-base font-medium hover:text-green-400 hover:underline underline-offset-4 transition duration-200"
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <button
                  onClick={toggleDarkMode}
                  className="text-white hover:text-yellow-400 focus:outline-none"
                  title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
                  aria-label="Toggle Dark Mode"
                >
                  {isDarkMode ? (
                    <SunIcon className="h-6 w-6" />
                  ) : (
                    <MoonIcon className="h-6 w-6" />
                  )}
                </button>

                {isAuthenticated ? (
                  <Menu as="div" className="relative">
                    <Menu.Button className="flex items-center text-sm focus:outline-none">
                      <img
                        className="h-8 w-8 rounded-full border border-white"
                        src={profile}
                        alt="User Profile"
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
                      <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right bg-green-600/90 text-white backdrop-blur-md rounded-md shadow-lg ring-1 ring-black ring-opacity-5 dark:bg-gray-800 dark:text-gray-200">
                        <Menu.Item>
                          {({ active }) => (
                            <Link
                              to="/profile"
                              className={classNames(
                                active ? 'bg-green-500 dark:bg-green-700' : '',
                                'block px-4 py-2 text-sm'
                              )}
                            >
                              👤 {name || "User"} Profile
                            </Link>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }) => (
                            <Link
                              to="/myposts"
                              className={classNames(
                                active ? 'bg-green-500 dark:bg-green-700' : '',
                                'block px-4 py-2 text-sm'
                              )}
                            >
                              📝 My Posts
                            </Link>
                          )}
                        </Menu.Item>
                        {isAdmin && (
                          <Menu.Item>
                            {({ active }) => (
                              <Link
                                to="/admin/events"
                                className={classNames(
                                  active ? 'bg-green-500 dark:bg-green-700' : '',
                                  'block px-4 py-2 text-sm'
                                )}
                              >
                                🎫 Manage Events
                              </Link>
                            )}
                          </Menu.Item>
                        )}
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              onClick={logout}
                              className={classNames(
                                active ? 'bg-green-500 dark:bg-green-700' : '',
                                'w-full text-left px-4 py-2 text-sm'
                              )}
                            >
                              Sign out
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
                      Login
                    </Link>
                    <Link
                      to="/authentication/registration"
                      className="rounded-full bg-green-600 text-white px-4 py-1.5 font-semibold hover:bg-green-700 transition"
                    >
                      Register
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>

          <Disclosure.Panel className="sm:hidden px-4 pb-3 pt-2 bg-green-600/90 backdrop-blur-md rounded-b-md dark:bg-gray-800/90">
            {navigation.map((item) => (
              <Disclosure.Button
                key={item.name}
                as={Link}
                to={item.href}
                className="block text-white dark:text-gray-200 hover:text-green-400 hover:underline px-3 py-2 text-base font-medium transition"
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
