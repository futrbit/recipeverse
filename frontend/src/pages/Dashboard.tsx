// frontend/src/pages/Dashboard.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { auth, signOutUser } from '../firebase';
import Cook from './Cook';
import { UserInfo } from '../types';

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
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/user-info`, {
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

  if (!userInfo) return <div className="container">Loading...</div>;

  return (
    <div style={{ backgroundColor: '#000000', minHeight: '100vh' }}>
      <div className="container">
        <h1>Welcome, {userInfo.name}</h1>
        <p>Credits: {userInfo.credits} | Subscription: {userInfo.subscription_status}</p>
        <button className="button" onClick={handleLogout}>
          Log Out
        </button>
        <nav>
          <button className="button" onClick={() => navigate('/dashboard')}>
            Generate Recipe
          </button>
          <button className="button" onClick={() => navigate('/cookbook')}>
            Cookbook
          </button>
        </nav>
        <h2>Generate a Recipe</h2>
        <Cook />
      </div>
    </div>
  );
};

export default Dashboard;