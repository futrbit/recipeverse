// frontend/src/pages/Dashboard.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

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
    <div className="container">
      {user ? (
        <>
          <h1>Hello {user.username} 👋</h1>
          <p style={{ color: '#218838' }}>You have {user.credits} credits left.</p>
          {user.subscription_status === 'free' && (
            <p><button onClick={() => navigate('/pricing')} style={{ color: '#218838', background: 'none', border: 'none', cursor: 'pointer' }}>Subscribe for unlimited recipes!</button></p>
          )}
        </>
      ) : (
        <h1>Welcome to RecipeVerse</h1>
      )}
      <p>Placeholder for recipe generator UI. Visit <a href="http://localhost:5000/cook">backend recipe generator</a> for now.</p>
      <button onClick={() => navigate('/pricing')}>Go to Premium</button>
    </div>
  );
};

export default Dashboard;