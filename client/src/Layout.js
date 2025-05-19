import React from 'react';
import Navbar from './Navbar.js';
import Footer from './Footer.js';

export default function Layout({ children, setAuth, isAuthenticated, checkAuthenticated }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar setAuth={setAuth} isAuthenticated={isAuthenticated} checkAuthenticated={checkAuthenticated} />

      {}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {children}
      </main>

      <Footer />
    </div>
  );
}