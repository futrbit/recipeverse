// src/pages/logout.tsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const logoutUser = async () => {
      try {
        await axios.post('http://localhost:5000/logout', {}, { withCredentials: true });
      } catch (err) {
        console.error('Logout error:', err);
      } finally {
        navigate('/landing'); // or '/' if that's still valid
      }
    };
    logoutUser();
  }, [navigate]);

  return null;
};

export default Logout;
