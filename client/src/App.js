import './App.css';
import React, { useState, useEffect } from "react";
import Layout from './Layout';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import CreatePostPage from './pages/CreatePostPage';
import SignInPage from './pages/SignInPage';
import ProductDescriptionPage from './pages/ProductDescriptionPage';
import RegistrationPage from './pages/RegistrationPage';
import PageNotFound from './pages/PageNotFound'
import ProfilePage from './pages/ProfilePage';
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from 'react-toastify';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true); // track if verifying auth

const checkAuthenticated = async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      setIsAuthenticated(false);
      setLoading(false); // <- you forgot this
      return;
    }

    const res = await fetch("http://localhost:5000/authentication/verify", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    const parseRes = await res.json();

    if (parseRes === true) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
    setLoading(false); // <- important
  } catch (err) {
    console.error("checkAuthenticated error:", err.message);
    setIsAuthenticated(false);
    setLoading(false); // <- important
  }
};


  useEffect(() => {
    checkAuthenticated();
  }, []);

  const setAuth = (boolean) => {
    setIsAuthenticated(boolean);
  };

  if (loading) {
    return <div>Loading...</div>; 
  }

  return (
    <div className="App">
      <ToastContainer 
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <BrowserRouter>
        <Layout setAuth={setAuth} isAuthenticated={isAuthenticated} checkAuthenticated={checkAuthenticated}>
        <Routes>
  <Route path="/" element={isAuthenticated ? <HomePage /> : <SignInPage setAuth={setAuth} />} />
  <Route path="/about" element={<AboutPage />} />
  <Route path="/create_post" element={isAuthenticated ? <CreatePostPage /> : <SignInPage setAuth={setAuth} />} />
  <Route path="/profile" element={isAuthenticated ? <ProfilePage checkAuthenticated={checkAuthenticated} /> : <SignInPage setAuth={setAuth} />} />
  <Route path="/authentication/login" element={isAuthenticated ? <Navigate to="/" /> : <SignInPage setAuth={setAuth} />} />
  <Route path="/authentication/registration" element={isAuthenticated ? <Navigate to="/" /> : <RegistrationPage setAuth={setAuth} />} />
  <Route path="/product-description" element={<ProductDescriptionPage />} />
  <Route path="/*" element={<PageNotFound />} />
</Routes>
        </Layout>
      </BrowserRouter>
    </div>
  );
}

export default App;
