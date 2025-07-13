import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch('https://recipeverse-xiuo.onrender.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // needed for cookies/session
        body: JSON.stringify({ username, password }),
      });

      if (res.ok) {
        navigate('/dashboard');
      } else {
        const data = await res.json();
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError('Server error. Please try again.');
    }
  };

  const loginBoxStyle: React.CSSProperties = {
    maxWidth: 400,
    width: '90%',
    backgroundColor: 'white',
    padding: '2rem',
    borderRadius: 10,
    boxShadow: '0 0 12px rgba(0,0,0,0.1)',
    marginTop: '2rem',
  };

  return (
    <>
      <header style={{ padding: '1rem', textAlign: 'center' }}>
        <img src="/static/logo.png" alt="RecipeVerse Logo" style={{ height: 60 }} />
      </header>

      <main style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={loginBoxStyle}>
          <h2 style={{ marginBottom: '1rem' }}>Login</h2>

          <form onSubmit={handleLogin}>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              style={{ width: '100%', padding: '0.6rem', marginBottom: '1rem' }}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ width: '100%', padding: '0.6rem', marginBottom: '1rem' }}
            />

            {error && <p style={{ color: 'red', fontSize: '0.9rem' }}>{error}</p>}

            <button
              type="submit"
              style={{
                width: '100%',
                padding: '0.8rem',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: 5,
                cursor: 'pointer',
              }}
            >
              Log In
            </button>
          </form>

          <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
            <a
              href="https://recipeverse-xiuo.onrender.com"
              style={{ color: '#007bff', textDecoration: 'none', fontSize: '0.95rem' }}
            >
              Log in with Google
            </a>
          </div>
        </div>
      </main>

      <footer style={{ textAlign: 'center', padding: '1rem', fontSize: '0.85rem', color: '#999' }}>
        &copy; 2025 RecipeVerse · All rights reserved
      </footer>
    </>
  );
};

export default Login;
