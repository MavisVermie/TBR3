import './App.css';
import React, { useState, useEffect } from "react";
import Layout from './Layout';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import CreatePostPage from './pages/PostsPages/CreatePostPage';
import SignInPage from './pages/LoginStuff/SignInPage';
import ProductDescriptionPage from './pages/ProductDescriptionPage';
import RegistrationPage from './pages/LoginStuff/RegistrationPage';
import PageNotFound from './pages/PageNotFound';
import ProfilePage from './pages/ProfilePage';
import ForgotPassword from './pages/LoginStuff/ForgotPassword';
import ResetPassword from './pages/LoginStuff/ResetPassword';
import MyPosts from './pages/PostsPages/MyPosts';
import AdminPanel from './pages/AdminStuff/AdminPanel';
import AdminPosts from './pages/AdminStuff/AdminPosts';
import SinglePost from './pages/PostsPages/SinglePost';
import NewHome from './pages2/Home';

import { toast, ToastContainer, cssTransition } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const SlowFade = cssTransition({
  enter: 'fadeIn',
  exit: 'fadeOut',
  duration: [300, 100], 
});

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkAuthenticated = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setIsAuthenticated(false);
        setLoading(false);
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
      setLoading(false);
    } catch (err) {
      console.error("checkAuthenticated error:", err.message);
      setIsAuthenticated(false);
      setLoading(false);
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
        autoClose={2000}
        hideProgressBar={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss={false}
        pauseOnHover={false}
        transition={SlowFade}
      />
      <BrowserRouter>
        <Layout setAuth={setAuth} isAuthenticated={isAuthenticated} checkAuthenticated={checkAuthenticated}>
          <Routes>
            <Route path="/" element={isAuthenticated ? <HomePage /> : <SignInPage setAuth={setAuth} />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/create_post" element={isAuthenticated ? <CreatePostPage /> : <SignInPage setAuth={setAuth} />} />
            <Route path="/profile" element={isAuthenticated ? <ProfilePage isAuthenticated={isAuthenticated} checkAuthenticated={checkAuthenticated} /> : <SignInPage setAuth={setAuth} />} />
            <Route path="/authentication/login" element={isAuthenticated ? <Navigate to="/" /> : <SignInPage setAuth={setAuth} />} />
            <Route path="/authentication/registration" element={isAuthenticated ? <Navigate to="/" /> : <RegistrationPage setAuth={setAuth} />} />
            <Route path="/product-description" element={<ProductDescriptionPage />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/myposts" element={isAuthenticated ? <MyPosts /> : <SignInPage setAuth={setAuth} />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/admin/posts" element={<AdminPosts />} />
            <Route path="/posts/:id" element={<SinglePost />} />
            <Route path="/*" element={<PageNotFound />} />
                        <Route path="/Home" element={<NewHome />} />

          </Routes>
        </Layout>
      </BrowserRouter>
    </div>
  );
}

export default App;