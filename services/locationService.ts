
import { LocationInfo } from '../types';
import { SOUTH_INDIAN_STATES } from '../constants';

// Mock function to simulate fetching user location
export const getUserLocation = async (): Promise<LocationInfo> => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 300));

  // For testing different scenarios, you can change this:
  // To make it more dynamic for testing, let's cycle through a few options or pick randomly
  const mockLocations: Omit<LocationInfo, 'isSouthIndia'>[] = [
    { city: 'Chennai', state: 'Tamil Nadu', country: 'India' },
    { city: 'Kochi', state: 'Kerala', country: 'India' },
    { city: 'Bengaluru', state: 'Karnataka', country: 'India' },
    { city: 'Hyderabad', state: 'Telangana', country: 'India' },
    { city: 'Visakhapatnam', state: 'Andhra Pradesh', country: 'India' },
    { city: 'Mumbai', state: 'Maharashtra', country: 'India' },
    { city: 'New Delhi', state: 'Delhi', country: 'India' },
    { city: 'New York', state: 'New York', country: 'USA' },
    { city: 'London', state: 'London', country: 'UK' },
  ];
  
  const randomLocationData = mockLocations[Math.floor(Math.random() * mockLocations.length)];
  
  const isSouthIndia = SOUTH_INDIAN_STATES.includes(randomLocationData.state.toLowerCase());

  const locationInfo: LocationInfo = {
    ...randomLocationData,
    isSouthIndia,
  };
  
  console.log("Mock location fetched:", locationInfo);
  return locationInfo;
};
