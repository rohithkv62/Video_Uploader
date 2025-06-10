import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { APP_NAME, PLAN_DETAILS } from '../constants';
import { SunIcon, MoonIcon, UploadIcon, UserIcon, LogoutIcon, SearchIcon } from './IconComponents';
import { AuthStatus } from '../types';

interface HeaderProps {
  onUpgradePlanClick: () => void;
  onUploadClick: () => void;
  onProfileClick: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const Header: React.FC<HeaderProps> = ({ 
  onUpgradePlanClick, 
  onUploadClick, 
  onProfileClick,
  searchQuery,
  onSearchChange
}) => {
  const { user, authStatus, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const isAuthenticated = authStatus === AuthStatus.LOGGED_IN;

  return (
    <header className="bg-primary-600 dark:bg-gray-800 text-white p-3 sm:p-4 shadow-md sticky top-0 z-50">
      <div className="container mx-auto flex flex-wrap justify-between items-center gap-2">
        <h1 className="text-xl sm:text-2xl font-bold whitespace-nowrap">{APP_NAME}</h1>

        {isAuthenticated && (
          <div className={`relative flex-grow max-w-xs sm:max-w-sm md:max-w-md order-3 sm:order-2 w-full sm:w-auto mt-2 sm:mt-0 ${isSearchFocused ? 'ring-2 ring-primary-300 dark:ring-yellow-400 rounded-md' : ''}`}>
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon className="w-4 h-4 text-gray-400 dark:text-gray-500" />
            </div>
            <input
              type="search"
              placeholder="Search videos..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              className="block w-full pl-10 pr-3 py-2 border border-transparent rounded-md leading-5 bg-primary-500 bg-opacity-40 dark:bg-gray-700 placeholder-gray-300 dark:placeholder-gray-400 focus:outline-none focus:bg-white dark:focus:bg-gray-600 focus:text-gray-900 dark:focus:text-white sm:text-sm transition-colors"
            />
          </div>
        )}

        <div className="flex items-center space-x-1 sm:space-x-3 order-2 sm:order-3">
          {isAuthenticated && user && (
            <>
              <button
                onClick={onUploadClick}
                className="p-1.5 sm:p-2 rounded-full hover:bg-primary-500 dark:hover:bg-gray-700 transition-colors flex items-center"
                aria-label="Upload video"
                title="Upload Video"
              >
                <UploadIcon className="w-5 h-5 text-primary-100 dark:text-yellow-300" />
                <span className="ml-1 hidden md:inline text-xs">Upload</span>
              </button>
              <button
                onClick={onProfileClick}
                className="p-1.5 sm:p-2 rounded-full hover:bg-primary-500 dark:hover:bg-gray-700 transition-colors"
                aria-label="Open profile"
                title="Profile"
              >
                <UserIcon className="w-5 h-5 text-primary-100 dark:text-yellow-300" />
              </button>
               <div className="text-xs sm:text-sm hidden md:block">
                <span>{PLAN_DETAILS[user.currentPlan].displayName}</span>
                <button
                  onClick={onUpgradePlanClick}
                  className="ml-2 px-2 py-1 bg-primary-500 hover:bg-primary-700 dark:bg-yellow-500 dark:hover:bg-yellow-600 rounded text-white text-xs"
                >
                  Upgrade
                </button>
              </div>
            </>
          )}
          <button
            onClick={toggleTheme}
            className="p-1.5 sm:p-2 rounded-full hover:bg-primary-500 dark:hover:bg-gray-700 transition-colors"
            aria-label={theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}
            title={theme === 'light' ? 'Dark theme' : 'Light theme'}
          >
            {theme === 'light' ? <MoonIcon className="w-5 h-5 text-primary-100 dark:text-yellow-300" /> : <SunIcon className="w-5 h-5 text-yellow-300" />}
          </button>
          {isAuthenticated && (
             <button
                onClick={logout}
                className="p-1.5 sm:p-2 rounded-full hover:bg-primary-500 dark:hover:bg-gray-700 transition-colors"
                aria-label="Logout"
                title="Logout"
              >
                <LogoutIcon className="w-5 h-5 text-primary-100 dark:text-red-400" />
              </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
