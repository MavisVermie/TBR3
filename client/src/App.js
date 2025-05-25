import './App.css';
import React, { useState, useEffect } from "react";
import Layout from './Layout';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import HomePage from './pages/myFeed';
import AboutPage from './pages/AboutPage';
import CreatePostPage from './pages/PostsPages/CreatePostPage';
import SignInPage from './components/LoginStuff/SignInPage';
import RegistrationPage from './components/LoginStuff/RegistrationPage';
import PageNotFound from './pages/PageNotFound'
import ProfilePage from './pages/ProfilePage';
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from 'react-toastify';
import ForgotPassword from './components/LoginStuff/ForgotPassword';
import ResetPassword from './components/LoginStuff/ResetPassword';
import AdminPanel from './pages/AdminStuff/AdminPanel';
import AdminPosts from './pages/AdminStuff/AdminPosts';
import NewHome from './pages/Home';
import SinglePost from './pages/PostsPages/SinglePostPage';
import EditPostPage from './pages/PostsPages/EditPostPage';
import MyPostsPage from "./pages/PostsPages/MyPostsPage";
import PrivacyPolicy from './pages/PrivacyPolicy';
import { cssTransition } from "react-toastify";
<<<<<<< HEAD
=======

import MyFeed from './pages/myFeed';


>>>>>>> f21ee20f9ffd6b9c3968b1f7c1f788153d6ba696
import TermsOfService from './pages/TermsOfService';
import ContactUs from './pages/ContactUs';
import UserProfilePage from './pages/UserProfilePage';
import EventForm from './components/events/EventForm';
import ShowEvent from './components/events/showEvent';
import Events from './pages/Events';
<<<<<<< HEAD
=======

>>>>>>> f21ee20f9ffd6b9c3968b1f7c1f788153d6ba696
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
            <Route path="/" element={<NewHome />}/>
            <Route path="/feed" element={isAuthenticated ? <HomePage /> : <SignInPage setAuth={setAuth} />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/create_post" element={isAuthenticated ? <CreatePostPage /> : <SignInPage setAuth={setAuth} />} />
            <Route path="/profile" element={isAuthenticated ? <ProfilePage isAuthenticated={isAuthenticated} checkAuthenticated={checkAuthenticated} /> : <SignInPage setAuth={setAuth} />} />
            <Route path="/authentication/login" element={isAuthenticated ? <Navigate to="/" /> : <SignInPage setAuth={setAuth} />} />
            <Route path="/authentication/registration" element={isAuthenticated ? <Navigate to="/" /> : <RegistrationPage setAuth={setAuth} />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            {/* <Route path="/myposts" element={isAuthenticated ? <MyPosts /> : <SignInPage setAuth={setAuth} />} /> */}
           <Route path="/edit_post/:id" element={isAuthenticated ? <EditPostPage /> : <SignInPage setAuth={setAuth} />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/admin/posts" element={<AdminPosts />} />
            <Route path="/posts/:id" element={<SinglePost />} />
            <Route path="/myposts" element={<MyPostsPage />} /> //rama posts
            <Route path="/*" element={<PageNotFound />} />
            <Route path="/home" element={<NewHome />} />
<<<<<<< HEAD
=======

            <Route path="/" element={<Homepage />} />
            
>>>>>>> f21ee20f9ffd6b9c3968b1f7c1f788153d6ba696
            <Route path="/user/:userId" element={<UserProfilePage />} />
            <Route path="/Privacy-Policy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="/events" element={<Events />} />
            <Route path="/create-event" element={<EventForm />} />
            <Route path="/events/:id" element={<ShowEvent />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </div>
  );
}

export default App;