import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { auth, signOutUser } from '../firebase';
import Cook from './Cook';
import { UserInfo } from '../types';

const containerStyle: React.CSSProperties = {
  padding: '2rem',
  maxWidth: '1200px',
  margin: '0 auto',
};

const btnStyle: React.CSSProperties = {
  padding: '0.5rem 1rem',
  margin: '0.5rem',
  backgroundColor: '#4285F4',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
};

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  useEffect(() => {
    const fetchUserInfo = async () => {
      const idToken = localStorage.getItem('idToken');
      if (!idToken) {
        navigate('/');
        return;
      }
      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/user-info`, {
          headers: { Authorization: `Bearer ${idToken}` },
        });
        setUserInfo(response.data);
      } catch (error) {
        console.error('Error fetching user info:', error);
        navigate('/');
      }
    };

    fetchUserInfo();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await signOutUser();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (!userInfo) return <div>Loading...</div>;

  return (
    <div style={containerStyle}>
      <h1>Welcome, {userInfo.name}</h1>
      <p>Credits: {userInfo.credits} | Subscription: {userInfo.subscription_status}</p>
      <button style={btnStyle} onClick={handleLogout}>
        Log Out
      </button>
      <nav>
        <button style={btnStyle} onClick={() => navigate('/dashboard')}>
          Generate Recipe
        </button>
        <button style={btnStyle} onClick={() => navigate('/cookbook')}>
          Cookbook
        </button>
      </nav>
      <h2>Generate a Recipe</h2>
      <Cook />
    </div>
  );
};

export default Dashboard;
