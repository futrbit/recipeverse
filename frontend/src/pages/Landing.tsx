import React from "react";
import { Link } from "react-router-dom";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-between">
      {/* Header */}
      <header className="flex justify-between items-center px-8 py-6 border-b border-gray-800">
        <div className="text-3xl font-bold tracking-wide">
          <span className="text-green-400">Recipe</span>Verse
        </div>
        <Link
          to="/login"
          className="bg-white text-black px-5 py-2 rounded hover:bg-gray-300 transition"
        >
          Login
        </Link>
      </header>

      {/* Hero Section */}
      <main className="flex-grow flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-4">
          Discover Delicious Recipes<br />Tailored Just for You
        </h1>
        <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mb-8">
          Meal planning, dietary filters, smart suggestions. All in one place.
        </p>
        <Link
          to="/signup"
          className="bg-green-500 text-white px-6 py-3 text-lg rounded hover:bg-green-600 transition"
        >
          Get Started
        </Link>
      </main>

      {/* Footer */}
      <footer className="text-center py-6 text-sm border-t border-gray-800">
        &copy; {new Date().getFullYear()} RecipeVerse. All rights reserved.
      </footer>
    </div>
  );
};

export default Landing;
