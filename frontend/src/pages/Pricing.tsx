import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../Pricing.css'; // Fixed import path

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

interface Plan {
  plan: string;
  price: number;
  credits: string | number;
  features: string[];
}

interface User {
  username: string;
  subscription_status: string;
  stripe_customer_id: string | null;
  api_calls: number;
}

const Pricing: React.FC = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPricing = async () => {
      try {
        const response = await axios.get('/pricing', {
          withCredentials: true,
        });
        setPlans(response.data.plans);
        setUser(response.data.user);
        setLoading(false);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to load pricing plans.');
        setLoading(false);
      }
    };
    fetchPricing();
  }, []);

  const handleSubscribe = async (plan: string) => {
    try {
      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error('Stripe failed to load.');
      }
      const response = await axios.post(
        '/stripe/create-checkout-session',
        { plan },
        { withCredentials: true }
      );
      const sessionId = response.data.id;
      const { error } = await stripe.redirectToCheckout({ sessionId });
      if (error) {
        setError(error.message || 'Failed to initiate checkout.');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to start subscription.');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="pricing-container">
      <h1>Pricing Plans</h1>
      <p>Welcome, {user?.username}! Current plan: {user?.subscription_status}</p>
      <div className="plans">
        {plans.map((plan) => (
          <div key={plan.plan} className="plan-card">
            <h2>{plan.plan}</h2>
            <p className="price">
              ${plan.price.toFixed(2)} {plan.plan.includes('Yearly') ? '/year' : plan.price === 0 ? '' : '/month'}
            </p>
            <p>Credits: {plan.credits}</p>
            <ul>
              {plan.features.map((feature, index) => (
                <li key={index}>{feature}</li>
              ))}
            </ul>
            {user?.subscription_status === 'premium' && plan.plan !== 'Free' ? (
              <button disabled>Subscribed</button>
            ) : plan.plan === 'Free' ? (
              <button disabled>Current Plan</button>
            ) : (
              <button onClick={() => handleSubscribe(plan.plan)}>Subscribe</button>
            )}
          </div>
        ))}
      </div>
      <button onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
    </div>
  );
};

export default Pricing;