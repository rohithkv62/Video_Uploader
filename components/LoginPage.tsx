import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { APP_NAME } from '../constants';

interface LoginPageProps {
  onSwitchToSignup: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onSwitchToSignup }) => {
  const { login, isLoadingAuth } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Email and password are required.');
      return;
    }
    try {
      await login(email, password);
      // On successful login, AuthContext will change authStatus,
      // and App.tsx will navigate away from LoginPage.
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 shadow-xl rounded-lg p-8">
        <h2 className="text-3xl font-bold text-center text-primary-600 dark:text-primary-400 mb-2">{APP_NAME}</h2>
        <h3 className="text-xl font-semibold text-center text-gray-700 dark:text-gray-200 mb-6">Login to Your Account</h3>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-gray-700 dark:text-white"
              disabled={isLoadingAuth}
            />
          </div>

          <div>
            <label htmlFor="password"className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-gray-700 dark:text-white"
              disabled={isLoadingAuth}
            />
          </div>
          
          {error && (
            <p className="text-sm text-red-500 dark:text-red-400">{error}</p>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoadingAuth}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoadingAuth ? 'Logging In...' : 'Log In'}
            </button>
          </div>
        </form>
        <p className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
          Need an account?{' '}
          <button
            onClick={onSwitchToSignup}
            className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
            disabled={isLoadingAuth}
          >
            Sign up
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;