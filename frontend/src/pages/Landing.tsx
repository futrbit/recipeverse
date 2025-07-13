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
          className="h-12 transition-transform duration-300 hover:scale-105"
          onError={(e) => console.error('Logo failed to load at /static/logo.png:', {
            src: e.currentTarget.src,
            status: e.currentTarget.complete ? 'loaded but broken' : 'not found',
            error: e,
          })}
        />
      </header>

      {/* Main */}
      <main className="flex flex-col items-center justify-center text-center min-h-[80vh] px-4">
        <div className="relative w-full max-w-lg mb-8">
          <img
            src="/static/hero.png"
            alt="Hero"
            className="w-full rounded-lg shadow-lg object-cover"
            onError={(e) => console.error('Hero image failed to load at /static/hero.png:', {
              src: e.currentTarget.src,
              status: e.currentTarget.complete ? 'loaded but broken' : 'not found',
              error: e,
            })}
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-black bg-opacity-50 rounded-lg">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Welcome to RecipeVerse</h1>
            <p className="text-base md:text-lg max-w-xs md:max-w-sm">
              Craft personalized recipes with AI. Choose your ingredients, diet, and flavor style — we’ll do the rest.
            </p>
          </div>
        </div>
        <button
          className="bg-green-600 text-white px-6 py-3 rounded-md text-lg font-semibold hover:bg-green-700 transition duration-300"
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