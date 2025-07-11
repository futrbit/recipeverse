import React from 'react';
import { Link } from 'react-router-dom';

export default function Pricing() {
  return (
    <>
      <header style={headerStyle}>
        <img src="/static/logo.png" alt="RecipeVerse Logo" style={{ height: 50 }} />
        <nav>
          <Link to="/">Home</Link>
          <Link to="/login">Log In</Link>
          <Link to="/signup">Sign Up</Link>
        </nav>
      </header>
      <main style={containerStyle}>
        <h1>Subscription Plans</h1>
        <p>Upgrade to Premium and enjoy unlimited recipe generation with no credit limits.</p>
        <div style={planStyle}>
          <h2>Free</h2>
          <ul>
            <li>3 recipe credits per day</li>
            <li>Basic recipe generation</li>
            <li>Access to Cookbook</li>
          </ul>
          <p style={{ fontWeight: 'bold' }}>Free</p>
        </div>
        <div style={planStyle}>
          <h2>Premium</h2>
          <ul>
            <li>Unlimited recipe generation</li>
            <li>Priority support</li>
            <li>Exclusive recipes and features</li>
          </ul>
          <p style={{ fontWeight: 'bold' }}>$5.99/month</p>
          <Link to="/checkout" style={btnStyle}>Upgrade Now</Link>
        </div>
      </main>
      <footer style={footerStyle}>Made with ❤️ by RecipeVerse · © 2025</footer>
    </>
  );
}

const planStyle = {
  border: '1px solid #ccc',
  borderRadius: 8,
  padding: '1rem',
  marginBottom: '1rem',
  maxWidth: 400,
};
