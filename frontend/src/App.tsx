import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Landing from './pages/Landing.tsx';
import Dashboard from './pages/Dashboard.tsx';
import Cookbook from './pages/Cookbook.tsx';
import Pricing from './pages/Pricing.tsx';

const App: React.FC = () => {
  const isAuthenticated = !!localStorage.getItem('idToken');

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route
          path="/dashboard"
          element={isAuthenticated ? <Dashboard /> : <Navigate to="/" />}
        />
        <Route
          path="/cookbook"
          element={isAuthenticated ? <Cookbook /> : <Navigate to="/" />}
        />
        <Route
          path="/pricing"
          element={isAuthenticated ? <Pricing /> : <Navigate to="/" />}
        />
      </Routes>
    </Router>
  );
};

export default App;
