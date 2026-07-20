import React, { useEffect, useState, useRef } from "react";
// import axios from "axios";
// import { BASE_URL } from "../utils/constants";
import { useDispatch, useSelector } from "react-redux";
import { addFeed, removeUserFromFeed } from "../utils/feedSlice";
import UserCard from "./UserCard";
import { Link } from "react-router-dom";
import axiosInstance from '../utils/axiosInstance';

const Feed = () => {
  const feed = useSelector((store) => store.feed);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [initialLoad, setInitialLoad] = useState(true);
  const [notification, setNotification] = useState({ message: '', type: '' });

  // Pagination — kept in refs (not just state) so the empty-feed effect below always
  // reads the latest page/hasMore/skills without depending on stale closures.
  const pageRef = useRef(1);
  const hasMoreRef = useRef(true);
  const appliedSkillsRef = useRef("");
  const [skillsInput, setSkillsInput] = useState("");
  const [appliedSkills, setAppliedSkills] = useState("");

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

  const getfeed = async (pageToFetch = 1, skillsOverride, showMessage = false) => {
    const skills =
      skillsOverride !== undefined ? skillsOverride : appliedSkillsRef.current;
    try {
      setLoading(true);
      setError(null);

      const params = { page: pageToFetch, limit: 10 };
      if (skills) params.skills = skills;

      const res = await axiosInstance.get("/feed");
      // const res = await axios.get(BASE_URL + "/feed", {
      //   params,
      //   withCredentials: true,
      // });

      let feedData = [];
      if (res.data.data && Array.isArray(res.data.data)) {
        feedData = res.data.data;
      } else if (Array.isArray(res.data)) {
        feedData = res.data;
      }

      dispatch(addFeed(feedData));
      pageRef.current = pageToFetch;
      hasMoreRef.current = res.data.pagination
        ? res.data.pagination.hasMore
        : feedData.length >= 10;

      if (showMessage) {
        showNotification(
          `Found ${feedData.length} new profile${feedData.length !== 1 ? "s" : ""}!`,
          "success"
        );
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

  const applySkillsFilter = (e) => {
    e.preventDefault();
    const trimmed = skillsInput.trim();
    setAppliedSkills(trimmed);
    appliedSkillsRef.current = trimmed;
    getfeed(1, trimmed, true);
  };

  const clearSkillsFilter = () => {
    setSkillsInput("");
    setAppliedSkills("");
    appliedSkillsRef.current = "";
    getfeed(1, "", true);
  };

  const handleSwipeAction = async (action, userId, userName) => {
    if (!userId) return;
    
    try {
      setIsSwipeActive(true);
      dispatch(removeUserFromFeed(userId));
      

      await axiosInstance.post(`/request/send/${action}/${userId}`, {});
      // await axios.post(
      //   `${BASE_URL}/request/send/${action}/${userId}`,
      //   {},
      //   { withCredentials: true }
      // );
      
      const message = action === 'interested' 
        ? `You connected with ${userName}! 💙`
        : `Passed on ${userName}`;
      showNotification(message, action === 'interested' ? 'success' : 'info');
      
    } catch (err) {
      console.error("Error with swipe action:", err);
      showNotification("Something went wrong. Please try again.", 'error');
    } finally {
      setIsSwipeActive(false);
      setSwipeDirection('');
      setSwipeOffset(0);
      setIsDragging(false);
    }
  };

  // Touch event handlers (same as before but condensed for space)
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
    
    if (Math.abs(deltaX) > deltaY && Math.abs(deltaX) > 10) {
      e.preventDefault();
      setSwipeOffset(deltaX);
      setSwipeDirection(deltaX > 50 ? 'right' : deltaX < -50 ? 'left' : '');
    }
  };

  const handleTouchEnd = (e) => {
    if (!isDragging || !feed || feed.length === 0 || isSwipeActive) return;
    const deltaX = currentTouchRef.current.x - startTouchRef.current.x;
    
    if (Math.abs(deltaX) > 100) {
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
    getfeed(1);
  }, []);

  // When the current page of the feed has been fully swiped through, fetch the next
  // page instead of re-fetching the same one — previously this retried page 1 forever.
  useEffect(() => {
    if (!initialLoad && (!feed || feed.length === 0) && !loading) {
      if (hasMoreRef.current) {
        const timer = setTimeout(() => {
          getfeed(pageRef.current + 1);
        }, 500);
        return () => clearTimeout(timer);
      }
    }
  }, [feed, initialLoad, loading]);

  // Notification Component
  const NotificationToast = () => {
    if (!notification.message) return null;
    const bgColor = {
      success: 'bg-green-500',
      error: 'bg-red-500',
      info: 'bg-blue-500'
    }[notification.type] || 'bg-gray-500';

    return (
      <div className="fixed top-4 right-4 z-50">
        <div className={`${bgColor} text-white px-4 py-3 rounded-lg shadow-lg flex items-center space-x-3 max-w-sm`}>
          <span className="text-lg">
            {notification.type === 'success' ? '✅' : notification.type === 'error' ? '❌' : 'ℹ️'}
          </span>
          <span className="text-sm font-medium">{notification.message}</span>
          <button onClick={() => setNotification({ message: '', type: '' })} className="text-white hover:text-gray-200">
            ✕
          </button>
        </div>
      </div>
    );
  };

  // Loading state
  if (loading && initialLoad) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg text-blue-600 mb-4"></div>
          <p className="text-gray-600">Finding amazing people for you...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Something went wrong</h2>
          <p className="text-red-600 mb-6">{error}</p>
          <button 
            className="btn btn-primary"
            onClick={() => {
              setError(null);
              getfeed(1, undefined, true);
            }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <NotificationToast />
      
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          
          {/* Page Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Discover People</h1>
            <p className="text-gray-600">Find your next connection</p>
          </div>

          {/* Skills Filter */}
          <div className="max-w-md mx-auto mb-8">
            <form onSubmit={applySkillsFilter} className="flex gap-2">
              <input
                type="text"
                value={skillsInput}
                onChange={(e) => setSkillsInput(e.target.value)}
                placeholder="Filter by skills, e.g. React, Node.js"
                className="input input-bordered flex-1 bg-white text-black"
              />
              <button type="submit" className="btn btn-primary" disabled={loading}>
                Search
              </button>
            </form>
            {appliedSkills && (
              <div className="mt-3 flex items-center justify-center gap-2 text-sm text-gray-600">
                <span>
                  Filtering by: <span className="font-medium">{appliedSkills}</span>
                </span>
                <button
                  onClick={clearSkillsFilter}
                  className="text-blue-600 hover:text-blue-800 underline"
                  disabled={loading}
                >
                  Clear
                </button>
              </div>
            )}
          </div>

          {!feed || feed.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-gray-400 text-6xl mb-6">🎉</div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                {loading ? "Loading more users..." : "Amazing! You've seen everyone!"}
              </h2>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                {loading 
                  ? "We're finding new profiles for you..." 
                  : "You've viewed all available users. New members join daily!"}
              </p>
              {loading ? (
                <div className="loading loading-spinner loading-md text-blue-500"></div>
              ) : (
                <div className="space-y-4">
                  <button 
                    className="btn btn-primary"
                    onClick={() => getfeed(1, undefined, true)}
                  >
                    Refresh Feed
                  </button>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link to="/connections" className="btn btn-outline">
                      View Connections
                    </Link>
                    <Link to="/requests" className="btn btn-outline">
                      Check Requests
                    </Link>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="w-full max-w-md">
                
                {/* Feed Status */}
                <div className="text-center mb-6">
                  <p className="text-sm text-gray-600 mb-3">
                    {feed.length} profile{feed.length !== 1 ? 's' : ''} remaining
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(10, Math.min(100, (feed.length / 10) * 100))}%` }}
                    ></div>
                  </div>
                </div>

                {/* Swipe Container */}
                <div className="relative mb-6">
                  <div 
                    ref={cardRef}
                    className="relative"
                    style={{
                      transform: isDragging ? `translateX(${swipeOffset}px) rotate(${swipeOffset * 0.1}deg)` : 'none',
                      opacity: isDragging ? Math.max(0.5, 1 - Math.abs(swipeOffset) / 300) : 1
                    }}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                  >
                    {isDragging && (
                      <>
                        <div 
                          className={`absolute top-4 right-4 z-20 transition-opacity duration-200 ${
                            swipeDirection === 'left' ? 'opacity-100' : 'opacity-0'
                          }`}
                        >
                          <div className="bg-red-500 text-white px-4 py-2 rounded-full font-bold text-sm">
                            PASS ❌
                          </div>
                        </div>
                        
                        <div 
                          className={`absolute top-4 left-4 z-20 transition-opacity duration-200 ${
                            swipeDirection === 'right' ? 'opacity-100' : 'opacity-0'
                          }`}
                        >
                          <div className="bg-green-500 text-white px-4 py-2 rounded-full font-bold text-sm">
                            LIKE 💙
                          </div>
                        </div>
                      </>
                    )}
                    
                    <UserCard key={feed[0]._id} user={feed[0]} />
                  </div>
                </div>

                {/* Instructions */}

                {/* Quick Actions */}
                <div className="text-black flex justify-center space-x-3">
                  <button 
                    onClick={() => getfeed(1, undefined, true)}
                    className="btn btn-outline btn-sm"
                    disabled={loading || isSwipeActive}
                  >
                    {loading ? <div className="loading loading-spinner loading-xs"></div> : '🔄'}
                    Refresh
                  </button>
                  <Link to="/connections" className="btn btn-outline btn-sm">
                    👥 Connections
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