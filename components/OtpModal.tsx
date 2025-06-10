
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { OtpMethod, AuthStatus } from '../types';

const OtpModal: React.FC = () => {
  const { 
    authStatus, 
    otpMethod, 
    completeOtpVerification, 
    currentOtpTarget, 
    isOtpVerified,
    isLoadingAuth
  } = useAuth();
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // This modal should only be visible when authStatus is AWAITING_OTP and OTP is not yet verified.
  const showModal = authStatus === AuthStatus.AWAITING_OTP && !isOtpVerified && !isLoadingAuth;

  useEffect(() => {
    // Clear OTP trigger flag from session storage when modal is no longer relevant or user logs out.
    // This ensures the "OTP sent" message appears fresh if user logs in again.
    if (authStatus !== AuthStatus.AWAITING_OTP) {
        sessionStorage.removeItem('otp_triggered_session');
    } else if (showModal) {
        // This logic is for the *simulation* of sending OTP when modal appears.
        // It was previously in AuthContext, but fits better here if tied to modal visibility.
        if(!sessionStorage.getItem('otp_triggered_session')) {
            // The alert for simulation is now in AuthContext's login/signup for better timing.
            // This sessionStorage item is just to prevent repeated alerts if modal re-renders.
            sessionStorage.setItem('otp_triggered_session', 'true');
        }
    }
  }, [authStatus, showModal]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.match(/^\d{6}$/)) {
      setError('OTP must be 6 digits.');
      return;
    }
    setError('');
    setIsSubmitting(true);
    try {
      await completeOtpVerification(otp);
      // Modal will close automatically when authStatus changes from AWAITING_OTP to LOGGED_IN
      setOtp(''); // Clear OTP field on success
    } catch (err) { // AuthContext's completeOtpVerification will throw on real error, or handle internally for demo
      setError('Invalid OTP. Please try again.'); // This message might be redundant if AuthContext shows alert
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!showModal) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75 flex items-center justify-center z-[100]">
      <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-lg shadow-xl w-full max-w-md m-4">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">OTP Verification</h2>
        <p className="mb-4 text-gray-600 dark:text-gray-300">
          An OTP has been {otpMethod === OtpMethod.EMAIL ? 'sent to your email' : 'sent to your mobile number'}: <strong className="text-primary-600 dark:text-primary-400">{currentOtpTarget}</strong>.
          (Use <strong className="text-green-500">123456</strong> for this demo)
        </p>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="otp" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              Enter OTP
            </label>
            <input
              type="text"
              id="otp"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength={6}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-gray-700 dark:text-white"
              placeholder="_ _ _ _ _ _"
              required
              disabled={isSubmitting}
            />
          </div>
          {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
          <button
            type="submit"
            disabled={isSubmitting || isLoadingAuth}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50 transition-colors"
          >
            {isSubmitting || isLoadingAuth ? 'Verifying...' : 'Verify OTP'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default OtpModal;
