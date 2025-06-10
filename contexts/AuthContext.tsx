
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { User, Plan, LocationInfo, OtpMethod, AuthStatus } from '../types';
import { PLAN_DETAILS } from '../constants';
import { getUserLocation } from '../services/locationService';

// For mock auth
const MOCK_USERS_STORAGE_KEY = 'mock_users_gvh';
const SESSION_USER_ID_KEY = 'session_user_id_gvh';

interface StoredUser extends User {
  passwordHash: string; // In a real app, never store plain passwords
}

const getMockUsers = (): Record<string, StoredUser> => {
  const users = localStorage.getItem(MOCK_USERS_STORAGE_KEY);
  return users ? JSON.parse(users) : {};
};

const saveMockUsers = (users: Record<string, StoredUser>) => {
  localStorage.setItem(MOCK_USERS_STORAGE_KEY, JSON.stringify(users));
};

interface AuthContextType {
  user: User | null;
  authStatus: AuthStatus;
  otpMethod: OtpMethod;
  isOtpVerified: boolean;
  locationInfo: LocationInfo | null;
  isLoadingAuth: boolean;
  currentOtpTarget: string; 
  
  signup: (name: string, email: string, pass: string) => Promise<void>;
  login: (email: string, pass: string) => Promise<void>; 
  completeOtpVerification: (otp: string) => Promise<void>; 
  logout: () => void;
  upgradePlan: (newPlan: Plan) => void;
  updateUserProfile: (updatedUserPartial: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [authStatus, setAuthStatus] = useState<AuthStatus>(AuthStatus.LOGGED_OUT);
  const [otpMethod, setOtpMethod] = useState<OtpMethod>(OtpMethod.NONE);
  const [isOtpVerified, setIsOtpVerified] = useState<boolean>(false); 
  const [locationInfo, setLocationInfo] = useState<LocationInfo | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState<boolean>(true);
  const [currentOtpTarget, setCurrentOtpTarget] = useState<string>("");

  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoadingAuth(true);
      try {
        const locInfo = await getUserLocation();
        setLocationInfo(locInfo);
        // Set a default OTP method based on initial location detection
        const initialOtpMethod = locInfo.isSouthIndia ? OtpMethod.EMAIL : OtpMethod.MOBILE;
        setOtpMethod(initialOtpMethod); 
        
        const sessionUserId = sessionStorage.getItem(SESSION_USER_ID_KEY);
        if (sessionUserId) {
          const mockUsers = getMockUsers();
          const loggedInUser = mockUsers[sessionUserId];
          if (loggedInUser) {
            const { passwordHash, ...userDetails } = loggedInUser;
            setUser(userDetails);
            
            // For a persisted session, OTP method should align with stored user data
            const userSpecificOtpMethod = userDetails.isSouthIndia ? OtpMethod.EMAIL : OtpMethod.MOBILE;
            setOtpMethod(userSpecificOtpMethod);
            setCurrentOtpTarget(userDetails.email || (userSpecificOtpMethod === OtpMethod.MOBILE ? '+91**********' : 'user@example.com'));
            
            // If a session exists, assume OTP was verified for that session.
            // For enhanced security, you might re-require OTP on new browser session/tab.
            // For this app's simplicity, a stored session implies OTP was handled.
            setIsOtpVerified(true); 
            setAuthStatus(AuthStatus.LOGGED_IN);
          } else {
            sessionStorage.removeItem(SESSION_USER_ID_KEY);
            setAuthStatus(AuthStatus.LOGGED_OUT);
          }
        } else {
           setAuthStatus(AuthStatus.LOGGED_OUT);
        }

      } catch (error) {
        console.error("Failed to initialize auth:", error);
        setOtpMethod(OtpMethod.MOBILE); 
        setAuthStatus(AuthStatus.LOGGED_OUT);
      } finally {
        setIsLoadingAuth(false);
      }
    };
    initializeAuth();
  }, []);


  const signup = async (name: string, email: string, pass: string): Promise<void> => {
    setIsLoadingAuth(true);
    await new Promise(resolve => setTimeout(resolve, 1000)); 
    
    const mockUsers = getMockUsers();
    if (Object.values(mockUsers).find(u => u.email === email)) {
      setIsLoadingAuth(false);
      throw new Error("User with this email already exists.");
    }

    const userId = `user-${Date.now()}`;
    const newUserIsSouthIndia = locationInfo?.isSouthIndia || false; 
    const newUser: StoredUser = {
      id: userId,
      name,
      email,
      passwordHash: pass, 
      currentPlan: Plan.DEMO, 
      city: locationInfo?.city || 'Unknown City',
      state: locationInfo?.state || 'Unknown State',
      isSouthIndia: newUserIsSouthIndia,
    };
    
    mockUsers[userId] = newUser;
    saveMockUsers(mockUsers);
    
    // User is NOT logged in directly after signup. They must log in manually.
    setAuthStatus(AuthStatus.LOGGED_OUT);
    setIsOtpVerified(false); 
    // Clear any temporary user state if it was set
    setUser(null);
    sessionStorage.removeItem(SESSION_USER_ID_KEY);

    // Determine OTP method based on the new user's isSouthIndia status for their future login attempt
    const userSpecificOtpMethod = newUser.isSouthIndia ? OtpMethod.EMAIL : OtpMethod.MOBILE;
    // We don't set global otpMethod or currentOtpTarget here, as it's set during the login attempt.
    
    console.log(`User ${newUser.name} signed up successfully. Please log in.`);
    alert(`Account created for ${newUser.name}. Please log in to continue.`);
    
    setIsLoadingAuth(false);
  };

  const login = async (emailAddress: string, pass: string): Promise<void> => {
    setIsLoadingAuth(true);
    await new Promise(resolve => setTimeout(resolve, 1000)); 
    
    const mockUsers = getMockUsers();
    const foundUser = Object.values(mockUsers).find(u => u.email === emailAddress && u.passwordHash === pass); 

    if (foundUser) {
      const { passwordHash, ...userDetails } = foundUser;
      // Temporarily set user details here, but OTP is still required.
      // If OTP fails, this user should be cleared.
      setUser(userDetails); 
      // Do NOT set session storage yet, only after OTP.

      const userSpecificOtpMethod = userDetails.isSouthIndia ? OtpMethod.EMAIL : OtpMethod.MOBILE;
      setOtpMethod(userSpecificOtpMethod); 
      setCurrentOtpTarget(userDetails.email || (userSpecificOtpMethod === OtpMethod.MOBILE ? '+91**********' : 'user@example.com'));

      setAuthStatus(AuthStatus.AWAITING_OTP);
      setIsOtpVerified(false);
      alert(`Simulating OTP sent via ${userSpecificOtpMethod} to ${currentOtpTarget}. Use '123456' to verify.`);
      
    } else {
      setUser(null); // Clear any partial user state
      setIsLoadingAuth(false);
      throw new Error("Invalid email or password.");
    }
    setIsLoadingAuth(false); // Should be inside the if/else or a finally block
  };
  
  const completeOtpVerification = async (otp: string) => {
    if (authStatus !== AuthStatus.AWAITING_OTP || !user) {
      // If not awaiting OTP or user somehow null, this shouldn't proceed.
      // This might happen if user navigates away or state is corrupted.
      console.warn("OTP verification attempted in invalid state.");
      setAuthStatus(AuthStatus.LOGGED_OUT); // Reset to a safe state
      setUser(null);
      setIsOtpVerified(false);
      return;
    }
    
    setIsLoadingAuth(true);
    console.log(`Verifying OTP: ${otp} for method: ${otpMethod} for user: ${user.email}`);
    await new Promise(resolve => setTimeout(resolve, 1000)); 

    if (otp === "123456") { 
      setIsOtpVerified(true);
      setAuthStatus(AuthStatus.LOGGED_IN);
      sessionStorage.setItem(SESSION_USER_ID_KEY, user.id); // Set session only after successful OTP
      console.log(`${otpMethod} OTP verification successful. User ${user.name} fully logged in.`);
    } else {
      console.error("OTP verification failed.");
      alert("Invalid OTP. Please try again.");
      // On OTP failure, revert to logged out state, clear user
      setAuthStatus(AuthStatus.LOGGED_OUT);
      setUser(null);
      setIsOtpVerified(false);
      sessionStorage.removeItem(SESSION_USER_ID_KEY);
    }
    setIsLoadingAuth(false);
  };

  const logout = () => {
    setUser(null);
    setAuthStatus(AuthStatus.LOGGED_OUT);
    setIsOtpVerified(false);
    sessionStorage.removeItem(SESSION_USER_ID_KEY);
    sessionStorage.removeItem('otp_triggered_session'); 
    if (locationInfo) {
        const initialOtpMethod = locationInfo.isSouthIndia ? OtpMethod.EMAIL : OtpMethod.MOBILE;
        setOtpMethod(initialOtpMethod);
    } else {
        setOtpMethod(OtpMethod.MOBILE); 
    }
    console.log("User logged out.");
  };

  const upgradePlan = (newPlan: Plan) => {
    if (user && authStatus === AuthStatus.LOGGED_IN) {
      if (newPlan === Plan.FREE) {
        alert("Free Tier is assigned automatically or by other means, not through this upgrade path.");
        return;
      }
      if (user.currentPlan === newPlan) {
        alert(`You are already on the ${PLAN_DETAILS[newPlan].displayName}.`);
        return;
      }

      const planCost = PLAN_DETAILS[newPlan].cost;
      const planDisplayName = PLAN_DETAILS[newPlan].displayName;
      console.log(`Attempting to switch/upgrade to ${newPlan}. Cost: ${planCost} INR.`);

      if (planCost > 0) {
        alert(`Simulating payment of ${planCost} INR for ${planDisplayName}.`);
      }
      
      setIsLoadingAuth(true); 
      setTimeout(() => {
        const updatedUser = { ...user, currentPlan: newPlan };
        setUser(updatedUser);
        const mockUsers = getMockUsers();
        if (mockUsers[user.id]) {
            mockUsers[user.id] = { ...mockUsers[user.id], ...updatedUser };
            saveMockUsers(mockUsers);
        }
        
        if (planCost > 0) {
          console.log(`Plan upgraded to ${newPlan}. Invoice sent to user's email (simulated).`);
          alert(`Successfully upgraded to ${planDisplayName}!`);
        } else {
          console.log(`Plan switched to ${newPlan}.`);
          alert(`Successfully switched to ${planDisplayName}!`);
        }
        setIsLoadingAuth(false);
      }, 1500);
    }
  };

  const updateUserProfile = (updatedUserPartial: Partial<User>) => {
    if (user && authStatus === AuthStatus.LOGGED_IN) {
        const updatedUser = { ...user, ...updatedUserPartial };
        setUser(updatedUser);
        const mockUsers = getMockUsers();
        if (mockUsers[user.id]) {
            mockUsers[user.id] = { ...mockUsers[user.id], ...updatedUser };
            saveMockUsers(mockUsers);
             alert("Profile updated successfully!");
        } else {
            alert("Error updating profile (user not found in storage).");
        }
    }
  };

  return (
    <AuthContext.Provider value={{ 
        user, 
        authStatus, 
        otpMethod, 
        isOtpVerified, 
        locationInfo, 
        isLoadingAuth, 
        currentOtpTarget,
        signup,
        login, 
        completeOtpVerification,
        logout,
        upgradePlan,
        updateUserProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
