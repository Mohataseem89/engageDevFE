import React, { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation } from "react-router-dom";
import { BASE_URL } from "../utils/constants";
import { removeUser } from "../utils/userSlice";
import { useNavigate } from "react-router-dom";


const Navbar = () => {
  const user = useSelector((store) => store.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch(BASE_URL + "/logout", {
        method: "POST",
        credentials: "include",
      });
      dispatch(removeUser());
      setIsDropdownOpen(false);
      navigate("/login");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  const navLinks = [
    { path: "/", label: "Home", icon: "🏠" },
    { path: "/connections", label: "Connections", icon: "👥" },
    { path: "/requests", label: "Requests", icon: "📋" },
  ];

  return (
    <nav className="navbar bg-base-100 shadow-md border-b border-base-300/50 px-4 py-2 min-h-16">
      <div className="flex-1 flex items-center space-x-6">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center space-x-3 hover:opacity-90 transition-opacity">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary via-primary to-secondary flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-lg">E</span>
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            EngageDev
          </span>
        </Link>

        {/* Navigation Links */}
        <div className="hidden lg:flex">
          <ul className="flex items-center space-x-1">
            {navLinks.map((link) => (
              <li key={link.path}>
                <Link
                  to={link.path}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-base-200 ${
                    location.pathname === link.path 
                      ? "bg-primary/10 text-primary border border-primary/20" 
                      : "text-base-content/80 hover:text-base-content"
                  }`}
                >
                  <span className="text-base">{link.icon}</span>
                  <span>{link.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Center - Search */}
      <div className="flex-none mx-4">
        <form onSubmit={handleSearch} className="flex items-center">
          <div className="relative">
            <input
              type="text"
              placeholder="Search users..."
              className="input input-bordered input-sm w-80 pr-10 bg-base-200/50 border-base-300 focus:border-primary focus:bg-base-100 transition-all duration-200"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button 
              type="submit" 
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-base-content/60 hover:text-primary transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </form>
      </div>

      {/* Right Side */}
      <div className="flex-none">
        {user ? (
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <button className="btn btn-ghost btn-sm btn-circle indicator hover:bg-base-200">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-5 5v-5zM4.343 12.343l1.414-1.414L9 14.172l9.192-9.192 1.414 1.414L10 16l-5.657-5.657z" />
              </svg>
              <span className="badge badge-xs badge-primary indicator-item animate-pulse"></span>
            </button>

            {/* Welcome Message */}
            <div className="hidden md:flex items-center space-x-2">
              <span className="text-sm text-base-content/70">Welcome,</span>
              <span className="font-semibold text-primary">{user.firstName}</span>
            </div>

            {/* User Dropdown */}
            <div className="dropdown dropdown-end" ref={dropdownRef}>
              <button
                className="btn btn-ghost btn-circle avatar hover:ring-2 hover:ring-primary/30 transition-all duration-200"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <div className="w-10 h-10 rounded-full ring-2 ring-base-300 ring-offset-2 ring-offset-base-100">
                  <img
                    alt={`${user.firstName}'s profile`}
                    src={user.photoUrl || `https://ui-avatars.com/api/?name=${user.firstName}&background=6366f1&color=fff`}
                    className="rounded-full object-cover w-full h-full"
                    onError={(e) => {
                      e.target.src = `https://ui-avatars.com/api/?name=${user.firstName}&background=6366f1&color=fff`;
                    }}
                  />
                </div>
              </button>

              {isDropdownOpen && (
                <ul className="menu menu-sm dropdown-content bg-base-100 rounded-xl z-[1] mt-3 w-64 p-3 shadow-xl border border-base-300/50 animate-in fade-in slide-in-from-top-2 duration-200">
                  {/* User Info Header */}
                  <li className="mb-3 p-3 bg-base-200/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <img
                        src={user.photoUrl || `https://ui-avatars.com/api/?name=${user.firstName}&background=6366f1&color=fff`}
                        alt="avatar"
                        className="w-12 h-12 rounded-full ring-2 ring-primary/20"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-base-content truncate">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-xs text-base-content/60 truncate">
                          {user.email || "user@engagedev.com"}
                        </p>
                      </div>
                    </div>
                  </li>

                  <li>
                    <Link 
                      to="/profile" 
                      className="flex items-center justify-between py-2 hover:bg-primary/10 rounded-lg transition-colors"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Profile
                      </span>
                      <span className="badge badge-primary badge-xs">New</span>
                    </Link>
                  </li>

                  <li>
                    <Link 
                      to="/settings" 
                      className="flex items-center py-2 hover:bg-primary/10 rounded-lg transition-colors"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Settings
                    </Link>
                  </li>

                  <li className="mt-2 pt-2 border-t border-base-300">
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full py-2 text-error hover:bg-error/10 rounded-lg transition-colors"
                    >
                      <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Logout
                    </button>
                  </li>
                </ul>
              )}
            </div>
          </div>
        ) : (
          <div className="flex space-x-2">
            <Link to="/login" className="btn btn-primary btn-sm">
              Login
            </Link>
            <Link to="/signup" className="btn btn-outline btn-sm">
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
