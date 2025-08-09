// src/components/Navbar.jsx

import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleProfileClick = () => setMenuOpen(open => !open);
  const handleSignOut = async () => {
    await logout();
    navigate('/');
  };

  const userInitials = user?.email?.charAt(0).toUpperCase() || '?';

  return (
    <nav className="bg-white shadow px-6 py-3 flex justify-between items-center">
      {/* Logo */}
      <Link to="/dashboard" className="flex items-center">
        <span className="text-xl font-bold text-blue-600">ResumeXpert</span>
      </Link>

      {/* Right Profile Section */}
      <div className="relative" ref={menuRef}>
        <button
          onClick={handleProfileClick}
          className="flex items-center gap-2 focus:outline-none"
        >
          {/* Profile Image */}
          {user?.photoURL ? (
            <img
              src={user.photoURL}
              alt="Profile"
              className="w-8 h-8 rounded-full object-cover border"
            />
          ) : (
            <div className="w-8 h-8 flex items-center justify-center bg-gray-300 rounded-full text-gray-700 text-sm font-semibold">
              {userInitials}
            </div>
          )}
        </button>

        {/* Dropdown Menu */}
        {menuOpen && (
          <div className="absolute right-0 mt-2 bg-white shadow-lg rounded w-48 z-20">
            <ul className="py-2">
              <li className="px-4 py-2 text-sm text-gray-800">{user?.email}</li>
              {/* <li>
                <Link to="/update-profile" className="block px-4 py-2 text-sm hover:bg-gray-100">
                  Update Profile
                </Link>
              </li> */}
              <li
                onClick={() => navigate('/help')}
                className="px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer"
              >Help</li>
              <li
                onClick={() => navigate('/contact')}
                className="px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer"
              >Contact</li>
              <li
                onClick={handleSignOut}
                className="px-4 py-2 text-sm text-red-600 hover:bg-gray-100 cursor-pointer"
              >Sign Out</li>
            </ul>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
