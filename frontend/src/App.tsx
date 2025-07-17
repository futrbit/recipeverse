import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Cookbook from './pages/Cookbook';
import Pricing from './pages/Pricing';


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
