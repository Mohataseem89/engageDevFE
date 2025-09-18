import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { useDispatch, useSelector } from "react-redux";
import { addFeed, removeUserFromFeed } from "../utils/feedSlice";
import UserCard from "./UserCard";
import { Link } from "react-router-dom";

const Feed = () => {
  const feed = useSelector((store) => store.feed);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [initialLoad, setInitialLoad] = useState(true);
  const [notification, setNotification] = useState({ message: '', type: '' });
  const [stats, setStats] = useState({ totalViewed: 0, connections: 0 });
  
  // Swipe functionality state
  const [isSwipeActive, setIsSwipeActive] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState('');
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const cardRef = useRef(null);
  const startTouchRef = useRef({ x: 0, y: 0 });
  const currentTouchRef = useRef({ x: 0, y: 0 });

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: '', type: '' }), 3000);
  };

  const getfeed = async (showMessage = false) => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await axios.get(BASE_URL + "/feed", {
        withCredentials: true,
      });
      
      let feedData = [];
      if (res.data.data && Array.isArray(res.data.data)) {
        feedData = res.data.data;
      } else if (Array.isArray(res.data)) {
        feedData = res.data;
      }
      
      dispatch(addFeed(feedData));
      
      if (showMessage) {
        showNotification(`Found ${feedData.length} new profiles!`, 'success');
      }
      
    } catch (err) {
      console.error("Error fetching feed:", err);
      setError(
        err.response?.data?.message || 
        "Failed to load users. Please try again."
      );
      if (showMessage) {
        showNotification("Failed to refresh feed. Please try again.", 'error');
      }
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  };

  // Handle swipe actions - FIXED VERSION
  const handleSwipeAction = async (action, userId, userName) => {
    if (!userId) return;
    
    try {
      setIsSwipeActive(true);
      
      // First, remove user from feed immediately for smooth UX
      dispatch(removeUserFromFeed(userId));
      
      // Then send API request
      await axios.post(
        `${BASE_URL}/request/send/${action}/${userId}`,
        {},
        { withCredentials: true }
      );
      
      // Update stats
      if (action === 'interested') {
        setStats(prev => ({ ...prev, connections: prev.connections + 1 }));
      }
      setStats(prev => ({ ...prev, totalViewed: prev.totalViewed + 1 }));
      
      // Show notification
      const message = action === 'interested' 
        ? `You connected with ${userName}! 💙`
        : `Passed on ${userName}`;
      showNotification(message, action === 'interested' ? 'success' : 'info');
      
    } catch (err) {
      console.error("Error with swipe action:", err);
      showNotification("Something went wrong. Please try again.", 'error');
      // If API fails, we could optionally re-add the user back to feed
      // But for UX, we'll keep them removed
    } finally {
      setIsSwipeActive(false);
      setSwipeDirection('');
      setSwipeOffset(0);
      setIsDragging(false);
    }
  };

  // Touch event handlers
  const handleTouchStart = (e) => {
    if (!feed || feed.length === 0 || isSwipeActive) return;
    
    const touch = e.touches[0];
    startTouchRef.current = { x: touch.clientX, y: touch.clientY };
    currentTouchRef.current = { x: touch.clientX, y: touch.clientY };
    setIsDragging(true);
  };

  const handleTouchMove = (e) => {
    if (!isDragging || !feed || feed.length === 0 || isSwipeActive) return;
    
    const touch = e.touches[0];
    currentTouchRef.current = { x: touch.clientX, y: touch.clientY };
    
    const deltaX = touch.clientX - startTouchRef.current.x;
    const deltaY = Math.abs(touch.clientY - startTouchRef.current.y);
    
    // Only handle horizontal swipes (not vertical scrolling)
    if (Math.abs(deltaX) > deltaY && Math.abs(deltaX) > 10) {
      e.preventDefault();
      setSwipeOffset(deltaX);
      
      if (deltaX > 50) {
        setSwipeDirection('right');
      } else if (deltaX < -50) {
        setSwipeDirection('left');
      } else {
        setSwipeDirection('');
      }
    }
  };

  const handleTouchEnd = (e) => {
    if (!isDragging || !feed || feed.length === 0 || isSwipeActive) return;
    
    const deltaX = currentTouchRef.current.x - startTouchRef.current.x;
    const swipeThreshold = 100;
    
    if (Math.abs(deltaX) > swipeThreshold) {
      const currentUser = feed[0];
      if (currentUser) {
        const action = deltaX > 0 ? 'interested' : 'ignored';
        const userName = `${currentUser.firstName} ${currentUser.lastName}`;
        handleSwipeAction(action, currentUser._id, userName);
        return;
      }
    }
    
    // Reset if swipe wasn't strong enough
    setIsDragging(false);
    setSwipeDirection('');
    setSwipeOffset(0);
  };

  // Mouse event handlers for desktop testing
  const handleMouseDown = (e) => {
    if (!feed || feed.length === 0 || isSwipeActive) return;
    startTouchRef.current = { x: e.clientX, y: e.clientY };
    setIsDragging(true);
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !feed || feed.length === 0 || isSwipeActive) return;
    
    const deltaX = e.clientX - startTouchRef.current.x;
    setSwipeOffset(deltaX);
    
    if (deltaX > 50) {
      setSwipeDirection('right');
    } else if (deltaX < -50) {
      setSwipeDirection('left');
    } else {
      setSwipeDirection('');
    }
  };

  const handleMouseUp = (e) => {
    if (!isDragging || !feed || feed.length === 0 || isSwipeActive) return;
    
    const deltaX = e.clientX - startTouchRef.current.x;
    const swipeThreshold = 100;
    
    if (Math.abs(deltaX) > swipeThreshold) {
      const currentUser = feed[0];
      if (currentUser) {
        const action = deltaX > 0 ? 'interested' : 'ignored';
        const userName = `${currentUser.firstName} ${currentUser.lastName}`;
        handleSwipeAction(action, currentUser._id, userName);
        return;
      }
    }
    
    setIsDragging(false);
    setSwipeDirection('');
    setSwipeOffset(0);
  };

  useEffect(() => {
    getfeed();
  }, []);

  // Auto-refresh feed when it becomes empty (IMPROVED)
  useEffect(() => {
    if (!initialLoad && (!feed || feed.length === 0) && !loading) {
      console.log("Feed is empty, auto-refreshing...");
      setTimeout(() => {
        getfeed(false);
      }, 1000);
    }
  }, [feed, initialLoad, loading]);

  // Add mouse event listeners for desktop
  useEffect(() => {
    const handleMouseMoveGlobal = (e) => {
      if (isDragging) handleMouseMove(e);
    };
    
    const handleMouseUpGlobal = (e) => {
      if (isDragging) handleMouseUp(e);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMoveGlobal);
      document.addEventListener('mouseup', handleMouseUpGlobal);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMoveGlobal);
      document.removeEventListener('mouseup', handleMouseUpGlobal);
    };
  }, [isDragging]);

  // Notification Component
  const NotificationToast = () => {
    if (!notification.message) return null;

    const bgColor = {
      success: 'bg-green-500',
      error: 'bg-red-500',
      info: 'bg-blue-500'
    }[notification.type] || 'bg-gray-500';

    return (
      <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 duration-300">
        <div className={`${bgColor} text-white px-4 py-3 rounded-lg shadow-lg flex items-center space-x-3 max-w-sm`}>
          <span className="text-lg">
            {notification.type === 'success' ? '✅' : notification.type === 'error' ? '❌' : 'ℹ️'}
          </span>
          <span className="text-sm font-medium">{notification.message}</span>
          <button 
            onClick={() => setNotification({ message: '', type: '' })}
            className="text-white hover:text-gray-200"
          >
            ✕
          </button>
        </div>
      </div>
    );
  };

  // Loading state
  if (loading && initialLoad) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-8">
            <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-2xl animate-pulse">
              <span className="text-white text-3xl">🔍</span>
            </div>
            <div className="absolute -inset-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl blur opacity-20 animate-pulse"></div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-center space-x-2">
              <div className="loading loading-spinner loading-md text-blue-500"></div>
              <span className="text-lg font-medium text-gray-700 dark:text-gray-300">
                Finding amazing people for you...
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

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <span className="text-red-500 text-4xl">⚠️</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Oops! Something went wrong
          </h2>
          <p className="text-red-600 dark:text-red-400 text-lg mb-6">{error}</p>
          <button 
            className="btn bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-none shadow-lg"
            onClick={() => {
              setError(null);
              getfeed(true);
            }}
          >
            <span className="mr-2">🔄</span>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <NotificationToast />
      
      <div className="min-h-screen bg-white dark:bg-gray-900">
        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* No feed data or empty feed */}
          {!feed || feed.length === 0 ? (
            <div className="flex justify-center items-center min-h-96">
              <div className="text-center max-w-lg">
                <div className="w-32 h-32 mx-auto mb-8 rounded-3xl bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 flex items-center justify-center">
                  <span className="text-6xl">🎉</span>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  {loading ? "Loading more users..." : "Amazing! You've seen everyone!"}
                </h2>
                <p className="text-gray-600 dark:text-gray-300 text-lg mb-8 leading-relaxed">
                  {loading 
                    ? "We're finding new profiles for you..." 
                    : "You've viewed all available users. New members join daily, so check back soon for fresh connections!"
                  }
                </p>
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="loading loading-spinner loading-md text-blue-500"></div>
                    <span className="text-gray-500">Finding new profiles...</span>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <button 
                      className="btn bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-none shadow-lg hover:shadow-xl transition-all duration-200"
                      onClick={() => getfeed(true)}
                    >
                      <span className="mr-2">🔄</span>
                      Refresh Feed
                    </button>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <Link to="/connections" className="btn btn-outline">
                        <span className="mr-2">👥</span>
                        View Connections
                      </Link>
                      <Link to="/requests" className="btn btn-outline">
                        <span className="mr-2">📋</span>
                        Check Requests
                      </Link>
                    </div>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      💡 New users join every day! Come back later for more profiles.
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Feed Display */
            <div className="flex justify-center">
              <div className="w-full max-w-md">
                
                {/* Feed Status */}
                <div className="text-center mb-6">
                  <div className="flex items-center justify-center space-x-2 mb-3">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {feed.length} profile{feed.length !== 1 ? 's' : ''} remaining
                    </p>
                  </div>
                  
                  {/* Progress indicator */}
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(10, Math.min(100, (feed.length / 10) * 100))}%` }}
                    ></div>
                  </div>

                  {/* Mobile Stats */}
                  <div className="md:hidden flex justify-center space-x-6 text-xs text-gray-500 dark:text-gray-400 mb-4">
                    <div className="text-center">
                      <div className="text-sm font-bold text-blue-600">{feed.length}</div>
                      <div>Remaining</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-bold text-green-600">{stats.connections}</div>
                      <div>Connections</div>
                    </div>
                  </div>
                </div>

                {/* Swipe Container */}
                <div className="relative mb-6 overflow-hidden">
                  {/* Current User Card with Swipe */}
                  <div 
                    ref={cardRef}
                    className={`relative transition-transform duration-300 ease-out ${
                      isDragging ? '' : 'transform-none'
                    }`}
                    style={{
                      transform: isDragging ? `translateX(${swipeOffset}px) rotate(${swipeOffset * 0.1}deg)` : 'none',
                      opacity: isDragging ? Math.max(0.5, 1 - Math.abs(swipeOffset) / 300) : 1
                    }}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    onMouseDown={handleMouseDown}
                  >
                    {/* Swipe Indicators */}
                    {isDragging && (
                      <>
                        {/* Left Swipe Indicator (Pass) */}
                        <div 
                          className={`absolute top-4 right-4 z-20 transition-opacity duration-200 ${
                            swipeDirection === 'left' ? 'opacity-100' : 'opacity-0'
                          }`}
                        >
                          <div className="bg-red-500 text-white px-4 py-2 rounded-full font-bold text-sm transform rotate-12">
                            PASS ❌
                          </div>
                        </div>
                        
                        {/* Right Swipe Indicator (Like) */}
                        <div 
                          className={`absolute top-4 left-4 z-20 transition-opacity duration-200 ${
                            swipeDirection === 'right' ? 'opacity-100' : 'opacity-0'
                          }`}
                        >
                          <div className="bg-green-500 text-white px-4 py-2 rounded-full font-bold text-sm transform -rotate-12">
                            LIKE 💙
                          </div>
                        </div>
                      </>
                    )}
                    
                    <UserCard user={feed[0]} />
                  </div>
                  
                  {/* Next user preview */}
                  {feed[1] && (
                    <div className="absolute -z-10 top-2 left-2 right-2 opacity-10">
                      <div className="bg-gray-200 dark:bg-gray-700 h-20 rounded-2xl"></div>
                    </div>
                  )}
                </div>

                {/* Swipe Instructions */}
               

                {/* Quick Actions */}
                <div className="mt-6 flex justify-center space-x-3">
                  <button 
                    onClick={() => getfeed(true)}
                    className="btn btn-outline btn-sm"
                    disabled={loading || isSwipeActive}
                  >
                    {loading ? (
                      <div className="loading loading-spinner loading-xs"></div>
                    ) : (
                      <span className="mr-1">🔄</span>
                    )}
                    Refresh
                  </button>
                  <Link to="/connections" className="btn btn-outline btn-sm">
                    <span className="mr-1">👥</span>
                    Connections
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Feed;
