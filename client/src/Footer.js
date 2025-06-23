import React from 'react';
import { Link } from 'react-router-dom';
import logo from './assets/TB.png'; 

export default function Footer() {
  return (
    <footer className="bg-black text-gray-300 py-8">
      <div className="max-w-screen-xl mx-auto px-4 flex flex-col md:flex-row justify-between items-start md:items-center space-y-6 md:space-y-0 text-sm">
       

        {/* Navigation Links */}
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          <Link to="/about" className="hover:underline">About Us</Link>
          <Link to="/Privacy-Policy" className="hover:underline">Privacy Policy</Link>
          <Link to="/terms" className="hover:underline">Terms of Service</Link>
          <Link to="/contact" className="hover:underline">Contact Us</Link>
        </div>
  {/* Logo and Email */}
        <div className="flex flex-col items-start space-y-2">
          <img src={logo} alt="Logo" className="h-16" />
       </div>
      </div>
    </footer>
  );
}
