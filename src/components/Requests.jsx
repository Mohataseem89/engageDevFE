import React, { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { useDispatch, useSelector } from "react-redux";
import { addRequests, removeRequest } from "../utils/requestSlice";
import { Link } from "react-router-dom";

const Requests = () => {
  const dispatch = useDispatch();
  const requests = useSelector((store) => store.requests) || [];

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingId, setProcessingId] = useState(null);
  const [notification, setNotification] = useState({ message: '', type: '' });

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: '', type: '' }), 3000);
  };

  const reviewRequest = async (status, _id, userName) => {
    try {
      setProcessingId(_id);
      await axios.post(
        `${BASE_URL}/request/review/${status}/${_id}`,
        {},
        { withCredentials: true }
      );
      dispatch(removeRequest(_id));
      showNotification(
        `${userName}'s request has been ${status}!`,
        status === 'accepted' ? 'success' : 'info'
      );
    } catch (err) {
      console.error("Error reviewing request:", err);
      showNotification("Failed to process the request. Please try again.", 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const fetchRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${BASE_URL}/user/requests/received`, {
        withCredentials: true,
      });

      if (res.data && Array.isArray(res.data.data)) {
        const validRequests = res.data.data.filter((request) => 
          request && request.fromUserId && request.fromUserId.firstName
        );
        dispatch(addRequests(validRequests));
      } else {
        dispatch(addRequests([]));
      }
    } catch (err) {
      console.error("Error fetching requests:", err);
      setError(
        err.response?.data?.message || 
        "Failed to load requests. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

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

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-2xl animate-pulse">
            <span className="text-white text-3xl">📋</span>
          </div>
          <div className="flex items-center justify-center space-x-2">
            <div className="loading loading-spinner loading-md text-blue-500"></div>
            <span className="text-lg font-medium text-gray-700 dark:text-gray-300">
              Loading requests...
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Error State
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
            onClick={fetchRequests}
            className="btn bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-none shadow-lg"
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
        {/* Header Section - matching navbar style */}
        <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">📋</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Connection Requests
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {requests.length} pending request{requests.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          {requests.length === 0 ? (
            /* Empty State */
            <div className="text-center py-16">
              <div className="w-32 h-32 mx-auto mb-8 rounded-3xl bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 flex items-center justify-center">
                <span className="text-6xl">📨</span>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                No Connection Requests
              </h2>
              <p className="text-gray-600 dark:text-gray-300 text-lg mb-8 max-w-md mx-auto leading-relaxed">
                You don't have any pending connection requests at the moment. 
                Keep engaging with the community to grow your network!
              </p>
              <Link 
                to="/" 
                className="btn bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-none shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <span className="mr-2">🔍</span>
                Discover People
              </Link>
            </div>
          ) : (
            /* Requests List */
            <div className="space-y-6">
              {requests.map((request) => {
                if (!request || !request.fromUserId) {
                  return null;
                }

                const { _id } = request;
                const { 
                  firstName = "Unknown", 
                  lastName = "", 
                  photoUrl, 
                  age, 
                  gender, 
                  about 
                } = request.fromUserId;

                const isProcessing = processingId === _id;
                const userName = `${firstName} ${lastName}`;

                return (
                  <div
                    key={_id}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md hover:border-blue-200 dark:hover:border-blue-700 transition-all duration-200"
                  >
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                      
                      {/* Profile Section */}
                      <div className="flex items-center space-x-4 flex-1">
                        <div className="relative flex-shrink-0">
                          <div className="w-16 h-16 rounded-full overflow-hidden ring-2 ring-gray-200 dark:ring-gray-600">
                            <img
                              src={photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(firstName)}+${encodeURIComponent(lastName)}&background=6366f1&color=fff&size=200`}
                              alt={userName}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(firstName)}&background=6366f1&color=fff&size=200`;
                              }}
                            />
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center">
                            <span className="text-white text-xs">+</span>
                          </div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
                            {userName}
                          </h3>
                          {(age || gender) && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                              {age && `${age} years old`}
                              {age && gender && " • "}
                              {gender && gender.charAt(0).toUpperCase() + gender.slice(1)}
                            </p>
                          )}
                          {about && (
                            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed line-clamp-2">
                              {about}
                            </p>
                          )}
                          <div className="flex items-center mt-3 text-xs text-gray-500 dark:text-gray-400">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Wants to connect with you
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex space-x-3 w-full md:w-auto">
                        <button
                          className={`btn btn-outline flex-1 md:flex-initial ${isProcessing && processingId === _id ? 'loading' : ''} hover:bg-red-50 hover:border-red-300 hover:text-red-600`}
                          onClick={() => reviewRequest("rejected", _id, userName)}
                          disabled={isProcessing}
                        >
                          {!isProcessing && <span className="mr-2">❌</span>}
                          {isProcessing && processingId === _id ? 'Processing...' : 'Decline'}
                        </button>
                        <button
                          className={`btn bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white border-none flex-1 md:flex-initial ${isProcessing && processingId === _id ? 'loading' : ''}`}
                          onClick={() => reviewRequest("accepted", _id, userName)}
                          disabled={isProcessing}
                        >
                          {!isProcessing && <span className="mr-2">✅</span>}
                          {isProcessing && processingId === _id ? 'Processing...' : 'Accept'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Requests;
