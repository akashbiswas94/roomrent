import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.png';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  const linkClass = ({ isActive }) =>
    `nav-link${isActive ? ' nav-link--active' : ''}`;

  return (
    <nav className="navbar">
      <NavLink to="/" className="navbar__brand">
        <img  src={logo} alt="Logo" className="navbar__brand-icon" />
        <span className="navbar__brand-text">AussieRent</span>
      </NavLink>

      <button
        className="navbar__hamburger"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle navigation"
        aria-expanded={menuOpen}
      >
        <span /><span /><span />
      </button>

      <ul className={`navbar__links${menuOpen ? ' navbar__links--open' : ''}`}>
        <li><NavLink to="/" end className={linkClass} onClick={() => setMenuOpen(false)}>Home</NavLink></li>
        <li><NavLink to="/search" className={linkClass} onClick={() => setMenuOpen(false)}>Search Properties</NavLink></li>
        {user && (
          <li><NavLink to="/my-ratings" className={linkClass} onClick={() => setMenuOpen(false)}>My Ratings</NavLink></li>
        )}
        {!user ? (
          <>
            <li><NavLink to="/login" className={linkClass} onClick={() => setMenuOpen(false)}>Login</NavLink></li>
            <li><NavLink to="/register" className={`${linkClass({ isActive: false })} nav-link--cta`} onClick={() => setMenuOpen(false)}>Register</NavLink></li>
          </>
        ) : (
          <li>
            <div className="navbar__user">
              <span className="navbar__user-email">{user.email}</span>
              <button className="btn btn--ghost btn--sm" onClick={handleLogout}>Logout</button>
            </div>
          </li>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
