import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { CloseIcon } from './IconComponents';
import { User } from '../types';

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProfileEditModal: React.FC<ProfileEditModalProps> = ({ isOpen, onClose }) => {
  const { user, updateUserProfile, isLoadingAuth } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || ''); // Email typically not editable here, but display
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email || '');
    }
  }, [user, isOpen]); // Reload user data if modal reopens or user changes

  if (!isOpen || !user) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Name cannot be empty.');
      return;
    }
    setError('');
    
    const updatedUserData: Partial<User> = { name };
    // In a real app, you might allow other fields to be updated.
    // For now, only name is editable.
    
    try {
        updateUserProfile(updatedUserData);
        onClose(); // Close modal on successful update
    } catch (err: any) {
        setError(err.message || "Failed to update profile.");
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75 flex items-center justify-center z-[100] p-4">
      <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-lg shadow-xl w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          aria-label="Close profile edit modal"
        >
          <CloseIcon />
        </button>
        <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-white">Edit Profile</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="profileName" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              Full Name
            </label>
            <input
              type="text"
              id="profileName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-gray-700 dark:text-white"
              required
            />
          </div>
          <div>
            <label htmlFor="profileEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              Email Address (Read-only)
            </label>
            <input
              type="email"
              id="profileEmail"
              value={email}
              readOnly
              className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-100 dark:bg-gray-600 sm:text-sm text-gray-500 dark:text-gray-400 cursor-not-allowed"
            />
          </div>
           <p className="text-xs text-gray-500 dark:text-gray-400">
            Current Plan: {user.currentPlan}
          </p>

          {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
          <button
            type="submit"
            disabled={isLoadingAuth}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50 transition-colors"
          >
            {isLoadingAuth ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfileEditModal;