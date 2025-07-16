import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

// Simple auth context (could improve with Context API or Redux)
const App: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    fetch('/api/user-info', {
      credentials: 'include', // important for cookie session
    })
      .then(res => {
        if (res.ok) return res.json();
        throw new Error('Not authenticated');
      })
      .then(() => {
        setLoggedIn(true);
        setLoading(false);
      })
      .catch(() => {
        setLoggedIn(false);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <Router>
      <Routes>
        {/* If user logged in, redirect landing & login to dashboard */}
        <Route
          path="/landing"
          element={loggedIn ? <Navigate to="/dashboard" replace /> : <Landing />}
        />
        <Route
          path="/login"
          element={loggedIn ? <Navigate to="/dashboard" replace /> : <Login />}
        />

        {/* Dashboard protected route */}
        <Route
          path="/dashboard"
          element={loggedIn ? <Dashboard /> : <Navigate to="/landing" replace />}
        />

        {/* Default root redirect */}
        <Route
          path="/"
          element={loggedIn ? <Navigate to="/dashboard" replace /> : <Navigate to="/landing" replace />}
        />

        {/* Catch-all redirect to landing */}
        <Route path="*" element={<Navigate to="/landing" replace />} />
      </Routes>
    </Router>
  );
};

export default App;

