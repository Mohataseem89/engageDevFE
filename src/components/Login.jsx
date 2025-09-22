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
    if (error) setError("");
  };

  const parseErrorMessage = (error) => {
    const errorString = error?.response?.data || error?.message || "";
    
    if (errorString.includes("E11000 duplicate key error")) {
      if (errorString.includes("email")) {
        return "This email is already registered. Please use a different email or try logging in.";
      }
      return "This information is already registered. Please try with different details.";
    }
    
    if (errorString.includes("User not found")) {
      return "No account found with this email. Please check your email or sign up.";
    }
    
    if (errorString.includes("Invalid password") || errorString.includes("password")) {
      return "Incorrect password. Please try again.";
    }
    
    if (errorString.includes("validation")) {
      return "Please check your information and try again.";
    }
    
    if (error?.response?.data?.message) {
      return error.response.data.message;
    }
    
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
      
      dispatch(addUser(res.data));
      navigate("/");
    } catch (err) {
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
      
      if (formData.age && parseInt(formData.age) >= 18) {
        signupData.age = parseInt(formData.age);
      }
      
      const res = await axios.post(
        BASE_URL + "/signup",
        signupData,
        { withCredentials: true }
      );
      
      dispatch(addUser(res.data.data || res.data.data));
      navigate("/profile");
    } catch (err) {
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
    /* 🎨 FIXED: Standard white background with proper responsive design */
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        
        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="px-8 pt-8 pb-6">
            
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-2xl">E</span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {isLoginForm ? "Welcome Back" : "Create Account"}
              </h1>
              <p className="text-gray-600">
                {isLoginForm ? "Sign in to your account" : "Join our community today"}
              </p>
            </div>

            {/* Form Fields */}
            <div className="space-y-5">
              
              {/* Signup Fields */}
              {!isLoginForm && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        First Name
                      </label>
                      <input
                        type="text"
                        placeholder="Enter first name"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white text-gray-900 placeholder-gray-500"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange("firstName", e.target.value)}
                        maxLength="50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name
                      </label>
                      <input
                        type="text"
                        placeholder="Enter last name"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white text-gray-900 placeholder-gray-500"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange("lastName", e.target.value)}
                        maxLength="50"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Age (Optional)
                    </label>
                    <input
                      type="number"
                      placeholder="Enter your age"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white text-gray-900 placeholder-gray-500"
                      value={formData.age}
                      onChange={(e) => handleInputChange("age", e.target.value)}
                      min="18"
                      max="100"
                    />
                  </div>
                </>
              )}

              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white text-gray-900 placeholder-gray-500"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  maxLength="100"
                />
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white text-gray-900 placeholder-gray-500"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    maxLength="100"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
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
                <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mt-5 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="mt-8">
              <button
                className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                  loading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 focus:ring-4 focus:ring-blue-200'
                } text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]`}
                onClick={isLoginForm ? handleLogin : handleSignup}
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Processing...
                  </div>
                ) : (
                  isLoginForm ? 'Sign In' : 'Create Account'
                )}
              </button>
            </div>

            {/* Toggle Form */}
            <div className="mt-6 text-center">
              <button
                className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
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
              <div className="mt-4 text-center">
                <button
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
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

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
