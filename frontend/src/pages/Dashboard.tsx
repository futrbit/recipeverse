import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png'; // adjust this if your path is different

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
    <div className="container" style={{ textAlign: 'center', padding: '2rem' }}>
      <img
        src={logo}
        alt="RecipeVerse Logo"
        style={{
          width: '140px',
          marginBottom: '1.5rem',
        }}
      />

      {user ? (
        <>
          <h1>Hello {user.username} 👋</h1>
          <p style={{ color: '#218838', fontSize: '1.2rem' }}>You have {user.credits} credits left.</p>
          {user.subscription_status === 'free' && (
            <p>
              <button
                onClick={() => navigate('/pricing')}
                style={{
                  color: '#218838',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  textDecoration: 'underline',
                }}
              >
                Subscribe for unlimited recipes!
              </button>
            </p>
          )}
        </>
      ) : (
        <>
          <h1 style={{ fontSize: '2rem', color: '#333' }}>Welcome to <span style={{ color: '#218838' }}>RecipeVerse</span></h1>
        </>
      )}

      <p
        style={{
          marginTop: '2rem',
          fontFamily: "'Press Start 2P', cursive", // Arcade-style font (optional: make sure to load this font in index.html)
          fontSize: '0.9rem',
          color: '#666',
        }}
      >
        Discover, cook, and share. Your AI kitchen awaits.<br />
        Visit <a href="http://localhost:5000/cook" style={{ color: '#218838' }}>our backend generator</a> to get started.
      </p>

      <button
        onClick={() => navigate('/pricing')}
        style={{
          marginTop: '1.5rem',
          padding: '0.6rem 1.2rem',
          fontSize: '1rem',
          backgroundColor: '#218838',
          color: '#fff',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
        }}
      >
        Go to Premium
      </button>
    </div>
  );
};

export default Dashboard;
