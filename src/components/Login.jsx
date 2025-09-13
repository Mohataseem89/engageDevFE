import React, { useState } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { addUser } from "../utils/userSlice";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../utils/constants";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    age: ""
  });
  const [isLoginForm, setIsLoginForm] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError(""); // Clear error on input change
  };

  const parseErrorMessage = (error) => {
    const errorString = error?.response?.data || error?.message || "";
    
    // Handle MongoDB duplicate key error
    if (errorString.includes("E11000 duplicate key error")) {
      if (errorString.includes("email")) {
        return "This email is already registered. Please use a different email or try logging in.";
      }
      return "This information is already registered. Please try with different details.";
    }
    
    // Handle other common errors
    if (errorString.includes("User not found")) {
      return "No account found with this email. Please check your email or sign up.";
    }
    
    if (errorString.includes("Invalid password") || errorString.includes("password")) {
      return "Incorrect password. Please try again.";
    }
    
    if (errorString.includes("validation")) {
      return "Please check your information and try again.";
    }
    
    // Extract clean error message if it's wrapped
    if (error?.response?.data?.message) {
      return error.response.data.message;
    }
    
    // Fallback messages
    return isLoginForm ? 
      "Login failed. Please check your credentials." : 
      "Signup failed. Please try again.";
  };

  const validateForm = () => {
    const { email, password, firstName, lastName, age } = formData;
    
    if (!email || !password) {
      setError("Email and password are required");
      return false;
    }

    if (!email.includes('@') || !email.includes('.')) {
      setError("Please enter a valid email address");
      return false;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return false;
    }

    if (!isLoginForm) {
      if (!firstName?.trim() || !lastName?.trim()) {
        setError("First name and last name are required");
        return false;
      }
      if (firstName.trim().length < 2) {
        setError("First name must be at least 2 characters long");
        return false;
      }
      if (age && (parseInt(age) < 18 || parseInt(age) > 100)) {
        setError("Age must be between 18 and 100");
        return false;
      }
    }

    return true;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      setError("");
      
      const res = await axios.post(
        BASE_URL + "/login",
        {
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
        },
        { withCredentials: true }
      );
      
      // console.log("Login successful:", res.data);
      dispatch(addUser(res.data));
      navigate("/");
    } catch (err) {
      // console.error("Login error:", err);
      setError(parseErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      setError("");
      
      const signupData = {
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
      };
      
      // Only add age if it's provided and valid
      if (formData.age && parseInt(formData.age) >= 18) {
        signupData.age = parseInt(formData.age);
      }
      
      // console.log("Sending signup data:", signupData);
      
      const res = await axios.post(
        BASE_URL + "/signup",
        signupData,
        { withCredentials: true }
      );
      
      // console.log("Signup successful:", res.data);
      dispatch(addUser(res.data.data || res.data.data));
      navigate("/profile");
    } catch (err) {
      // console.error("Signup error:", err);
      setError(parseErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const toggleForm = () => {
    setIsLoginForm(!isLoginForm);
    setError("");
    setFormData({
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      age: ""
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-base-200 to-base-300 px-4">
      <div className="card bg-base-100 w-full max-w-md shadow-2xl border border-base-300">
        <div className="card-body p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <span className="text-white font-bold text-2xl">E</span>
            </div>
            <h2 className="text-3xl font-bold text-base-content">
              {isLoginForm ? "Welcome Back" : "Create Account"}
            </h2>
            <p className="text-base-content/60 mt-2">
              {isLoginForm ? "Sign in to your account" : "Join our community today"}
            </p>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            {!isLoginForm && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div className="form-control">
                    <input
                      type="text"
                      placeholder="First Name"
                      className="input input-bordered w-full focus:input-primary"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                      maxLength="50"
                    />
                  </div>
                  <div className="form-control">
                    <input
                      type="text"
                      placeholder="Last Name"
                      className="input input-bordered w-full focus:input-primary"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                      maxLength="50"
                    />
                  </div>
                </div>
                
                <div className="form-control">
                  <input
                    type="number"
                    placeholder="Age (optional)"
                    className="input input-bordered w-full focus:input-primary"
                    value={formData.age}
                    onChange={(e) => handleInputChange("age", e.target.value)}
                    min="18"
                    max="100"
                  />
                </div>
              </>
            )}

            <div className="form-control">
              <input
                type="email"
                placeholder="Email Address"
                className="input input-bordered w-full focus:input-primary"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                maxLength="100"
              />
            </div>

            <div className="form-control">
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password (min 6 characters)"
                  className="input input-bordered w-full pr-12 focus:input-primary"
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  maxLength="100"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-base-content/60 hover:text-base-content transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d={showPassword ? "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" : "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"}
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="alert alert-error mt-4">
              <svg className="w-6 h-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Submit Button */}
          <div className="form-control mt-6">
            <button
              className={`btn btn-primary w-full ${loading ? 'loading' : ''}`}
              onClick={isLoginForm ? handleLogin : handleSignup}
              disabled={loading}
            >
              {loading ? '' : (isLoginForm ? 'Sign In' : 'Create Account')}
            </button>
          </div>

          {/* Toggle Form */}
          <div className="text-center mt-6">
            <button
              className="link link-primary text-sm hover:link-hover"
              onClick={toggleForm}
              disabled={loading}
            >
              {isLoginForm
                ? "Don't have an account? Sign up"
                : "Already have an account? Sign in"}
            </button>
          </div>

          {/* Additional Help */}
          {error.includes("already registered") && (
            <div className="text-center mt-4">
              <button
                className="btn btn-outline btn-sm"
                onClick={() => {
                  setIsLoginForm(true);
                  setError("");
                }}
              >
                Go to Login
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
