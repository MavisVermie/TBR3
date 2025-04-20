import React from 'react';
import Navbar from './Navbar.js';
import Footer from './Footer.js';

export default function Layout({ children, setAuth, isAuthenticated, checkAuthenticated }) {
  return (
    <div>
      <Navbar setAuth={setAuth} isAuthenticated={isAuthenticated} checkAuthenticated={checkAuthenticated} />
      <main>{children}</main>
      <Footer/>
    </div>
  );
}
