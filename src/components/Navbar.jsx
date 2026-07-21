import React, { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation } from "react-router-dom";
import { BASE_URL } from "../utils/constants";
import { removeUser } from "../utils/userSlice";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Home, Users, Inbox, Search, User, LogOut, ChevronDown, Menu, X } from "lucide-react";

const Navbar = () => {
  const user = useSelector((store) => store.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  const isAuthPage = ['/login', '/signup'].includes(location.pathname);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
      toast("Search is coming soon!");
      setSearchQuery("");
    }
  };

  const navLinks = [
    { path: "/", label: "Home", icon: Home },
    { path: "/connections", label: "Connections", icon: Users },
    { path: "/requests", label: "Requests", icon: Inbox },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-base-100 border-b border-base-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* Left Section - Brand */}
          <div className="flex items-center">
            <Link
              to={user ? "/" : "/login"}
              className="flex items-center space-x-3"
            >
              <div className="w-9 h-9 rounded-field bg-primary flex items-center justify-center">
                <span className="text-primary-content font-semibold text-lg">E</span>
              </div>
              <div className="hidden sm:block">
                <span className="text-lg font-semibold text-base-content">
                  EngageDev
                </span>
                <div className="text-xs text-base-content/50 -mt-1">Connect & Grow</div>
              </div>
            </Link>

            {user && !isAuthPage && (
              <div className="hidden lg:flex ml-8">
                <ul className="flex items-center space-x-1">
                  {navLinks.map((link) => {
                    const Icon = link.icon;
                    const isActive = location.pathname === link.path;
                    return (
                      <li key={link.path}>
                        <Link
                          to={link.path}
                          className={`flex items-center space-x-2 px-4 py-2 rounded-field text-sm font-medium transition-colors ${
                            isActive
                              ? "bg-primary/10 text-primary"
                              : "text-base-content/60 hover:text-base-content hover:bg-base-200"
                          }`}
                        >
                          <Icon size={16} />
                          <span>{link.label}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>

          {user && !isAuthPage && (
            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <form onSubmit={handleSearch} className="w-full">
                <div className="relative">
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40 pointer-events-none"
                  />
                  <input
                    type="text"
                    placeholder="Search developers, skills..."
                    className="input input-bordered w-full pl-9 rounded-field text-sm focus:outline-none focus:border-primary"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </form>
            </div>
          )}

          <div className="flex items-center space-x-3">

            {user ? (
              <>
                <div className="relative" ref={dropdownRef}>
                  <button
                    className="flex items-center space-x-2 p-1.5 rounded-field hover:bg-base-200 transition-colors"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  >
                    <img
                      alt={`${user.firstName}'s profile`}
                      src={user.photoUrl || `https://ui-avatars.com/api/?name=${user.firstName}&background=2563eb&color=fff&size=128`}
                      className="w-8 h-8 lg:w-9 lg:h-9 rounded-full object-cover border border-base-300"
                      onError={(e) => {
                        e.target.src = `https://ui-avatars.com/api/?name=${user.firstName}&background=2563eb&color=fff&size=128`;
                      }}
                    />
                    <div className="hidden lg:block text-left">
                      <div className="text-sm font-medium text-base-content truncate max-w-24">{user.firstName}</div>
                    </div>
                    <ChevronDown
                      size={16}
                      className={`hidden lg:block text-base-content/40 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-72 bg-base-100 rounded-box shadow-lg border border-base-300 py-2 z-50">
                      <div className="px-4 py-3 border-b border-base-300">
                        <div className="flex items-center space-x-3">
                          <img
                            src={user.photoUrl || `https://ui-avatars.com/api/?name=${user.firstName}&background=2563eb&color=fff&size=128`}
                            alt="avatar"
                            className="w-10 h-10 rounded-full object-cover border border-base-300"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-base-content truncate">
                              {user.firstName} {user.lastName}
                            </p>
                            <p className="text-sm text-base-content/50 truncate">
                              {user.email || "user@engagedev.com"}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="py-1">
                        <Link
                          to="/profile"
                          className="flex items-center px-4 py-2.5 text-sm text-base-content/80 hover:bg-base-200 transition-colors"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <User size={16} className="mr-3" />
                          View profile
                        </Link>
                      </div>

                      <div className="border-t border-base-300 pt-1">
                        <button
                          onClick={handleLogout}
                          className="flex items-center w-full px-4 py-2.5 text-sm text-error hover:bg-error/10 transition-colors"
                        >
                          <LogOut size={16} className="mr-3" />
                          Sign out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                {location.pathname === '/signup' ? (
                  <div className="flex items-center space-x-3">
                    <span className="hidden sm:block text-sm text-base-content/60">Already have an account?</span>
                    <Link
                      to="/login"
                      className="px-4 py-2 text-sm font-medium text-base-content/70 hover:text-primary transition-colors"
                    >
                      Sign in
                    </Link>
                  </div>
                ) : location.pathname === '/login' ? null : (
                  <>
                    <Link
                      to="/login"
                      className="px-4 py-2 text-sm font-medium text-base-content/70 hover:text-primary transition-colors"
                    >
                      Sign in
                    </Link>
                    <Link
                      to="/signup"
                      className="btn btn-primary btn-sm rounded-field"
                    >
                      Get started
                    </Link>
                  </>
                )}
              </div>
            )}

            {user && !isAuthPage && (
              <button
                className="lg:hidden p-2 rounded-field text-base-content/60 hover:text-base-content hover:bg-base-200 transition-colors"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              >
                {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            )}
          </div>
        </div>

        {user && !isAuthPage && isMobileMenuOpen && (
          <div className="lg:hidden border-t border-base-300 py-4">
            <div className="px-1 pb-4">
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40 pointer-events-none"
                  />
                  <input
                    type="text"
                    placeholder="Search developers..."
                    className="input input-bordered w-full pl-9 rounded-field text-sm focus:outline-none focus:border-primary"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </form>
            </div>

            <div className="space-y-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`flex items-center space-x-3 px-4 py-2.5 rounded-field text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-base-content/70 hover:bg-base-200"
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Icon size={18} />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;