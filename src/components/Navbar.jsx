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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Check if we're on auth pages (login/signup)
  const isAuthPage = ['/login', '/signup'].includes(location.pathname);

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

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await fetch(BASE_URL + "/logout", {
        method: "POST",
        credentials: "include",
      });
      dispatch(removeUser());
      setIsDropdownOpen(false);
      setIsMobileMenuOpen(false);
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
    <nav className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Left Section - Brand */}
          <div className="flex items-center">
            <Link 
              to={user ? "/" : "/login"} 
              className="flex items-center space-x-3 hover:opacity-90 transition-all duration-200"
            >
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">E</span>
              </div>
              <div className="hidden sm:block">
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  EngageDev
                </span>
                <div className="text-xs text-gray-500 font-medium -mt-1">Connect & Grow</div>
              </div>
            </Link>

            {/* Desktop Navigation Links - Only show if user is logged in and not on auth pages */}
            {user && !isAuthPage && (
              <div className="hidden lg:flex ml-8">
                <ul className="flex items-center space-x-1">
                  {navLinks.map((link) => (
                    <li key={link.path}>
                      <Link
                        to={link.path}
                        className={`relative flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                          location.pathname === link.path 
                            ? "bg-blue-50 text-blue-600 shadow-md" 
                            : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
                        }`}
                      >
                        <span className="text-base">{link.icon}</span>
                        <span>{link.label}</span>
                        {location.pathname === link.path && (
                          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full"></div>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Center - Search (Only show if user is logged in and not on auth pages) */}
          {user && !isAuthPage && (
            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <form onSubmit={handleSearch} className="w-full">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Search developers, skills, or projects..."
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all duration-200"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </form>
            </div>
          )}

          {/* Right Section */}
          <div className="flex items-center space-x-3">
            
            {/* Mobile Search Button - Only show if user is logged in and not on auth pages */}
            {user && !isAuthPage && (
              <button className="md:hidden p-2.5 rounded-xl text-gray-600 hover:text-blue-600 hover:bg-gray-50 transition-all duration-200">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            )}

            {user ? (
              <>
                {/* Welcome Message (Desktop) - Only show if not on auth pages */}
                {!isAuthPage && (
                  <div className="hidden xl:flex items-center space-x-2 px-3 py-2 bg-gray-50 rounded-xl">
                    <span className="text-sm text-gray-500">Welcome back,</span>
                    <span className="font-semibold text-blue-600">{user.firstName}</span>
                    <span className="text-lg">👋</span>
                  </div>
                )}

                {/* User Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    className="flex items-center space-x-3 p-1.5 rounded-xl hover:bg-gray-50 transition-all duration-200"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  >
                    <div className="relative">
                      <img
                        alt={`${user.firstName}'s profile`}
                        src={user.photoUrl || `https://ui-avatars.com/api/?name=${user.firstName}&background=3B82F6&color=fff&size=128`}
                        className="w-8 h-8 lg:w-10 lg:h-10 rounded-full object-cover ring-2 ring-gray-200 hover:ring-blue-300 transition-all duration-200"
                        onError={(e) => {
                          e.target.src = `https://ui-avatars.com/api/?name=${user.firstName}&background=3B82F6&color=fff&size=128`;
                        }}
                      />
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
                    </div>
                    <div className="hidden lg:block text-left">
                      <div className="text-sm font-medium text-gray-700 truncate max-w-24">{user.firstName}</div>
                      <div className="text-xs text-gray-500">View profile</div>
                    </div>
                    <svg className={`hidden lg:block w-4 h-4 text-gray-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Dropdown Menu */}
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-xl border border-gray-200 py-2 z-50">
                      {/* User Info Header */}
                      <div className="px-4 py-4 border-b border-gray-100">
                        <div className="flex items-center space-x-3">
                          <img
                            src={user.photoUrl || `https://ui-avatars.com/api/?name=${user.firstName}&background=3B82F6&color=fff&size=128`}
                            alt="avatar"
                            className="w-12 h-12 rounded-full object-cover ring-2 ring-blue-100"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 truncate">
                              {user.firstName} {user.lastName}
                            </p>
                            <p className="text-sm text-gray-500 truncate">
                              {user.email || "user@engagedev.com"}
                            </p>
                            <div className="flex items-center space-x-2 mt-1">
                              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                              <span className="text-xs text-gray-400">Online</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Menu Items */}
                      <div className="py-2">
                        <Link 
                          to="/profile" 
                          className="flex items-center justify-between px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <span className="flex items-center">
                            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            View Profile
                          </span>
                          <span className="bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded-full">New</span>
                        </Link>

                        <Link 
                          to="/settings" 
                          className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 transition-all duration-200"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          Account Settings
                        </Link>
                      </div>

                      {/* Logout Section */}
                      <div className="border-t border-gray-100 pt-2">
                        <button
                          onClick={handleLogout}
                          className="flex items-center w-full px-4 py-3 text-red-600 hover:bg-red-50 transition-all duration-200"
                        >
                          <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* Auth Buttons for Unauthenticated Users */
              <div className="flex items-center space-x-3">
                {/* Show different buttons based on current page */}
                {location.pathname === '/signup' ? (
                  <div className="flex items-center space-x-3">
                    <span className="hidden sm:block text-sm text-gray-600">Already have an account?</span>
                    <Link 
                      to="/login" 
                      className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors duration-200"
                    >
                      Sign In
                    </Link>
                  </div>
                ) : location.pathname === '/login' ? (
                  <div className="flex items-center space-x-3">
                    {/* <span className="hidden sm:block text-sm text-gray-600">New to EngageDev?</span> */}
                    {/* <Link 
                      to="/signup" 
                      className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-medium rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                    >
                      Get Started
                    </Link> */}
                  </div>
                ) : (
                  /* Default auth buttons for other pages */
                  <>
                    <Link 
                      to="/login" 
                      className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors duration-200"
                    >
                      Sign In
                    </Link>
                    <Link 
                      to="/signup" 
                      className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-medium rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                    >
                      Get Started
                    </Link>
                  </>
                )}
              </div>
            )}

            {/* Mobile Menu Button - Only show if user is logged in and not on auth pages */}
            {user && !isAuthPage && (
              <button
                className="lg:hidden p-2 rounded-xl text-gray-600 hover:text-blue-600 hover:bg-gray-50 transition-all duration-200"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isMobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Menu - Only show if user is logged in and not on auth pages */}
        {user && !isAuthPage && isMobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 py-4">
            {/* Mobile Search */}
            <div className="px-4 pb-4">
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Search developers..."
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </form>
            </div>

            {/* Mobile Navigation Links */}
            <div className="space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center space-x-3 px-4 py-3 text-base font-medium transition-all duration-200 ${
                    location.pathname === link.path 
                      ? "bg-blue-50 text-blue-600 border-r-4 border-blue-600" 
                      : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span className="text-lg">{link.icon}</span>
                  <span>{link.label}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
