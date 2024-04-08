// App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import NavBar from './Components/NavBar';
import Contact from './Components/Contact';
import Login from './Components/Login';
import About from './Components/About';
import HeroSection from './Components/HeroSection';
import Footer from './Components/Footer';
import SignUp from './Components/SignUp';
import ImageCarousel from './Components/ImageCarousel';
import HomePage from './Components/HomePage';
import ProtectedRoute from './Components/ProtectedRoute';
import { AuthProvider } from './Contexts/AuthContext';
import PrivacyPolicy from './Components/PrivacyPolicy';
import PlacesRecommended from './Components/PlacesRecommended';
import ChatRoom from './Components/ChatRoom';
import ProfileSetup from './Components/ProfileSetup';
import ChatList from './Components/ChatList';

function App() {
  return (
    <AuthProvider> {/* Wrap the entire Router with AuthProvider */}
      <Router>
        <NavBar />
        <Routes>
          <Route path="/" element={
            <>
              <HeroSection />
              <ImageCarousel />
         
              
              
            </>
          } />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacypolicy" element={<PrivacyPolicy />} />
          <Route path="/placesrecommended" element={<PlacesRecommended />} />
          <Route path="/chatroom/:chatId" element={<ChatRoom />} />
          <Route path="/profilesetup" element={<ProfileSetup />} />
          <Route path="/chats" element={<ChatList />} />
          



          {/* Protected routes */}

          <Route path="/userprofile" element={
            <ProtectedRoute>
              <ProfileSetup />
            </ProtectedRoute>
          } />
          <Route path="/homepage" element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          } />
        </Routes>
        <Footer />
      </Router>
    </AuthProvider>
  );
}

export default App;