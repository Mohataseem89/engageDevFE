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

  const fetchConnections = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await axios.get(BASE_URL + "/user/connections", {
        withCredentials: true,
      });
      
      // Handle different response structures and clean data
      let connectionsData = [];
      
      if (res.data.data && Array.isArray(res.data.data)) {
        connectionsData = res.data.data.filter((c) => c); // Remove null/undefined
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

  // Loading State
  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <div className="loading loading-spinner loading-lg text-primary mb-4"></div>
        <p className="text-base-content/70">Loading your connections...</p>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">⚠️</div>
          <div className="text-error text-lg mb-4">{error}</div>
          <button 
            className="btn btn-primary" 
            onClick={fetchConnections}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Get connections data (handle both old and new Redux state structures)
  const connections = Array.isArray(connectionsFromStore?.data) 
    ? connectionsFromStore.data 
    : Array.isArray(connectionsFromStore) 
    ? connectionsFromStore 
    : [];

  // Filter out any null/undefined connections
  const validConnections = connections.filter((connection) => connection);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-base-content mb-2">
          My Connections
        </h1>
        <p className="text-base-content/70">
          {validConnections.length} connection{validConnections.length !== 1 ? 's' : ''} found
        </p>
      </div>

      {/* Empty State */}
      {validConnections.length === 0 ? (
        <div className="flex justify-center items-center min-h-64">
          <div className="text-center">
            <div className="text-8xl mb-6">🤝</div>
            <h2 className="text-2xl font-semibold text-base-content mb-4">
              No connections yet
            </h2>
            <p className="text-base-content/70 mb-6 max-w-md">
              Start connecting with other developers to see them here! 
              Build your professional network and discover amazing people.
            </p>
            <Link to="/" className="btn btn-primary btn-lg">
              Discover People
            </Link>
          </div>
        </div>
      ) : (
        /* Connections List - Responsive Layout */
        <div className="space-y-4">
          {/* Desktop Grid View */}
          <div className="hidden lg:grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {validConnections.map((connection) => {
              const { _id, firstName, lastName, photoUrl, age, gender, about } = connection;
              
              return (
                <div 
                  key={_id}
                  className="card bg-base-100 shadow-lg hover:shadow-xl transition-all duration-300 border border-base-200"
                >
                  <div className="card-body text-center p-6">
                    <div className="avatar mb-4">
                      <div className="w-20 h-20 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                        <img 
                          src={photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(firstName || 'User')}+${encodeURIComponent(lastName || '')}&background=6366f1&color=fff&size=200`}
                          alt={`${firstName || 'User'} ${lastName || ''}`}
                          className="rounded-full object-cover w-full h-full"
                          onError={(e) => {
                            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(firstName || 'User')}&background=6366f1&color=fff&size=200`;
                          }}
                        />
                      </div>
                    </div>
                    
                    <h3 className="card-title justify-center text-lg mb-2">
                      {firstName} {lastName}
                    </h3>
                    
                    {age && gender && (
                      <p className="text-base-content/60 text-sm">
                        {age}, {gender}
                      </p>
                    )}
                    
                    {about && (
                      <p className="text-base-content/70 text-sm mt-2 line-clamp-3">
                        {about}
                      </p>
                    )}
                    
                    <div className="card-actions justify-center mt-4 space-x-2">
                      <Link to={`/chat/${_id}`} className="btn btn-primary btn-sm">
                        💬 Chat
                      </Link>
                      <button className="btn btn-outline btn-sm">
                        👤 Profile
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Mobile List View */}
          <div className="lg:hidden space-y-4">
            {validConnections.map((connection) => {
              const { _id, firstName, lastName, photoUrl, age, gender, about } = connection;
              
              return (
                <div
                  key={_id}
                  className="flex items-center p-4 rounded-lg bg-base-100 shadow-md hover:shadow-lg transition-all duration-300 border border-base-200"
                >
                  {/* Profile Image */}
                  <div className="avatar mr-4">
                    <div className="w-16 h-16 rounded-full ring ring-primary ring-offset-2">
                      <img
                        alt={`${firstName} ${lastName}`}
                        className="rounded-full object-cover w-full h-full"
                        src={photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(firstName)}+${encodeURIComponent(lastName)}&background=6366f1&color=fff&size=200`}
                        onError={(e) => {
                          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(firstName)}&background=6366f1&color=fff&size=200`;
                        }}
                      />
                    </div>
                  </div>

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <h2 className="font-semibold text-lg text-base-content truncate">
                      {firstName} {lastName}
                    </h2>
                    {age && gender && (
                      <p className="text-sm text-base-content/60">
                        {age}, {gender}
                      </p>
                    )}
                    {about && (
                      <p className="text-sm text-base-content/70 mt-1 line-clamp-2">
                        {about}
                      </p>
                    )}
                  </div>

                  {/* Action Button */}
                  <div className="ml-4">
                    <Link to={`/chat/${_id}`}>
                      <button className="btn btn-primary btn-sm">
                        Chat
                      </button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Connections;
