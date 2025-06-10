
import { Plan, PlanDetails, Video, Comment } from './types';

export const APP_NAME = "Video Hub";

export const PLAN_DETAILS: Record<Plan, PlanDetails> = {
  [Plan.DEMO]: { name: Plan.DEMO, maxWatchTime: 1 * 60, cost: 0, displayName: 'Free Demo' }, // New Demo Plan
  [Plan.FREE]: { name: Plan.FREE, maxWatchTime: 5 * 60, cost: 0, displayName: 'Free Tier' },
  [Plan.BRONZE]: { name: Plan.BRONZE, maxWatchTime: 7 * 60, cost: 10, displayName: 'Bronze Plan' },
  [Plan.SILVER]: { name: Plan.SILVER, maxWatchTime: 10 * 60, cost: 50, displayName: 'Silver Plan' },
  [Plan.GOLD]: { name: Plan.GOLD, maxWatchTime: Infinity, cost: 100, displayName: 'Gold Plan' },
};

export const SOUTH_INDIAN_STATES: string[] = [
  'tamil nadu',
  'kerala',
  'karnataka',
  'andhra pradesh',
  'telangana',
];

export const DEFAULT_VIDEO_URL = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
export const DEFAULT_VIDEO_URL_2 = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4";
export const PLACEHOLDER_THUMBNAIL_URL_PREFIX = "https://picsum.photos/seed/";


export const INITIAL_VIDEOS: Video[] = [
  {
    id: 'bigbuckbunny',
    title: 'Big Buck Bunny',
    description: 'A short animated film by the Blender Institute, about a giant rabbit with a heart bigger than himself. Follow him as he encounters three bullying rodents.',
    thumbnailUrl: 'https://i.ytimg.com/vi/aqz-KE-bpKQ/maxresdefault.jpg',
    sources: [
      { quality: '360p', url: DEFAULT_VIDEO_URL },
      { quality: '720p', url: DEFAULT_VIDEO_URL },
      { quality: '1080p', url: DEFAULT_VIDEO_URL },
      { quality: '4K', url: DEFAULT_VIDEO_URL },
    ],
  },
  {
    id: 'elephantsdream',
    title: 'Elephants Dream',
    description: 'The first open-source animated short film, created with Blender. It explores a surreal, dream-like world.',
    thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Elephants_Dream_s5_proog.jpg/1200px-Elephants_Dream_s5_proog.jpg',
    sources: [
      { quality: '360p', url: DEFAULT_VIDEO_URL_2 },
      { quality: '720p', url: DEFAULT_VIDEO_URL_2 },
      { quality: '1080p', url: DEFAULT_VIDEO_URL_2 },
      { quality: '4K', url: DEFAULT_VIDEO_URL_2 },
    ],
  },
];


export const AVAILABLE_TRANSLATION_LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'hi', name: 'Hindi' },
  { code: 'ta', name: 'Tamil' },
];

export const SPECIAL_CHAR_REGEX = /[^a-zA-Z0-9\s.,!?'"()\p{L}\p{N}\p{P}\p{Z}]/gu;
// \p{L} for any letter, \p{N} for any number, \p{P} for any punctuation, \p{Z} for any separator (like space)
// This regex aims to disallow "control characters" or very unusual symbols not typically in comments.
// A simpler one if unicode support is not needed: /[^a-zA-Z0-9\s.,!?'"()-]/
