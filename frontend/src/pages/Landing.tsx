import React from 'react';
import { useNavigate } from 'react-router-dom';

const Landing: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-md p-4 flex justify-center items-center">
        <img
          src="/static/logo.png"
          alt="RecipeVerse Logo"
          className="h-16"
          onError={(e) => console.error('Logo failed to load at /static/logo.png:', {
            src: e.currentTarget.src,
            status: e.currentTarget.complete ? 'loaded but broken' : 'not found',
          })}
        />
      </header>

      {/* Main */}
      <main className="flex flex-col items-center justify-center text-center min-h-[80vh] px-4">
        <div className="relative max-w-2xl w-full mb-8">
          <img
            src="/static/hero.png"
            alt="Hero"
            className="w-full rounded-lg shadow-lg"
            onError={(e) => console.error('Hero image failed to load at /static/hero.png:', {
              src: e.currentTarget.src,
              status: e.currentTarget.complete ? 'loaded but broken' : 'not found',
            })}
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-black bg-opacity-50 rounded-lg">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Welcome to RecipeVerse</h1>
            <p className="text-lg md:text-xl max-w-md">
              Craft personalized recipes with AI. Choose your ingredients, diet, and flavor style — we’ll do the rest.
            </p>
          </div>
        </div>
        <button
          className="bg-green-600 text-white px-6 py-3 rounded-md text-lg font-semibold hover:bg-green-700 transition"
          onClick={() => navigate('/login')}
        >
          Log In
        </button>
      </main>

      {/* Footer */}
      <footer className="bg-white shadow-inner text-center p-4 text-gray-600 text-sm">
        © 2025 RecipeVerse · Made with 🍳 and ❤️
      </footer>
    </div>
  );
};

export default Landing;
