import React from "react";
import { useState } from "react";
import UserCard from "./UserCard";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { useDispatch } from "react-redux";
import { addUser } from "../utils/userSlice";

const EditProfile = ({ user }) => {
  
  const [firstName, setFirstName] = useState(user.firstName || "");
  const [lastName, setLastName] = useState(user.lastName || "");
  const [age, setAge] = useState(user.age || "");
  const [gender, setGender] = useState(user.gender || "");
  const [about, setAbout] = useState(user.about || "");
  const [photoUrl, setPhotoUrl] = useState(user.photoUrl || "");
  const [isLoading, setIsLoading] = useState(false);
  
  const dispatch = useDispatch();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const saveProfile = async () => {
    // Clear previous messages
    setError("");
    setSuccess("");
    setIsLoading(true);

    // Basic validation
    if (!firstName.trim() || !lastName.trim()) {
      setError("First name and last name are required");
      setIsLoading(false);
      return;
    }

    if (age && (age < 18 || age > 120)) {
      setError("Please enter a valid age between 18 and 120");
      setIsLoading(false);
      return;
    }

    try {
      const res = await axios.post(
        BASE_URL + "/profile/edit",
        {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          photoUrl: photoUrl.trim(),
          age: age ? parseInt(age) : undefined,
          gender: gender.trim(),
          about: about.trim(),
        },
        { withCredentials: true }
      );
      
      dispatch(addUser(res?.data?.data));
      setSuccess("Profile updated successfully!");
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(""), 3000);
      
    } catch (err) {
      // Better error handling
      if (err.response) {
        setError(err.response.data || "Failed to update profile");
      } else if (err.request) {
        setError("Network error. Please check your connection.");
      } else {
        setError("An unexpected error occurred");
      }
      console.error("Profile update error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center my-10">
      <div className="flex justify-center mx-10">
        <div>
          <div className="card card-border bg-base-300 w-96">
            <div className="card-body">
              <h2 className="card-title justify-center">Edit Profile</h2>
              
              <fieldset className="fieldset">
                <input
                  type="text"
                  value={firstName}
                  className="input"
                  placeholder="First Name*"
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </fieldset>
              
              <fieldset className="fieldset">
                <input
                  value={lastName}
                  type="text"
                  className="input"
                  placeholder="Last Name*"
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </fieldset>
              
              <fieldset className="fieldset">
                <input
                  value={photoUrl}
                  type="url"
                  className="input"
                  placeholder="Photo URL"
                  onChange={(e) => setPhotoUrl(e.target.value)}
                />
              </fieldset>
              
              <fieldset className="fieldset">
                <input
                  value={age}
                  type="number"
                  className="input"
                  placeholder="Age"
                  min="18"
                  max="120"
                  onChange={(e) => setAge(e.target.value)}
                />
              </fieldset>
              
              <fieldset className="fieldset">
                <select
                  value={gender}
                  className="select select-bordered w-full"
                  onChange={(e) => setGender(e.target.value)}
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </fieldset>
              
              <fieldset className="fieldset">
                <textarea
                  value={about}
                  className="textarea textarea-bordered"
                  placeholder="About yourself"
                  rows="3"
                  maxLength="500"
                  onChange={(e) => setAbout(e.target.value)}
                />
              </fieldset>

              {error && <p className="text-red-500 text-sm">{error}</p>}
              {success && <p className="text-green-500 text-sm">{success}</p>}
              
              <div className="card-actions justify-center">
                <button 
                  className={`btn btn-primary ${isLoading ? 'loading' : ''}`}
                  onClick={saveProfile}
                  disabled={isLoading}
                >
                  {isLoading ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <UserCard user={{ firstName, lastName, photoUrl, age, gender, about }} />
    </div>
  );
};

export default EditProfile;
