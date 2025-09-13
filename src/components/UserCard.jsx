import React, { useState } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { BASE_URL } from "../utils/constants";
import { removeUserFromFeed } from "../utils/feedSlice";

const UserCard = ({ user }) => {
  const { _id, firstName, lastName, photoUrl, age, gender, about } = user;
  const dispatch = useDispatch();
  const [isProcessing, setIsProcessing] = useState(false);
  const [actionTaken, setActionTaken] = useState(null);
  
  const handlerequest = async (status, userId) => {
    try {
      setIsProcessing(true);
      setActionTaken(status);
      
      const res = await axios.post(
        `${BASE_URL}/request/send/${status}/${userId}`, 
        {}, 
        { withCredentials: true }
      );
      
      console.log("Request sent successfully:", res.data);
      
      // Remove user from feed after successful request
      setTimeout(() => {
        dispatch(removeUserFromFeed(userId));
      }, 500); // Small delay for better UX
      
    } catch (err) {
      console.error("Error sending request:", err);
      setIsProcessing(false);
      setActionTaken(null);
      // You could add a toast notification here
      alert("Failed to send request. Please try again.");
    }
  };

  // If action is taken, show feedback animation
  if (actionTaken) {
    return (
      <div className="p-2">
        <div className="card bg-base-100 w-96 max-w-sm shadow-xl border border-base-200 opacity-75 transform scale-95 transition-all duration-500">
          <div className="card-body p-6 text-center">
            <div className="text-4xl mb-4">
              {actionTaken === "interested" ? "💖" : "👋"}
            </div>
            <h3 className="text-lg font-semibold">
              {actionTaken === "interested" 
                ? `You're interested in ${firstName}!` 
                : `${firstName} has been ignored`}
            </h3>
            <p className="text-sm text-base-content/60 mt-2">
              Loading next profile...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-2">
      <div className="card bg-base-100 w-96 max-w-sm shadow-xl hover:shadow-2xl transition-all duration-300 border border-base-200">
        {/* Image Section */}
        <figure className="relative overflow-hidden rounded-t-2xl">
          <img
            src={photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(firstName)}+${encodeURIComponent(lastName)}&background=6366f1&color=fff&size=400`}
            alt={`${firstName} ${lastName}'s profile photo`}
            className="w-full h-80 object-cover transition-transform duration-300 hover:scale-105"
            onError={(e) => {
              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(firstName)}&background=6366f1&color=fff&size=400`;
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
        </figure>
        
        {/* Card Body */}
        <div className="card-body p-6 space-y-4">
          {/* Header Section */}
          <div className="space-y-2">
            <h2 className="card-title text-xl font-bold text-base-content flex items-center justify-between">
              <span className="truncate">
                {firstName} {lastName}
              </span>
              {(age || gender) && (
                <div className="badge badge-outline text-xs font-normal">
                  {age && `${age}`}
                  {age && gender && ", "}
                  {gender}
                </div>
              )}
            </h2>
          </div>

          {/* About Section */}
          {about && (
            <div className="space-y-2">
              <p className="text-sm text-base-content/80 leading-relaxed line-clamp-3">
                {about}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="card-actions justify-center pt-4 space-x-3">
            <button
              className={`btn btn-outline btn-error flex-1 max-w-32 group hover:scale-105 transition-all duration-200 ${
                isProcessing ? 'loading' : ''
              }`}
              onClick={() => handlerequest("ignored", _id)}
              disabled={isProcessing}
              aria-label={`Ignore ${firstName}`}
            >
              {!isProcessing && (
                <svg 
                  className="w-4 h-4 mr-1 group-hover:scale-110 transition-transform duration-200" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
              {isProcessing && actionTaken === "ignored" ? "" : "Ignore"}
            </button>
            
            <button
              className={`btn btn-primary flex-1 max-w-32 group hover:scale-105 transition-all duration-200 ${
                isProcessing ? 'loading' : ''
              }`}
              onClick={() => handlerequest("interested", _id)}
              disabled={isProcessing}
              aria-label={`Show interest in ${firstName}`}
            >
              {!isProcessing && (
                <svg 
                  className="w-4 h-4 mr-1 group-hover:scale-110 transition-transform duration-200" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              )}
              {isProcessing && actionTaken === "interested" ? "" : "Interested"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserCard;
