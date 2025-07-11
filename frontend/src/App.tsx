import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Cook from './pages/Cook';
import Cookbook from './pages/Cookbook';
import Pricing from './pages/Pricing';
import Logout from './pages/Logout'; // ✅ This file must export `default`

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Landing page */}
        <Route path="/landing" element={<Landing />} />
        
        {/* Root redirects to landing */}
        <Route path="/" element={<Navigate to="/landing" replace />} />

        {/* Auth + main routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/cook" element={<Cook />} />
        <Route path="/cookbook" element={<Cookbook />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/logout" element={<Logout />} />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/landing" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
