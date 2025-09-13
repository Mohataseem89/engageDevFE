import React, { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { useDispatch, useSelector } from "react-redux";
import { addFeed } from "../utils/feedSlice";
import UserCard from "./UserCard";

const Feed = () => {
  const feed = useSelector((store) => store.feed);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [initialLoad, setInitialLoad] = useState(true);

  const getfeed = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await axios.get(BASE_URL + "/feed", {
        withCredentials: true,
      });
      
      // console.log("Feed API Response:", res.data);
      
      // Handle different response structures
      let feedData = [];
      if (res.data.data && Array.isArray(res.data.data)) {
        feedData = res.data.data;
      } else if (Array.isArray(res.data)) {
        feedData = res.data;
      }
      
      dispatch(addFeed(feedData));
      
    } catch (err) {
      // console.error("Error fetching feed:", err);
      setError("Failed to load users. Please try again.");
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  };

  useEffect(() => {
    getfeed();
  }, []);

  // Auto-refresh feed when it becomes empty
  useEffect(() => {
    if (!initialLoad && feed && feed.length === 0) {
      // console.log("Feed is empty, refreshing...");
      setTimeout(() => {
        getfeed();
      }, 1000);
    }
  }, [feed, initialLoad]);

  // Loading state
  if (loading && initialLoad) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          <div className="loading loading-spinner loading-lg text-primary"></div>
          <p className="text-base-content/70">Finding amazing people for you...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold mb-4">Oops! Something went wrong</h2>
          <p className="text-error text-lg mb-6">{error}</p>
          <button 
            className="btn btn-primary"
            onClick={() => {
              setError(null);
              getfeed();
            }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // No feed data or empty feed
  if (!feed || feed.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center max-w-md">
          <div className="text-8xl mb-6">🎉</div>
          <h2 className="text-2xl font-semibold mb-4">
            {loading ? "Loading more users..." : "No More Users!"}
          </h2>
          <p className="text-base-content/70 mb-6">
            {loading 
              ? "Finding new profiles for you..." 
              : "You've seen all available users. Check back later for new profiles!"
            }
          </p>
          {loading ? (
            <div className="loading loading-spinner loading-md"></div>
          ) : (
            <div className="space-y-3">
              <button 
                className="btn btn-primary w-full"
                onClick={getfeed}
              >
                🔄 Refresh Feed
              </button>
              <p className="text-xs text-base-content/50">
                New users join every day!
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4">
      <div className="flex justify-center my-8">
        <div className="w-full max-w-md">
          {/* Feed Status */}
          <div className="text-center mb-6">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <p className="text-sm text-base-content/70">
                {feed.length} user{feed.length !== 1 ? 's' : ''} in your feed
              </p>
            </div>
            
            {/* Progress indicator */}
            <div className="w-full bg-base-300 rounded-full h-1">
              <div 
                className="bg-primary h-1 rounded-full transition-all duration-300"
                style={{ width: `${Math.max(10, (feed.length / 10) * 100)}%` }}
              ></div>
            </div>
          </div>

          {/* Current User Card */}
          <div className="relative">
            <UserCard user={feed[0]} />
            
            {/* Next user preview (optional) */}
            {feed[1] && (
              <div className="absolute -z-10 top-2 left-2 right-2 opacity-20">
                <div className="card bg-base-200 h-20 rounded-2xl"></div>
              </div>
            )}
          </div>

          {/* Quick Actions Info */}
          <div className="mt-6 text-center">
            <div className="flex justify-center space-x-6 text-xs text-base-content/60">
              <div className="flex items-center space-x-1">
                <span className="text-error">❌</span>
                <span>Ignore</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="text-primary">💖</span>
                <span>Interested</span>
              </div>
            </div>
            <p className="text-xs text-base-content/50 mt-2">
              Swipe through profiles to find your perfect match!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Feed;
