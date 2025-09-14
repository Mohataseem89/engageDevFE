import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import EditProfile from "./EditProfile";

const Profile = () => {
  const user = useSelector((store) => store.user);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading for smooth transition
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl mb-6 mx-auto animate-pulse">
              <span className="text-white text-3xl">👤</span>
            </div>
            <div className="absolute -inset-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl blur opacity-20 animate-pulse"></div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-center space-x-2">
              <div className="loading loading-spinner loading-md text-blue-500"></div>
              <span className="text-lg font-medium text-gray-700 dark:text-gray-300">
                Loading your profile...
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

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-24 h-24 bg-red-100 dark:bg-red-900 rounded-2xl flex items-center justify-center shadow-xl mb-6 mx-auto">
            <span className="text-red-500 text-4xl">⚠️</span>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Profile Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            We couldn't load your profile information. Please try refreshing the page or logging in again.
          </p>
          
          <button 
            onClick={() => window.location.reload()} 
            className="btn bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-none shadow-lg"
          >
            <span className="mr-2">🔄</span>
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return <EditProfile user={user} />;
};

export default Profile;
