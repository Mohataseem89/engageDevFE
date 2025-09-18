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
  const [searchQuery, setSearchQuery] = useState('');

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

  const connections = Array.isArray(connectionsFromStore?.data) 
    ? connectionsFromStore.data 
    : Array.isArray(connectionsFromStore) 
    ? connectionsFromStore 
    : [];

  const validConnections = connections.filter((connection) => connection);

  const filteredConnections = validConnections.filter((connection) => {
    if (!searchQuery) return true;
    const fullName = `${connection.firstName || ''} ${connection.lastName || ''}`.toLowerCase();
    return fullName.includes(searchQuery.toLowerCase());
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg text-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading connections...</p>
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
          <button onClick={fetchConnections} className="btn btn-primary">
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Connections</h1>
          <p className="text-gray-600">
            {filteredConnections.length} connection{filteredConnections.length !== 1 ? 's' : ''} found
          </p>
        </div>

        {/* Search */}
        {validConnections.length > 0 && (
          <div className="text-black mb-8">
            <div className="max-w-md">
              <input
                type="text"
                placeholder="Search connections..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input input-bordered w-full bg-white"
              />
            </div>
          </div>
        )}

        {filteredConnections.length === 0 ? (
          <div className="text-center text-black py-16">
            <div className="text-gray-400 text-6xl mb-6">👥</div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              {searchQuery ? 'No matches found' : 'No connections yet'}
            </h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              {searchQuery 
                ? `No connections match "${searchQuery}".`
                : 'Start connecting with other developers to build your network.'}
            </p>
            {searchQuery ? (
              <button onClick={() => setSearchQuery('')} className="btn btn-outline">
                Clear Search
              </button>
            ) : (
              <Link to="/" className="btn btn-primary">
                Discover People
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredConnections.map((connection) => {
              const { _id, firstName, lastName, photoUrl, age, gender, about } = connection;
              
              return (
                <div 
                  key={_id}
                  className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow duration-200"
                >
                  <div className="text-center mb-4">
                    <div className="w-16 h-16 mx-auto rounded-full overflow-hidden border-2 border-gray-200">
                      <img 
                        src={photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(firstName || 'User')}+${encodeURIComponent(lastName || '')}&background=6366f1&color=fff&size=200`}
                        alt={`${firstName || 'User'} ${lastName || ''}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(firstName || 'User')}&background=6366f1&color=fff&size=200`;
                        }}
                      />
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {firstName} {lastName}
                    </h3>
                    
                    {(age || gender) && (
                      <p className="text-sm text-gray-500 mb-3">
                        {age && `${age} years old`}
                        {age && gender && " • "}
                        {gender && gender.charAt(0).toUpperCase() + gender.slice(1)}
                      </p>
                    )}
                    
                    {about && (
                      <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                        {about}
                      </p>
                    )}
                    
                    <div className="flex gap-2">
                      <Link 
                        to={`/chat/${_id}`}
                        className="btn btn-primary btn-sm flex-1"
                      >
                        Chat
                      </Link>
                      <button className=" text-black btn btn-outline btn-sm">
                        View
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

export default Connections;
