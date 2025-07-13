import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// ─── Styles ────────────────────────────────────────
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
  maxWidth: 500,
  margin: '0 auto',
  padding: '2rem',
  background: '#fff',
  borderRadius: 10,
  boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
  textAlign: 'center',
  minHeight: '70vh',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.8rem',
  margin: '0.5rem 0',
  borderRadius: 5,
  border: '1px solid #ccc',
  fontSize: '1rem',
};

const btnStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.8rem',
  marginTop: '1rem',
  backgroundColor: '#28a745',
  color: 'white',
  fontWeight: 'bold',
  border: 'none',
  borderRadius: 5,
  cursor: 'pointer',
};

const googleBtnStyle: React.CSSProperties = {
  ...btnStyle,
  backgroundColor: '#db4437',
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

const tabStyle = (active: boolean): React.CSSProperties => ({
  padding: '0.5rem 1rem',
  cursor: 'pointer',
  borderBottom: active ? '2px solid #28a745' : '2px solid transparent',
  fontWeight: active ? 'bold' : 'normal',
  color: active ? '#28a745' : '#555',
  marginBottom: '1rem',
});

// ─── Component ─────────────────────────────────────
const Login: React.FC = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<'login' | 'signup'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    try {
      const response = await axios.post(
        'http://localhost:5000/login',
        { username, password },
        { withCredentials: true }
      );
      if (response.data.success) {
        navigate('/dashboard');
      } else {
        setError('Invalid credentials');
      }
    } catch {
      setError('Login failed. Please try again.');
    }
  };

  const handleSignup = async () => {
    try {
      const response = await axios.post(
        'http://localhost:5000/signup',
        { username, password },
        { withCredentials: true }
      );
      if (response.data.success) {
        navigate('/dashboard');
      } else {
        setError(response.data.message || 'Signup failed');
      }
    } catch {
      setError('Signup failed. Please try again.');
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:5000/google/login';
  };

  return (
    <>
      <header style={headerStyle}>
        <img src="/static/logo.png" alt="RecipeVerse Logo" style={{ height: 50 }} />
      </header>

      <main style={containerStyle}>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div onClick={() => setTab('login')} style={tabStyle(tab === 'login')}>Login</div>
          <div onClick={() => setTab('signup')} style={tabStyle(tab === 'signup')}>Sign Up</div>
        </div>

        {error && <p style={{ color: 'red' }}>{error}</p>}

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={inputStyle}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={inputStyle}
        />

        {tab === 'login' ? (
          <>
            <button onClick={handleLogin} style={btnStyle}>Log In</button>
            <button onClick={handleGoogleLogin} style={googleBtnStyle}>Continue with Google</button>
          </>
        ) : (
          <>
            <button onClick={handleSignup} style={btnStyle}>Create Account</button>
          </>
        )}
      </main>

      <footer style={footerStyle}>
        Made with ❤️ by RecipeVerse · © 2025
      </footer>
    </>
  );
};

export default Login;
