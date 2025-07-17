import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { auth, signOutUser } from '../firebase';
import Cook from './Cook.tsx';
import { UserInfo, PricingPlan } from '../types';

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
  const [pricingPlans, setPricingPlans] = useState<PricingPlan[]>([]);

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

    const fetchPricing = async () => {
      const idToken = localStorage.getItem('idToken');
      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/pricing`, {
          headers: { Authorization: `Bearer ${idToken}` },
        });
        setPricingPlans(response.data.plans);
      } catch (error) {
        console.error('Error fetching pricing:', error);
      }
    };

    fetchUserInfo();
    fetchPricing();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await signOutUser();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleUpgrade = async (plan: string) => {
    const idToken = localStorage.getItem('idToken');
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/stripe/create-checkout-session`,
        { plan },
        { headers: { Authorization: `Bearer ${idToken}` } }
      );
      window.location.href = response.data.id; // Redirect to Stripe Checkout
    } catch (error) {
      console.error('Error creating checkout session:', error);
      alert('Failed to initiate checkout. Please try again.');
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
        <button style={btnStyle} onClick={() => navigate('/pricing')}>
          Pricing
        </button>
      </nav>
      <h2>Generate a Recipe</h2>
      <Cook />
      <h2>Upgrade Your Plan</h2>
      {pricingPlans.map((plan) => (
        <div key={plan.plan}>
          <h3>{plan.plan}</h3>
          <p>Price: ${plan.price}</p>
          <p>Credits: {plan.credits}</p>
          <ul>
            {plan.features.map((feature) => (
              <li key={feature}>{feature}</li>
            ))}
          </ul>
          {userInfo.subscription_status !== 'premium' && plan.plan !== 'Free' && (
            <button style={btnStyle} onClick={() => handleUpgrade(plan.plan)}>
              Upgrade to {plan.plan}
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

export default Dashboard;
