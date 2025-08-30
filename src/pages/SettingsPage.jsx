import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaSignOutAlt } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import useFinanceStore from "../store/useFinanceStore";
import { toast } from "react-toastify";

const SettingsPage = () => {
  const { user, updateUserProfile, sendPasswordReset, signOut } = useAuth();
  const { settings, updateUserSettings, subscribeUserSettings } = useFinanceStore();
  const navigate = useNavigate();

  // State for profile form
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [currency, setCurrency] = useState(settings?.defaultCurrency || "GHS");
  const [isLoading, setIsLoading] = useState(false);

  // Subscribe to user settings on mount
  useEffect(() => {
    if (user?.uid) {
      const unsub = subscribeUserSettings(user.uid);
      return unsub;
    }
  }, [user, subscribeUserSettings]);

  // Update local currency state when settings change
  useEffect(() => {
    setCurrency(settings?.defaultCurrency || "GHS");
  }, [settings]);

  // Handle profile update
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!displayName.trim()) {
      toast.error("Display name cannot be empty");
      return;
    }
    setIsLoading(true);
    try {
      await updateUserProfile({ displayName });
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error("Failed to update profile: " + error.message);
    }
    setIsLoading(false);
  };

  // Handle currency update
  const handleUpdateCurrency = async () => {
    setIsLoading(true);
    try {
      await updateUserSettings(user.uid, { defaultCurrency: currency });
      toast.success("Default currency updated");
    } catch (error) {
      toast.error("Failed to update currency: " + error.message);
    }
    setIsLoading(false);
  };

  // Handle password reset
  const handlePasswordReset = async () => {
    try {
      await sendPasswordReset(user.email);
      toast.success("Password reset email sent");
    } catch (error) {
      toast.error("Failed to send reset email: " + error.message);
    }
  };

  // Handle sign out
  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/login");
      toast.success("Signed out successfully");
    } catch (error) {
      toast.error("Failed to sign out: " + error.message);
    }
  };

  return (
    <div className="p-6 space-y-6 text-white">
      {/* Profile Settings */}
      <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-lg py-5 shadow-lg">
        <h2 className="text-lg font-semibold mb-4 border-b-2 pb-1 pl-4 border-white/20">
          Profile Settings
        </h2>
        <form onSubmit={handleUpdateProfile} className="px-5 space-y-4">
          <div>
            <label className="block text-gray-300 mb-1">Display Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-3 py-2 bg-[#333232] text-white rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-teal-500"
              disabled={isLoading}
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-white disabled:opacity-50"
          >
            {isLoading ? "Updating..." : "Update Profile"}
          </button>
        </form>
        <div className="px-5 mt-4">
          <button
            onClick={handlePasswordReset}
            disabled={isLoading}
            className="text-blue-400 hover:text-blue-300"
          >
            Send Password Reset Email
          </button>
        </div>
      </div>

      {/* Currency Settings */}
      <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-lg py-5 shadow-lg">
        <h2 className="text-lg font-semibold mb-4 border-b-2 pb-1 pl-4 border-white/20">
          Currency Settings
        </h2>
        <div className="px-5 space-y-4">
          <div>
            <label className="block text-gray-300 mb-1">Default Currency</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full px-3 py-2 bg-[#333232] text-white rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-teal-500"
              disabled={isLoading}
            >
              <option value="GHS">GHS (Ghanaian Cedi)</option>
              <option value="USD">USD (US Dollar)</option>
              <option value="EUR">EUR (Euro)</option>
              <option value="GBP">GBP (British Pound)</option>
            </select>
          </div>
          <button
            onClick={handleUpdateCurrency}
            disabled={isLoading}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-white disabled:opacity-50"
          >
            {isLoading ? "Updating..." : "Update Currency"}
          </button>
        </div>
      </div>

      {/* Sign Out */}
      <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-lg py-5 shadow-lg">
        <h2 className="text-lg font-semibold mb-4 border-b-2 pb-1 pl-4 border-white/20">
          Account
        </h2>
        <div className="px-5">
          <button
            onClick={handleSignOut}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white disabled:opacity-50"
          >
            <FaSignOutAlt /> Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;