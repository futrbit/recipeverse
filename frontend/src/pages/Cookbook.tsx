import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Recipe } from '../types';

const containerStyle: React.CSSProperties = {
  padding: '2rem',
  maxWidth: '900px',
  margin: '0 auto',
  backgroundColor: '#fff',
  borderRadius: '12px',
  boxShadow: '0 0 15px rgba(0,0,0,0.1)',
};

const headerStyle: React.CSSProperties = {
  fontSize: '2rem',
  marginBottom: '1rem',
  color: '#28a745', // green header
  textAlign: 'center',
};

const btnStyle: React.CSSProperties = {
  padding: '0.5rem 1rem',
  margin: '0.5rem',
  backgroundColor: '#28a745',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  fontWeight: '600',
  transition: 'background-color 0.3s ease',
};

const btnHoverStyle: React.CSSProperties = {
  backgroundColor: '#218838',
};

const footerStyle: React.CSSProperties = {
  marginTop: '2rem',
  fontSize: '0.9rem',
  color: '#666',
  textAlign: 'center',
};

const recipeBoxStyle: React.CSSProperties = {
  backgroundColor: '#d4edda', // light green background
  border: '3px solid #28a745',
  padding: '15px',
  borderRadius: '8px',
  marginBottom: '2rem',
  whiteSpace: 'pre-wrap',
  overflowWrap: 'break-word',
  color: '#000',
  maxHeight: '400px',
  overflowY: 'auto',
};

const nutritionStyle: React.CSSProperties = {
  backgroundColor: '#c8e6c9',
  borderLeft: '5px solid #2e7d32',
  padding: '10px 15px',
  margin: '15px 0',
  fontWeight: '600',
  color: '#1b5e20',
  borderRadius: '4px',
  fontSize: '15px',
  lineHeight: 1.4,
};

const Cookbook: React.FC = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [btnHovered, setBtnHovered] = useState(false);

  useEffect(() => {
    const fetchRecipes = async () => {
      const idToken = localStorage.getItem('idToken');
      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/cookbook`, {
          headers: { Authorization: `Bearer ${idToken}` },
        });
        setRecipes(response.data);
      } catch (error) {
        console.error('Error fetching cookbook:', error);
      }
    };
    fetchRecipes();
  }, []);

  return (
    <div style={containerStyle}>
      <h1 style={headerStyle}>Your Cookbook</h1>
      {recipes.length === 0 ? (
        <p>No recipes yet. Generate some!</p>
      ) : (
        recipes.map((recipe) => (
          <div key={recipe.id} style={recipeBoxStyle}>
            <h3>{recipe.title}</h3>
            <p><strong>Cuisine:</strong> {recipe.cuisine || 'N/A'}</p>
            <p><strong>Dietary:</strong> {recipe.dietary || 'N/A'}</p>
            <p><strong>Ingredients:</strong> {recipe.ingredients}</p>
            <p><strong>Instructions:</strong></p>
            <pre style={{ whiteSpace: 'pre-wrap', fontSize: '16px' }}>
              {recipe.instructions}
            </pre>
            {recipe.nutrition && (
              <div style={nutritionStyle}>
                <strong>Nutrition:</strong><br />
                {recipe.nutrition}
              </div>
            )}
            <p><strong>Created:</strong> {new Date(recipe.timestamp).toLocaleString()}</p>
          </div>
        ))
      )}
      <button
        style={{ ...btnStyle, ...(btnHovered ? btnHoverStyle : {}) }}
        onClick={() => window.history.back()}
        onMouseEnter={() => setBtnHovered(true)}
        onMouseLeave={() => setBtnHovered(false)}
      >
        Back
      </button>
      <footer style={footerStyle}>RecipeVerse &copy; 2025</footer>
    </div>
  );
};

export default Cookbook;
