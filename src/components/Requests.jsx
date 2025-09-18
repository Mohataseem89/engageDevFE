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

  const reviewRequest = async (status, _id, userName) => {
    try {
      setProcessingId(_id);
      await axios.post(
        `${BASE_URL}/request/review/${status}/${_id}`,
        {},
        { withCredentials: true }
      );
      dispatch(removeRequest(_id));
    } catch (err) {
      console.error("Error reviewing request:", err);
      alert("Failed to process the request. Please try again.");
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg text-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading requests...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Something went wrong</h2>
          <p className="text-red-600 mb-6">{error}</p>
          <button onClick={fetchRequests} className="btn btn-primary">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Connection Requests</h1>
          <p className="text-gray-600">
            {requests.length} pending request{requests.length !== 1 ? 's' : ''}
          </p>
        </div>

        {requests.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-gray-400 text-6xl mb-6">📨</div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              No Connection Requests
            </h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              You don't have any pending connection requests at the moment.
            </p>
            <Link to="/" className="btn btn-primary">
              Discover People
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {requests.map((request) => {
              if (!request || !request.fromUserId) return null;

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
                  className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow duration-200"
                >
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="flex-shrink-0">
                        <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-200">
                          <img
                            src={photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(firstName)}+${encodeURIComponent(lastName)}&background=6366f1&color=fff&size=200`}
                            alt={userName}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(firstName)}&background=6366f1&color=fff&size=200`;
                            }}
                          />
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-semibold text-gray-900 mb-1">
                          {userName}
                        </h3>
                        {(age || gender) && (
                          <p className="text-sm text-gray-500 mb-2">
                            {age && `${age} years old`}
                            {age && gender && " • "}
                            {gender && gender.charAt(0).toUpperCase() + gender.slice(1)}
                          </p>
                        )}
                        {about && (
                          <p className="text-gray-600 text-sm leading-relaxed line-clamp-2">
                            {about}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex space-x-3 w-full md:w-auto">
                      <button
                        className={`btn btn-outline flex-1 md:flex-initial ${isProcessing ? 'loading' : ''}`}
                        onClick={() => reviewRequest("rejected", _id, userName)}
                        disabled={isProcessing}
                      >
                        {!isProcessing && '❌'} Decline
                      </button>
                      <button
                        className={`btn btn-success flex-1 md:flex-initial ${isProcessing ? 'loading' : ''}`}
                        onClick={() => reviewRequest("accepted", _id, userName)}
                        disabled={isProcessing}
                      >
                        {!isProcessing && '✅'} Accept
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
  );
};

export default Requests;
