import React, { useState } from "react";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { useDispatch } from "react-redux";
import { addUser } from "../utils/userSlice";

const EditProfile = ({ user }) => {
  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    age: user?.age || "",
    gender: user?.gender || "",
    about: user?.about || "",
    photoUrl: user?.photoUrl || "",
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState({ message: '', type: '' });
  const dispatch = useDispatch();

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: '', type: '' }), 4000);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const saveProfile = async () => {
    setIsLoading(true);

    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      showNotification("First name and last name are required", 'error');
      setIsLoading(false);
      return;
    }

    if (formData.age && (formData.age < 18 || formData.age > 120)) {
      showNotification("Please enter a valid age between 18 and 120", 'error');
      setIsLoading(false);
      return;
    }

    try {
      const res = await axios.post(
        BASE_URL + "/profile/edit",
        {
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          photoUrl: formData.photoUrl.trim(),
          age: formData.age ? parseInt(formData.age) : undefined,
          gender: formData.gender.trim(),
          about: formData.about.trim(),
        },
        { withCredentials: true }
      );
      
      dispatch(addUser(res?.data?.data));
      showNotification("Profile updated successfully! 🎉", 'success');
      
    } catch (err) {
      const errorMessage = err.response?.data?.message || 
                          err.response?.data || 
                          "Failed to update profile";
      showNotification(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const NotificationToast = () => {
    if (!notification.message) return null;

    const styles = {
      success: 'bg-emerald-500 border-emerald-600',
      error: 'bg-rose-500 border-rose-600',
      info: 'bg-blue-500 border-blue-600'
    };

    const icons = {
      success: '✓',
      error: '✕',
      info: 'i'
    };

    return (
      <div className="fixed top-4 left-4 right-4 sm:top-4 sm:right-4 sm:left-auto z-50 animate-in slide-in-from-top-2 duration-300">
        <div className={`${styles[notification.type]} text-black px-4 py-3 rounded-lg shadow-lg border-2 flex items-center gap-3 w-full sm:min-w-80 sm:max-w-md`}>
          <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold flex-shrink-0">
            {icons[notification.type]}
          </div>
          <span className="flex-1 text-sm font-medium">{notification.message}</span>
          <button 
            onClick={() => setNotification({ message: '', type: '' })}
            className="text-black/80 hover:text-white text-lg leading-none flex-shrink-0"
          >
            ×
          </button>
        </div>
      </div>
    );
  };

  const PreviewCard = () => (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
        <img
          src={
            formData.photoUrl || 
            `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.firstName || 'User')}+${encodeURIComponent(formData.lastName || '')}&background=6366f1&color=fff&size=400`
          }
          alt="Profile Preview"
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.firstName || 'User')}&background=6366f1&color=fff&size=400`;
          }}
        />
        <div className="absolute inset-0 bg-black/10"></div>
      </div>
      
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900">
            {formData.firstName || 'First'} {formData.lastName || 'Last'}
          </h3>
          {(formData.age || formData.gender) && (
            <span className="px-3 py-1 text-xs font-semibold bg-indigo-100 text-indigo-800 rounded-full">
              {formData.age && `${formData.age}`}
              {formData.age && formData.gender && ", "}
              {formData.gender}
            </span>
          )}
        </div>
        
        <p className="text-gray-600 text-sm leading-relaxed">
          {formData.about || "Add a bio to tell others about yourself..."}
        </p>
      </div>
    </div>
  );

  return (
    <>
      <NotificationToast />
      
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Edit Your Profile
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Update your information and see how your profile looks to others
            </p>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            
            {/* Form Section */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                
                <div className="space-y-6">
                  {/* Name Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        First Name *
                      </label>
                      <input
                        type="text"
                        value={formData.firstName}
                        className="w-full px-4 py-3 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                        placeholder="Enter your first name"
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        maxLength="50"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        value={formData.lastName}
                        className="w-full px-4 py-3 border border-gray-300 text-black rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                        placeholder="Enter your last name"
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        maxLength="50"
                      />
                    </div>
                  </div>

                  {/* Photo URL */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Profile Photo URL
                    </label>
                    <input
                      type="url"
                      value={formData.photoUrl}
                      className="w-full px-4 py-3 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                      placeholder="https://example.com/your-photo.jpg"
                      onChange={(e) => handleInputChange('photoUrl', e.target.value)}
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Paste a link to your profile picture
                    </p>
                  </div>

                  {/* Age & Gender */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Age
                      </label>
                      <input
                        type="number"
                        value={formData.age}
                        className="w-full px-4 py-3 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                        placeholder="25"
                        min="18"
                        max="120"
                        onChange={(e) => handleInputChange('age', e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Gender
                      </label>
                      <select
                        value={formData.gender}
                        className="w-full px-4 py-3 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-white"
                        onChange={(e) => handleInputChange('gender', e.target.value)}
                      >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="non-binary">Non-binary</option>
                        <option value="other">Other</option>
                        <option value="prefer-not-to-say">Prefer not to say</option>
                      </select>
                    </div>
                  </div>

                  {/* About */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        About Yourself
                      </label>
                      <span className="text-xs text-gray-500">
                        {formData.about.length}/500
                      </span>
                    </div>
                    <textarea
                      value={formData.about}
                      className="w-full px-4 py-3 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors resize-none h-32"
                      placeholder="Tell others about yourself, your interests, what you're looking for..."
                      maxLength="500"
                      onChange={(e) => handleInputChange('about', e.target.value)}
                    />
                  </div>

                  {/* Save Button */}
                  <button 
                    className={`w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-black font-semibold py-4 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-3 ${isLoading ? 'cursor-not-allowed' : 'hover:shadow-lg'}`}
                    onClick={saveProfile}
                    disabled={isLoading || !formData.firstName.trim() || !formData.lastName.trim()}
                  >
                    {isLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Saving Changes...</span>
                      </>
                    ) : (
                      <>
                        <span></span>
                        Save Profile
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Preview Section */}
            <div className="lg:col-span-2">
              <div className="lg:sticky lg:top-8 space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Live Preview
                  </h2>
                  <p className="text-gray-600">
                    This is how your profile will appear to others
                  </p>
                </div>
                
                <PreviewCard />
                
                {/* Pro Tip */}
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-black text-sm">💡</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-indigo-900 text-sm">
                        Pro Tip
                      </h3>
                      <p className="text-indigo-700 text-sm leading-relaxed mt-1">
                        A good profile photo and engaging bio increase your connection rate by 3x!
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EditProfile;