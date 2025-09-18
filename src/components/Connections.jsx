import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { addConnections, removeConnections } from "../utils/connectionsSlice";

const Connections = () => {
  const dispatch = useDispatch();
  const connectionsFromStore = useSelector((store) => store.connections);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name'); // 'name', 'recent'

  const fetchConnections = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await axios.get(BASE_URL + "/user/connections", {
        withCredentials: true,
      });
      
      let connectionsData = [];
      
      if (res.data.data && Array.isArray(res.data.data)) {
        connectionsData = res.data.data.filter((c) => c);
      } else if (res.data.connections && Array.isArray(res.data.connections)) {
        connectionsData = res.data.connections.filter((c) => c);
      } else if (Array.isArray(res.data)) {
        connectionsData = res.data.filter((c) => c);
      } else {
        connectionsData = [];
      }

      dispatch(addConnections(connectionsData));
      
    } catch (err) {
      console.error("Error fetching connections:", err);
      setError(
        err.response?.data?.message || 
        err.message || 
        "Failed to load connections. Please try again."
      );
      dispatch(removeConnections());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConnections();
  }, []);

  // Get and filter connections
  const connections = Array.isArray(connectionsFromStore?.data) 
    ? connectionsFromStore.data 
    : Array.isArray(connectionsFromStore) 
    ? connectionsFromStore 
    : [];

  const validConnections = connections.filter((connection) => connection);

  // Filter and sort connections
  const filteredConnections = validConnections
    .filter((connection) => {
      if (!searchQuery) return true;
      const fullName = `${connection.firstName || ''} ${connection.lastName || ''}`.toLowerCase();
      return fullName.includes(searchQuery.toLowerCase());
    })
    .sort((a, b) => {
      if (sortBy === 'name') {
        const nameA = `${a.firstName || ''} ${a.lastName || ''}`;
        const nameB = `${b.firstName || ''} ${b.lastName || ''}`;
        return nameA.localeCompare(nameB);
      }
      return 0; // Add more sorting options as needed
    });

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-8">
            <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-2xl animate-pulse">
              <span className="text-white text-3xl">👥</span>
            </div>
            <div className="absolute -inset-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl blur opacity-20 animate-pulse"></div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-center space-x-2">
              <div className="loading loading-spinner loading-md text-blue-500"></div>
              <span className="text-lg font-medium text-gray-700 dark:text-gray-300">
                Loading your connections...
              </span>
            </div>
            
            <div className="w-64 h-2 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto overflow-hidden">
              <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-600 animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <span className="text-red-500 text-4xl">⚠️</span>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Oops! Something went wrong
          </h2>
          <p className="text-red-600 dark:text-red-400 text-lg mb-6">
            {error}
          </p>
          
          <button 
            onClick={fetchConnections}
            className="btn bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-none shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            <span className="mr-2">🔄</span>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900">
      <div className="container mx-auto px-4 py-8 lg:py-12">
        
        {/* Header Section */}
        <div className="text-center mb-8 lg:mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-2xl">
                <span className="text-white text-2xl lg:text-3xl">👥</span>
              </div>
              <div className="absolute -inset-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-20"></div>
            </div>
          </div>
          
          <h1 className="text-3xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            My Connections
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg max-w-2xl mx-auto">
            {filteredConnections.length > 0 
              ? `${filteredConnections.length} amazing connection${filteredConnections.length !== 1 ? 's' : ''} in your network`
              : 'Your professional network awaits'
            }
          </p>
        </div>

        {/* Search and Controls */}
        {validConnections.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 mb-8">
            <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
              
              {/* Search Bar */}
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search connections..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center space-x-4">
                {/* Sort Dropdown */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                >
                  <option value="name">Sort by Name</option>
                  <option value="recent">Recently Added</option>
                </select>

                {/* View Toggle */}
                <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-md transition-all duration-200 ${
                      viewMode === 'grid' 
                        ? 'bg-blue-500 text-white shadow-md' 
                        : 'text-gray-600 dark:text-gray-300 hover:text-blue-500'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-md transition-all duration-200 ${
                      viewMode === 'list' 
                        ? 'bg-blue-500 text-white shadow-md' 
                        : 'text-gray-600 dark:text-gray-300 hover:text-blue-500'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        {filteredConnections.length === 0 ? (
          /* Empty State */
          <div className="flex justify-center items-center min-h-96">
            <div className="text-center max-w-lg">
              <div className="w-32 h-32 mx-auto mb-8 rounded-3xl bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 flex items-center justify-center">
                <span className="text-6xl">🤝</span>
              </div>
              
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                {searchQuery ? 'No matches found' : 'No connections yet'}
              </h2>
              
              <p className="text-gray-600 dark:text-gray-300 text-lg mb-8 leading-relaxed">
                {searchQuery 
                  ? `Try adjusting your search for "${searchQuery}" or browse all connections.`
                  : 'Start building your professional network! Connect with other developers and grow your career together.'
                }
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {searchQuery ? (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="btn btn-outline"
                  >
                    Clear Search
                  </button>
                ) : (
                  <Link 
                    to="/" 
                    className="btn bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-none shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                  >
                    <span className="mr-2">🔍</span>
                    Discover People
                  </Link>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Connections Display */
          <div>
            {viewMode === 'grid' ? (
              /* Grid View */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredConnections.map((connection) => {
                  const { _id, firstName, lastName, photoUrl, age, gender, about } = connection;
                  
                  return (
                    <div 
                      key={_id}
                      className="group relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200 dark:border-gray-700 overflow-hidden hover:scale-105"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      
                      <div className="relative p-6 text-center">
                        {/* Profile Image */}
                        <div className="relative mb-4">
                          <div className="w-20 h-20 mx-auto rounded-full ring-4 ring-blue-500/20 group-hover:ring-blue-500/40 transition-all duration-300">
                            <img 
                              src={photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(firstName || 'User')}+${encodeURIComponent(lastName || '')}&background=6366f1&color=fff&size=200`}
                              alt={`${firstName || 'User'} ${lastName || ''}`}
                              className="w-full h-full rounded-full object-cover"
                              onError={(e) => {
                                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(firstName || 'User')}&background=6366f1&color=fff&size=200`;
                              }}
                            />
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-400 rounded-full border-2 border-white dark:border-gray-800"></div>
                        </div>
                        
                        {/* User Info */}
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1 truncate">
                          {firstName} {lastName}
                        </h3>
                        
                        {(age || gender) && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                            {age && `${age} years old`}
                            {age && gender && " • "}
                            {gender && gender.charAt(0).toUpperCase() + gender.slice(1)}
                          </p>
                        )}
                        
                        {about && (
                          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2 h-10">
                            {about}
                          </p>
                        )}
                        
                        {/* Action Buttons */}
                        <div className="flex gap-2 mt-4">
                          <Link 
                            to={`/chat/${_id}`}
                            className="flex-1 btn btn-primary btn-sm bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 border-none text-white"
                          >
                            💬 Chat
                          </Link>
                          <button className="btn btn-outline btn-sm">
                            👤
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* List View */
              <div className="space-y-4">
                {filteredConnections.map((connection) => {
                  const { _id, firstName, lastName, photoUrl, age, gender, about } = connection;
                  
                  return (
                    <div
                      key={_id}
                      className="group flex items-center p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700"
                    >
                      {/* Profile Image */}
                      <div className="relative mr-6">
                        <div className="w-16 h-16 rounded-full ring-4 ring-blue-500/20 group-hover:ring-blue-500/40 transition-all duration-300">
                          <img
                            src={photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(firstName)}+${encodeURIComponent(lastName)}&background=6366f1&color=fff&size=200`}
                            alt={`${firstName} ${lastName}`}
                            className="w-full h-full rounded-full object-cover"
                            onError={(e) => {
                              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(firstName)}&background=6366f1&color=fff&size=200`;
                            }}
                          />
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white dark:border-gray-800"></div>
                      </div>

                      {/* User Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                          {firstName} {lastName}
                        </h3>
                        {(age || gender) && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                            {age && `${age} years old`}
                            {age && gender && " • "}
                            {gender && gender.charAt(0).toUpperCase() + gender.slice(1)}
                          </p>
                        )}
                        {about && (
                          <p className="text-gray-600 dark:text-gray-300 line-clamp-2">
                            {about}
                          </p>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="ml-6 flex items-center space-x-3">
                        <Link to={`/chat/${_id}`}>
                          <button className="btn btn-primary bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 border-none text-white">
                            💬 Chat
                          </button>
                        </Link>
                        <button className="btn btn-outline">
                          👤 Profile
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Connections;
