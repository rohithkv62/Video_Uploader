export enum Plan {
  FREE = 'FREE',
  BRONZE = 'BRONZE',
  SILVER = 'SILVER',
  GOLD = 'GOLD',
  DEMO = 'DEMO', // Added Free Demo plan
}

export interface PlanDetails {
  name: Plan;
  maxWatchTime: number; // in seconds, Infinity for unlimited
  cost: number; // in INR
  displayName: string;
}

export interface User {
  id: string;
  name: string;
  email?: string; // Added for login/signup
  currentPlan: Plan;
  city: string;
  state: string; // e.g., 'Tamil Nadu'
  isSouthIndia: boolean;
}

export interface Comment {
  id: string;
  videoId: string; 
  userId: string;
  userName: string;
  userCity: string;
  text: string;
  originalText?: string; // Store original text if translated
  translatedTo?: string; // Language code of translation
  timestamp: number;
  likes: number;
  dislikes: number;
}

export interface VideoSource {
  quality: string; // e.g., '360p', '720p'
  url: string;
}

export interface Video {
  id: string;
  title: string;
  description: string;
  sources: VideoSource[];
  thumbnailUrl: string;
}

export interface LocationInfo {
  city: string;
  state: string;
  country: string;
  isSouthIndia: boolean;
}

export enum OtpMethod {
  EMAIL = 'EMAIL',
  MOBILE = 'MOBILE',
  NONE = 'NONE'
}

// New enum for authentication status
export enum AuthStatus {
  LOGGED_OUT,
  AWAITING_OTP,
  LOGGED_IN,
}