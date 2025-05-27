import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaSun, FaMoon, FaBars, FaTimes, FaSignInAlt } from 'react-icons/fa';
import logo from '../assets/logo_128.png';
import { useAuth } from '../contexts/AuthContext';

function Navbar() {
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      document.documentElement.setAttribute('data-theme', savedTheme);
      return savedTheme;
    }
    document.documentElement.setAttribute('data-theme', 'cupcake');
    return 'cupcake';
  });

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === 'cupcake' ? 'abyss' : 'cupcake';
    setTheme(newTheme);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const NavItems = ({ isMobile = false, closeMenu = () => {} }) => {
    const { isAuthenticated, user, logout } = useAuth();
    
    return (
      <>
        <Link
          to="/"
          className={`text-base-content transition-colors duration-300 cursor-pointer hover:text-primary ${isMobile ? 'px-2 py-1' : ''}`}
          onClick={isMobile ? closeMenu : undefined}
        >
          Home
        </Link>
        <Link
          to="/about"
          className={`text-base-content transition-colors duration-300 cursor-pointer hover:text-primary ${isMobile ? 'px-2 py-1' : ''}`}
          onClick={isMobile ? closeMenu : undefined}
        >
          About
        </Link>
        <Link
          to="/contact"
          className={`text-base-content transition-colors duration-300 cursor-pointer hover:text-primary ${isMobile ? 'px-2 py-1' : ''}`}
          onClick={isMobile ? closeMenu : undefined}
        >
          Contact
        </Link>
        
        {isAuthenticated && (
          <Link
            to="/dashboard"
            className={`text-base-content transition-colors duration-300 cursor-pointer hover:text-primary ${isMobile ? 'px-2 py-1' : ''}`}
            onClick={isMobile ? closeMenu : undefined}
          >
            Dashboard
          </Link>
        )}
        
        {isAuthenticated ? (
          <div className="dropdown dropdown-end">
            <label tabIndex={0} className="text-base-content relative transition-colors duration-300 cursor-pointer hover:text-primary">
              {user.fullName}
            </label>
            <ul tabIndex={0} className="mt-3 p-2 shadow menu menu-compact dropdown-content bg-base-200 rounded-box w-52">
              <li><Link to="/account">Account</Link></li>
              <li><button onClick={logout}>Logout</button></li>
            </ul>
          </div>
        ) : (
          <Link
            to="/login"
            className="text-base-content transition-colors duration-300 cursor-pointer hover:text-primary px-2 py-1 flex items-center"
            onClick={isMobile ? closeMenu : undefined}
          >
            <span>Login</span> <FaSignInAlt className="ml-2" />
          </Link>
        )}
      </>
    );
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

        <button
          className="md:hidden text-base-content focus:outline-none"
          onClick={toggleMenu}
        >
          {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
        </button>

        <nav className="hidden md:flex items-center space-x-4">
          <NavItems />

          <button onClick={toggleTheme} className="ml-4 cursor-pointer">
            {theme === 'cupcake' ? <FaSun className="text-yellow-500" /> : <FaMoon className="text-gray-800" />}
          </button>
        </nav>
      </div>

      {isMenuOpen && (
        <div className="md:hidden bg-base-200 absolute top-16 left-0 right-0 p-4 shadow-md">
          <nav className="flex flex-col space-y-4 pb-4">
            <NavItems isMobile={true} closeMenu={() => setIsMenuOpen(false)} />

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