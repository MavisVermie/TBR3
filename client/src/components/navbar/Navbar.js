import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, Transition } from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import logo from "../../assets/T.png";
import profile from "../../assets/profilepic.png";
import React, { Fragment, useEffect, useState, useRef } from "react";
import { toast } from "react-toastify";
import { jwtDecode } from "jwt-decode";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function Navbar({ setAuth, isAuthenticated }) {
  const [username, setUsername] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const menuRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const decoded = jwtDecode(token);
      setIsAdmin(Boolean(decoded.isAdmin) === true);
      if (decoded.username) setUsername(decoded.username);
    } catch (err) {
      console.error("Failed to decode token:", err);
      setIsAdmin(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    setIsAdmin(false);
    setAuth(false);
    toast.success("Logged out");
    navigate("authentication/login");
  };

  const toggleLanguage = () => {
    const path = location.pathname;
    const newPath = path.startsWith("/ar") ? path.replace("/ar", "") || "/" : "/ar" + path;
    navigate(newPath);
  };

  const navigation = [
    { name: "Home", href: "/" },
    { name: "My Feed", href: "/feed" },
    { name: "Events", href: "/events" },
    { name: "Create Post", href: "/create_post" },
    ...(isAuthenticated ? [{ name: "My Posts", href: "/myposts" }] : []),
    { name: "About Us", href: "/about" },
  ];

  return (
    <nav className="w-full bg-green-700 relative shadow-md z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-0 font-sans">
        <div className="flex h-20 items-center justify-between w-full">

          {/* Menu Button and Logo */}
          <div className="flex items-center space-x-4">
            {/* Mobile/Tablet menu button */}
            <div className="md:hidden">
              <button
                className="p-2 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-white"
                onClick={() => setIsMenuOpen(true)}
              >
                <Bars3Icon className="h-7 w-7" />
              </button>
            </div>

            <Link to="/" onClick={() => setIsMenuOpen(false)}>
              <img
                src={logo}
                alt="Logo"
                className="h-16 md:h-24 w-auto transition-all duration-300 cursor-pointer mr-10 "
              />
            </Link>
          </div>

          {/* Navigation - Center */}
          <div className="hidden lg:flex flex-1 justify-start space-x-8">
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

          {/* Buttons - Right */}
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleLanguage}
              className="rounded-full bg-white text-green-700 px-3 py-1.5 font-semibold hover:bg-green-100 transition"
            >
              العربية
            </button>

            {isAuthenticated ? (
              <Menu as="div" className="relative">
                <Menu.Button className="flex items-center text-sm focus:outline-none">
                  <img
                    className="h-8 w-8 rounded-full border border-white"
                    src={profile}
                    alt="User"
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
                  <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right bg-green-600/90 text-white backdrop-blur-md rounded-md shadow-lg ring-1 ring-black ring-opacity-5">
                    <Menu.Item>
                      {({ active }) => (
                        <Link
                          to="/profile"
                          className={classNames(
                            active ? "bg-green-500" : "",
                            "block px-4 py-2 text-sm"
                          )}
                        >
                          👤 {username} Profile
                        </Link>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <Link
                          to="/myposts"
                          className={classNames(
                            active ? "bg-green-500" : "",
                            "block px-4 py-2 text-sm"
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
                            to="/admin"
                            className={classNames(
                              active ? "bg-green-500" : "",
                              "block px-4 py-2 text-sm"
                            )}
                          >
                            🛠️ Admin Panel
                          </Link>
                        )}
                      </Menu.Item>
                      
                    )}
                    <Menu.Item>
                            {({ active }) => (
                              <Link
                                to="/messages"
                                className={classNames(
                                  active ? "bg-green-500" : "",
                                  "block px-4 py-2 text-sm"
                                )}
                              >
                               🗪  My Messages
                              </Link>
                            )}
                          </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={logout}
                          className={classNames(
                            active ? "bg-green-500" : "",
                            "w-full text-left px-4 py-2 text-sm"
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

      {/* Slide-in menu for Mobile & Tablet */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-40 flex">
          {/* Overlay */}
          <div className="fixed inset-0 bg-black bg-opacity-30" />

          {/* Sidebar Panel */}
          <div
            ref={menuRef}
            className="relative bg-green-700 text-white w-64 h-full p-6 space-y-4 shadow-xl z-50 transition-all duration-300"
          >
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-semibold">Menu</span>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="text-white hover:text-green-300"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setIsMenuOpen(false)}
                className="block py-2 px-4 rounded hover:bg-green-600 transition"
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
