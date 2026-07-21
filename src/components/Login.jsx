import React, { useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import { useDispatch } from "react-redux";
import { addUser } from "../utils/userSlice";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, AlertCircle } from "lucide-react";

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

    if (errorString.includes("not strong enough")) {
      return "Password must be at least 8 characters and include an uppercase letter, a lowercase letter, a number, and a symbol.";
    }

    if (errorString.includes("Invalid password")) {
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

    if (!isLoginForm) {
      const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
      if (!strongPasswordRegex.test(password)) {
        setError("Password must be at least 8 characters and include an uppercase letter, a lowercase letter, a number, and a symbol.");
        return false;
      }
    } else if (password.length < 6) {
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

      const res = await axiosInstance.post(
        "/login",
        {
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
        }
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

      const res = await axiosInstance.post("/signup", signupData);

      dispatch(addUser(res.data.user));
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
    <div className="min-h-screen bg-base-200 flex items-center justify-center px-4 py-10 sm:py-16">
      <div className="w-full max-w-md">

        <div className="bg-base-100 rounded-box border border-base-300 shadow-sm">
          <div className="px-6 sm:px-8 pt-8 pb-6">

            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-12 h-12 mx-auto mb-4 rounded-field bg-primary flex items-center justify-center">
                <span className="text-primary-content font-semibold text-xl">E</span>
              </div>
              <h1 className="text-2xl font-semibold text-base-content mb-1">
                {isLoginForm ? "Welcome back" : "Create your account"}
              </h1>
              <p className="text-sm text-base-content/60">
                {isLoginForm ? "Sign in to continue" : "Join the community"}
              </p>
            </div>

            {/* Form Fields */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                isLoginForm ? handleLogin() : handleSignup();
              }}
            >
            <div className="space-y-4">

              {/* Signup Fields */}
              {!isLoginForm && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-base-content/80 mb-1.5">
                        First name
                      </label>
                      <input
                        type="text"
                        placeholder="First name"
                        className="input input-bordered w-full rounded-field focus:outline-none focus:border-primary"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange("firstName", e.target.value)}
                        maxLength="50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-base-content/80 mb-1.5">
                        Last name
                      </label>
                      <input
                        type="text"
                        placeholder="Last name"
                        className="input input-bordered w-full rounded-field focus:outline-none focus:border-primary"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange("lastName", e.target.value)}
                        maxLength="50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-base-content/80 mb-1.5">
                      Age <span className="text-base-content/40 font-normal">(optional)</span>
                    </label>
                    <input
                      type="number"
                      placeholder="Your age"
                      className="input input-bordered w-full rounded-field focus:outline-none focus:border-primary"
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
                <label className="block text-sm font-medium text-base-content/80 mb-1.5">
                  Email address
                </label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  className="input input-bordered w-full rounded-field focus:outline-none focus:border-primary"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  maxLength="100"
                />
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-medium text-base-content/80 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    className="input input-bordered w-full rounded-field pr-11 focus:outline-none focus:border-primary"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    maxLength="100"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-base-content/70"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <p className="text-xs text-base-content/50 mt-1.5">
                  Min 8 characters, with uppercase, lowercase, number & symbol
                </p>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="alert alert-error alert-soft mt-5 rounded-field py-3">
                <AlertCircle size={18} className="shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <div className="mt-6">
              <button
                type="submit"
                className="btn btn-primary w-full rounded-field"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Processing...
                  </>
                ) : (
                  isLoginForm ? 'Sign in' : 'Create account'
                )}
              </button>
            </div>
            </form>

            {/* Toggle Form */}
            <div className="mt-5 text-center">
              <button
                className="text-sm text-primary font-medium hover:underline"
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
                  className="btn btn-outline btn-sm rounded-field"
                  onClick={() => {
                    setIsLoginForm(true);
                    setError("");
                  }}
                >
                  Go to login
                </button>
              </div>
            )}

          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-xs text-base-content/50">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;