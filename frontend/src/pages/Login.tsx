// src/pages/Login.tsx
import React, { useState } from 'react';

const Login: React.FC = () => {
  const [loginMode, setLoginMode] = useState(true);
  const [form, setForm] = useState({ identifier: '', password: '', email: '', username: '' });
  const [message, setMessage] = useState('');

  const API_URL = 'https://recipeverse-xiuo.onrender.com';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async () => {
    try {
      const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          identifier: form.identifier,
          password: form.password,
        }),
      });
      if (res.ok) {
        window.location.href = '/dashboard';
      } else {
        setMessage('Login failed');
      }
    } catch (err) {
      setMessage('Login error');
    }
  };

  const handleSignup = async () => {
    try {
      const res = await fetch(`${API_URL}/signup`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          username: form.username,
          email: form.email,
          password: form.password,
        }),
      });
      if (res.ok) {
        window.location.href = '/dashboard';
      } else {
        const data = await res.json();
        setMessage(data?.error || 'Signup failed');
      }
    } catch (err) {
      setMessage('Signup error');
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '50px auto', textAlign: 'center' }}>
      <h2>{loginMode ? 'Log In' : 'Sign Up'}</h2>

      {!loginMode && (
        <>
          <input
            name="username"
            placeholder="Username"
            value={form.username}
            onChange={handleChange}
            style={{ display: 'block', margin: '10px auto' }}
          />
          <input
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            style={{ display: 'block', margin: '10px auto' }}
          />
        </>
      )}

      {loginMode && (
        <input
          name="identifier"
          placeholder="Username or Email"
          value={form.identifier}
          onChange={handleChange}
          style={{ display: 'block', margin: '10px auto' }}
        />
      )}

      <input
        name="password"
        type="password"
        placeholder="Password"
        value={form.password}
        onChange={handleChange}
        style={{ display: 'block', margin: '10px auto' }}
      />

      <button onClick={loginMode ? handleLogin : handleSignup} style={{ marginTop: 10 }}>
        {loginMode ? 'Log In' : 'Sign Up'}
      </button>

      <p style={{ marginTop: 20, cursor: 'pointer' }} onClick={() => setLoginMode(!loginMode)}>
        {loginMode ? 'Need an account? Sign Up' : 'Already have an account? Log In'}
      </p>

      {message && <p style={{ color: 'red' }}>{message}</p>}
    </div>
  );
};

export default Login;
