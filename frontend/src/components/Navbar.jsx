import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaSun, FaMoon, FaBars, FaTimes, FaUser, FaSignOutAlt, FaSignInAlt } from 'react-icons/fa';
import logo from '../assets/logo_128.png';

function Navbar() {
  const [theme, setTheme] = useState(() => {
    // Initialize theme from localStorage or default to 'cupcake'
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      document.documentElement.setAttribute('data-theme', savedTheme);
      return savedTheme;
    }
    document.documentElement.setAttribute('data-theme', 'cupcake');
    return 'cupcake';
  });
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false); // This will be replaced with actual auth state

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = async () => {
    const newTheme = theme === 'cupcake' ? 'abyss' : 'cupcake';
    setTheme(newTheme);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Mock logout function - will be replaced with actual auth logic
  const handleLogout = () => {
    setIsAuthenticated(false);
    // Add actual logout logic here
  };

  return (
    <header className="bg-base-200 text-base-content p-4 fixed top-0 left-0 right-0 z-10 shadow-md transition-all duration-300">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center cursor-pointer">
          <img src={logo} alt="ModuLearn Logo" className="h-8 w-8 mr-2" />
          <span className="text-xl font-bold hover:text-primary transition-colors duration-300">
            ModuLearn
          </span>
        </Link>
        
        {/* Mobile menu button */}
        <button 
          className="md:hidden text-base-content focus:outline-none" 
          onClick={toggleMenu}
        >
          {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
        </button>
        
        {/* Desktop navigation */}
        <nav className="hidden md:flex items-center space-x-4">
          <Link to="/" className="text-base-content relative transition-colors duration-300 cursor-pointer hover:text-primary">
            Home
          </Link>
          <Link to="/about" className="text-base-content relative transition-colors duration-300 cursor-pointer hover:text-primary">
            About
          </Link>
          <Link to="/contact" className="text-base-content relative transition-colors duration-300 cursor-pointer hover:text-primary">
            Contact
          </Link>
          
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="text-base-content relative transition-colors duration-300 cursor-pointer hover:text-primary">
                Dashboard
              </Link>
              <div className="dropdown dropdown-end">
                <div tabIndex={0} className="btn btn-ghost btn-circle avatar">
                  <div className="w-10 rounded-full">
                    <FaUser className="w-6 h-6 mx-auto mt-2" />
                  </div>
                </div>
                <ul tabIndex={0} className="mt-3 p-2 shadow menu menu-sm dropdown-content bg-base-200 rounded-box w-52">
                  <li><Link to="/profile">Profile</Link></li>
                  <li><Link to="/settings">Settings</Link></li>
                  <li><button onClick={handleLogout}>Logout <FaSignOutAlt className="ml-2" /></button></li>
                </ul>
              </div>
            </>
          ) : (
            <Link to="/login" className="text-base-content relative transition-colors duration-300 cursor-pointer hover:text-primary">
              Login <FaSignInAlt className="inline ml-1" />
            </Link>
          )}
          
          <button onClick={toggleTheme} className="ml-4 cursor-pointer">
            {theme === 'cupcake' ? <FaSun className="text-yellow-500" /> : <FaMoon className="text-gray-800" />}
          </button>
        </nav>
      </div>
      
      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-base-200 absolute top-16 left-0 right-0 p-4 shadow-md">
          <nav className="flex flex-col space-y-4 pb-4">
            <Link 
              to="/" 
              className="text-base-content transition-colors duration-300 cursor-pointer hover:text-primary px-2 py-1"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              to="/about" 
              className="text-base-content transition-colors duration-300 cursor-pointer hover:text-primary px-2 py-1"
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </Link>
            <Link 
              to="/contact" 
              className="text-base-content transition-colors duration-300 cursor-pointer hover:text-primary px-2 py-1" 
              onClick={() => setIsMenuOpen(false)}
            >
              Contact
            </Link>
            
            {isAuthenticated ? (
              <>
                <Link 
                  to="/dashboard" 
                  className="text-base-content transition-colors duration-300 cursor-pointer hover:text-primary px-2 py-1"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link 
                  to="/profile" 
                  className="text-base-content transition-colors duration-300 cursor-pointer hover:text-primary px-2 py-1"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Profile
                </Link>
                <Link 
                  to="/settings" 
                  className="text-base-content transition-colors duration-300 cursor-pointer hover:text-primary px-2 py-1"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Settings
                </Link>
                <button 
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="text-base-content transition-colors duration-300 cursor-pointer hover:text-primary px-2 py-1 text-left flex items-center"
                >
                  Logout <FaSignOutAlt className="ml-2" />
                </button>
              </>
            ) : (
              <Link 
                to="/login" 
                className="text-base-content transition-colors duration-300 cursor-pointer hover:text-primary px-2 py-1 flex items-center"
                onClick={() => setIsMenuOpen(false)}
              >
                Login <FaSignInAlt className="ml-2" />
              </Link>
            )}
            
            <div className="flex items-center">
              <span className="mr-2">Theme:</span>
              <button onClick={toggleTheme} className="cursor-pointer">
                {theme === 'cupcake' ? <FaSun className="text-yellow-500" /> : <FaMoon className="text-gray-800" />}
              </button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

export default Navbar; 