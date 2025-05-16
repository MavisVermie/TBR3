import { Link } from "react-router-dom";
import { Disclosure, Menu, Transition } from '@headlessui/react'
import { Bars3Icon, BellIcon, XMarkIcon } from '@heroicons/react/24/outline'
import freecyclelogo from './assets/freecyclelogo.png'
import freecyclelogo2 from './assets/logo2.png'
import React, { Fragment, useState, useEffect } from "react";
import { toast } from 'react-toastify';

const navigation = [
  { name: 'My Feed', href: '/', current: false },
  { name: 'Create Post', href: '/create_post', current: false },
  { name: 'About Us', href: '/about', current: false },
]

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function Navbar({ setAuth, isAuthenticated, checkAuthenticated }) {
  const [name, setName] = useState("");

  const getProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/Posting/", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`
        },
      });

      const parseData = await res.json();
      setName(parseData[0].username);
    } catch (err) {
      console.error(err.message);
    }
  };

  const logout = async (e) => {
    e.preventDefault();
    try {
      localStorage.removeItem("token");
      setAuth(false);
      toast.success("Successfully logged out");
    } catch (err) {
      console.error(err.message);
    }
  };

  useEffect(() => {
    getProfile();
  }, []);

  return (
    <Disclosure as="nav" className="bg-green-600 shadow-md">
      {({ open }) => (
        <>
          <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
            <div className="relative flex h-16 items-center justify-between">
              <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                <Disclosure.Button className="inline-flex items-center justify-center rounded-md p-2 text-white hover:bg-green-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </Disclosure.Button>
              </div>
              <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
                <div className="flex flex-shrink-0 items-center">
                  <img
                    className="h-12 w-auto"
                    src={freecyclelogo}
                    alt="FREEcycle"
                  />
                </div>
                <div className="hidden sm:ml-8 sm:block">
                  <div className="flex space-x-4">
                    {navigation.map((item) => (
                      <a
                        key={item.name}
                        href={item.href}
                        className={classNames(
                          item.current
                            ? 'text-white bg-green-700'
                            : 'text-white hover:text-green-200 hover:bg-green-700',
                          'rounded-md px-4 py-2 text-sm font-medium transition duration-200 ease-in-out'
                        )}
                        aria-current={item.current ? 'page' : undefined}
                      >
                        {item.name}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
                {isAuthenticated ? (
                  <Menu as="div" className="relative ml-3">
                    <div>
                      <Menu.Button className="relative flex rounded-full bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
                        <span className="sr-only">Open user menu</span>
                        <img
                          className="h-8 w-8 rounded-full"
                          src={freecyclelogo2}
                          alt="User Profile"
                        />
                      </Menu.Button>
                    </div>
                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-100"
                      enterFrom="transform opacity-0 scale-95"
                      enterTo="transform opacity-100 scale-100"
                      leave="transition ease-in duration-75"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95"
                    >
                      <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                        <Menu.Item>
                          {({ active }) => (
                            <a
                              href="/profile"
                              className={classNames(
                                active ? 'bg-green-50 text-green-700' : 'text-green-600',
                                'block px-4 py-2 text-sm hover:bg-green-100 transition'
                              )}
                            >
                              {name} Profile
                            </a>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }) => (
                            <a
                              href="/create_post"
                              className={classNames(
                                active ? 'bg-green-50 text-green-700' : 'text-green-600',
                                'block px-4 py-2 text-sm hover:bg-green-100 transition'
                              )}
                            >
                              Create Post
                            </a>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }) => (
                            <a
                              onClick={(e) => logout(e)}
                              href="/"
                              className={classNames(
                                active ? 'bg-green-50 text-green-700' : 'text-green-600',
                                'block px-4 py-2 text-sm hover:bg-green-100 transition'
                              )}
                            >
                              Sign out
                            </a>
                          )}
                        </Menu.Item>
                      </Menu.Items>
                    </Transition>
                  </Menu>
                ) : (
                  <div className="space-x-4">
                    <a
                      href="/authentication/login"
                      className="inline-block rounded-full bg-white text-green-600 font-semibold py-2 px-5 border border-green-600 hover:bg-green-600 hover:text-white transition-all duration-300 shadow-sm"
                    >
                      Login
                    </a>
                    <a
                      href="/authentication/registration"
                      className="inline-block rounded-full bg-green-600 text-white font-semibold py-2 px-5 hover:bg-green-700 transition-all duration-300 shadow-sm"
                    >
                      Register
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>

          <Disclosure.Panel className="sm:hidden">
            <div className="space-y-1 px-2 pb-3 pt-2">
              {navigation.map((item) => (
                <Disclosure.Button
                  key={item.name}
                  as="a"
                  href={item.href}
                  className={classNames(
                    item.current
                      ? 'bg-green-800 text-white'
                      : 'text-white hover:bg-green-700 hover:text-green-200',
                    'block rounded-md px-3 py-2 text-base font-medium transition'
                  )}
                  aria-current={item.current ? 'page' : undefined}
                >
                  {item.name}
                </Disclosure.Button>
              ))}
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
}
