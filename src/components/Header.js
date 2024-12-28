import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import React from 'react';
import { FaSignOutAlt, FaUserCircle } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import '../App.css';

const Header = () => {
  const navigate = useNavigate();
  const isAuthenticated = !!localStorage.getItem('token');
  const username = localStorage.getItem('name');



  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <header className="header d-flex justify-content-between align-items-center p-3 bg-dark text-white">
      <div className="logo d-flex align-items-center">
        <svg className="logo-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="40" height="40">
          <circle cx="32" cy="32" r="32" fill="#007bff" />
          <path d="M32 20c-3.3 0-6 2.7-6 6v8c0 3.3 2.7 6 6 6s6-2.7 6-6v-8c0-3.3-2.7-6-6-6zm3 14c0 1.7-1.3 3-3 3s-3-1.3-3-3v-8c0-1.7 1.3-3 3-3s3 1.3 3 3v8z" fill="#fff" />
          <path d="M39 26c0-.6-.4-1-1-1s-1 .4-1 1v6c0 3.9-3.1 7-7 7s-7-3.1-7-7v-6c0-.6-.4-1-1-1s-1 .4-1 1v6c0 4.9 3.8 8.8 8.7 9v3.3h-2.7c-.6 0-1 .4-1 1s.4 1 1 1h6c.6 0 1-.4 1-1s-.4-1-1-1h-2.7v-3.3c4.9-.2 8.7-4.1 8.7-9v-6z" fill="#fff" />
        </svg>
        <Link to="/" className="text-white text-decoration-none ms-2 logo-text">VOCAL-AI</Link>
      </div>
      <nav>
        {isAuthenticated ? (
          <div className="dropdown">
            <button className="btn btn-dark dropdown-toggle" type="button" id="dropdownMenuButton" data-bs-toggle="dropdown" aria-expanded="false">
              <FaUserCircle /> {username}
            </button>
            <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton">
              <li><button className="dropdown-item" onClick={handleLogout}><FaSignOutAlt /> Logout</button></li>
            </ul>
          </div>
        ) : (
          <div>
            <Link to="/login" className="btn btn-outline-light me-2">Sign In</Link>
            <Link to="/signup" className="btn btn-outline-light">Sign Up</Link>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;
