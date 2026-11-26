import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, LogOut, Menu } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { RoleBadge } from "./Badge";

export const Navbar = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userRef = useRef(null);
  const navigate = useNavigate();
  const isAdminUser = user?.role === "admin";

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userRef.current && !userRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/login/member");
  };

  return (
    <header className="top-navbar">
      <div className="navbar-left">
        <button
          className="mobile-menu-toggle"
          onClick={onToggleSidebar}
          aria-label="Toggle menu"
        >
          <Menu size={20} />
        </button>
        <div className="navbar-breadcrumb">
          <span className="breadcrumb-brand">TaskFlow Enterprise</span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-role-pill">
            <RoleBadge role={user?.role} />
          </span>
        </div>
      </div>

      <div className="navbar-right">
        {/* User Profile Dropdown */}
        <div className="nav-item-relative" ref={userRef}>
          <button
            className="user-profile-trigger"
            onClick={() => setShowUserMenu((prev) => !prev)}
            aria-label="User menu"
          >
            <div className="user-avatar-placeholder">
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="user-info-text">
              <span className="user-display-name">{user?.name}</span>
              <span className="user-display-role">{user?.role}</span>
            </div>
          </button>

          {showUserMenu && (
            <div className="dropdown-panel user-dropdown animate-fade-in">
              <div className="dropdown-user-header">
                <p className="user-full-name">{user?.name}</p>
                <p className="user-email-text">{user?.email}</p>
                <div className="mt-1">
                  <RoleBadge role={user?.role} />
                </div>
              </div>
              <div className="dropdown-divider" />
              <Link
                to="/profile"
                className="dropdown-menu-item"
                onClick={() => setShowUserMenu(false)}
              >
                <User size={16} />
                <span>My Profile</span>
              </Link>
              <div className="dropdown-divider" />
              <button
                className="dropdown-menu-item item-danger"
                onClick={handleLogout}
              >
                <LogOut size={16} />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
