import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const headerStyle: React.CSSProperties = {
  background: '#fff',
  padding: '1rem 2rem',
  boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '1rem',
};

const containerStyle: React.CSSProperties = {
  maxWidth: 800,
  margin: '0 auto 3rem',
  padding: '2rem',
  background: '#fff',
  borderRadius: 10,
  boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
  textAlign: 'center',
  minHeight: '70vh',
};

const btnStyle: React.CSSProperties = {
  display: 'inline-block',
  padding: '0.8rem 1.5rem',
  margin: '0.5rem',
  backgroundColor: '#28a745',
  color: 'white',
  textDecoration: 'none',
  borderRadius: 5,
  fontWeight: 'bold',
  cursor: 'pointer',
  border: 'none',
};

const footerStyle: React.CSSProperties = {
  background: '#fff',
  padding: '1rem',
  textAlign: 'center',
  color: '#666',
  fontSize: '0.9rem',
  boxShadow: '0 -2px 5px rgba(0,0,0,0.1)',
  marginTop: 'auto',
};

const Dashboard: React.FC = () => {
  const [user, setUser] = useState<{ username: string; credits: number; subscription_status: string } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/user_credits', { withCredentials: true });
        setUser(response.data);
      } catch (err) {
        console.error('Failed to fetch user:', err);
      }
    };
    fetchUser();
  }, []);

  return (
    <>
      <header style={headerStyle}>
        <img src="/static/logo.png" alt="RecipeVerse Logo" style={{ height: 50 }} />
        <nav>
          <Link to="/" style={{ marginRight: 15 }}>Home</Link>
          <Link to="/cook" style={{ marginRight: 15 }}>Recipe Generator</Link>
          <Link to="/cookbook" style={{ marginRight: 15 }}>Cookbook</Link>
          <button onClick={() => navigate('/logout')} style={{ ...btnStyle, backgroundColor: '#dc3545' }}>
            Logout
          </button>
        </nav>
      </header>

      <main style={containerStyle}>
        {user ? (
          <>
            <h1>Welcome, {user.username}! 👋</h1>
            <p style={{ color: '#28a745', fontWeight: 'bold' }}>You have {user.credits} credits left.</p>
            {user.subscription_status === 'free' && (
              <p>
                <button
                  onClick={() => navigate('/pricing')}
                  style={{ background: 'none', border: 'none', color: '#28a745', cursor: 'pointer', fontWeight: 'bold', textDecoration: 'underline' }}
                >
                  Subscribe for unlimited recipes!
                </button>
              </p>
            )}
            <h2>About RecipeVerse</h2>
            <p>
              RecipeVerse is your go-to platform for crafting personalized recipes using AI.
              Choose your ingredients, dietary preferences, and spice levels to generate unique dishes in seconds.
              Whether you're a home cook or a food enthusiast, we're here to inspire your culinary adventures!
            </p>
            <div>
              <button onClick={() => navigate('/cook')} style={btnStyle}>Go to Recipe Generator</button>
              <button onClick={() => navigate('/cookbook')} style={{ ...btnStyle, backgroundColor: '#007bff' }}>View My Cookbook</button>
            </div>
          </>
        ) : (
          <>
            <h1>Welcome to RecipeVerse</h1>
            <p>Loading your data...</p>
          </>
        )}
      </main>

      <footer style={footerStyle}>
        Made with ❤️ by RecipeVerse · © 2025
      </footer>
    </>
  );
};

export default Dashboard;
