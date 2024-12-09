// src/App.js

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import Register from './components/Register';
import Login from './components/Login';
import Chatbot from './components/Chatbot';
import AdminDashboard from './components/AdminDashboard'; // Import AdminDashboard
import './App.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    // Initialize from localStorage
    const saved = localStorage.getItem('isLoggedIn');
    return saved === 'true' ? true : false;
  });

  const [accountType, setAccountType] = useState(() => {
    // Initialize from localStorage
    const saved = localStorage.getItem('accountType');
    return saved ? saved : null;
  });

  useEffect(() => {
    // Update localStorage whenever isLoggedIn or accountType changes
    localStorage.setItem('isLoggedIn', isLoggedIn);
    if (accountType) {
      localStorage.setItem('accountType', accountType);
    } else {
      localStorage.removeItem('accountType');
    }
  }, [isLoggedIn, accountType]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login setLoggedIn={setIsLoggedIn} setAccountType={setAccountType} />} />
        <Route path="/chatbot" element={<Chatbot isLoggedIn={isLoggedIn} />} />
        <Route path="/admin" element={<AdminDashboard />} /> {/* Admin Dashboard Route */}
      </Routes>
    </Router>
  );
}

export default App;
