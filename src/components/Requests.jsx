import React, { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { useDispatch, useSelector } from "react-redux";
import { addRequests, removeRequest } from "../utils/requestSlice";

const Requests = () => {
  const dispatch = useDispatch();
  const requests = useSelector((store) => store.requests) || [];

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingId, setProcessingId] = useState(null);


  




  const reviewRequest = async (status, _id) => {
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
      // Fixed the typo: "recieved" -> "received"
      const res = await axios.get(`${BASE_URL}/user/requests/received`, {
        withCredentials: true,
      });

      console.log("API Response:", res.data);

      if (res.data && Array.isArray(res.data.data)) {
        // Filter out requests without valid fromUserId
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
      <div className="flex justify-center items-center min-h-screen">
        <div className="loading loading-spinner loading-lg text-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">⚠️</div>
          <p className="text-error text-lg mb-4">{error}</p>
          <button 
            onClick={fetchRequests} 
            className="btn btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!requests.length) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="text-8xl mb-6">📨</div>
          <h2 className="text-2xl font-semibold mb-4">No Connection Requests</h2>
          <p className="text-base-content/70 max-w-md">
            You don't have any pending connection requests at the moment.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-base-content mb-2">
          Connection Requests
        </h1>
        <p className="text-base-content/70">
          {requests.length} pending request{requests.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="space-y-4 max-w-4xl mx-auto">
        {requests.map((request) => {
          // Safely destructure with null checks
          if (!request || !request.fromUserId) {
            console.warn("Invalid request data:", request);
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

          return (
            <div
              key={_id}
              className="flex flex-col md:flex-row items-center justify-between p-6 rounded-lg bg-base-100 shadow-lg hover:shadow-xl transition-all duration-300 border border-base-200"
            >
              {/* Profile Section */}
              <div className="flex items-center space-x-4 flex-1">
                <div className="avatar">
                  <div className="w-20 h-20 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                    <img
                      alt={`${firstName} ${lastName}`}
                      className="rounded-full object-cover w-full h-full"
                      src={
                        photoUrl || 
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(firstName)}+${encodeURIComponent(lastName)}&background=6366f1&color=fff&size=200`
                      }
                      onError={(e) => {
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(firstName)}&background=6366f1&color=fff&size=200`;
                      }}
                    />
                  </div>
                </div>
                
                <div className="flex-1 text-left">
                  <h2 className="font-bold text-xl text-base-content">
                    {firstName} {lastName}
                  </h2>
                  {(age || gender) && (
                    <p className="text-base-content/60 text-sm">
                      {age && `${age}`}{age && gender && ", "}{gender}
                    </p>
                  )}
                  {about && (
                    <p className="text-base-content/80 text-sm mt-2 line-clamp-2">
                      {about}
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 mt-4 md:mt-0">
                <button
                  className={`btn btn-outline btn-error ${isProcessing ? 'loading' : ''}`}
                  onClick={() => reviewRequest("rejected", _id)}
                  disabled={isProcessing}
                >
                  {!isProcessing && '❌'} Reject
                </button>
                <button
                  className={`btn btn-success ${isProcessing ? 'loading' : ''}`}
                  onClick={() => reviewRequest("accepted", _id)}
                  disabled={isProcessing}
                >
                  {!isProcessing && '✅'} Accept
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Requests;
