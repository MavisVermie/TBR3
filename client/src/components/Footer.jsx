import React from 'react';
import './Footer.css';
import { FaGithub, FaFacebook, FaTwitter, FaInstagram } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <h3>من نحن؟</h3>
        <p>الأردن - جامعة آل البيت - كلية تكنولوجيا المعلومات - فريق Syntax Squad</p>
        <div className="footer-socials">
          <a href="#"><FaFacebook /></a>
          <a href="#"><FaTwitter /></a>
          <a href="#"><FaInstagram /></a>
          <a href="#"><FaGithub /></a>
        </div>
        <p className="footer-copy">جميع الحقوق محفوظة &copy; 2025</p>
      </div>
    </footer>
  );
};

export default Footer;
