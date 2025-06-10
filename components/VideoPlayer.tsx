import React, { useState, useEffect, useRef } from 'react';
import ReactPlayer from 'react-player/lazy'; // Lazy load for better performance
import { Video, Plan } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { PLAN_DETAILS } from '../constants';

interface VideoPlayerProps {
  video: Video | null; // Video can be null if none is selected
  onTimeLimitReached: () => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ video, onTimeLimitReached }) => {
  const { user } = useAuth();
  const [currentQuality, setCurrentQuality] = useState<string>('');
  const [currentSourceUrl, setCurrentSourceUrl] = useState<string>('');
  const [playedSeconds, setPlayedSeconds] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const playerRef = useRef<ReactPlayer>(null);

  const maxWatchTime = user ? PLAN_DETAILS[user.currentPlan].maxWatchTime : PLAN_DETAILS[Plan.FREE].maxWatchTime;

  useEffect(() => {
    if (video && video.sources && video.sources.length > 0) {
      const initialQuality = video.sources[0].quality;
      setCurrentQuality(initialQuality);
      setCurrentSourceUrl(video.sources[0].url);
      setPlayedSeconds(0); // Reset played seconds when video changes
      setIsPlaying(false); // Ensure video doesn't auto-play on change unless intended
    } else {
      // Clear player if no video
      setCurrentQuality('');
      setCurrentSourceUrl('');
      setPlayedSeconds(0);
      setIsPlaying(false);
    }
  }, [video]);
  
  useEffect(() => {
    if (video && video.sources && video.sources.length > 0) {
        const selectedSource = video.sources.find(s => s.quality === currentQuality);
        if (selectedSource) {
            setCurrentSourceUrl(selectedSource.url);
        } else if (video.sources.length > 0) { // Fallback if currentQuality somehow mismatch
            setCurrentQuality(video.sources[0].quality);
            setCurrentSourceUrl(video.sources[0].url);
        }
    }
  }, [currentQuality, video]);

  useEffect(() => {
    if (playedSeconds >= maxWatchTime && maxWatchTime !== Infinity) {
      if (playerRef.current) {
        playerRef.current.seekTo(maxWatchTime); 
      }
      setIsPlaying(false); 
      onTimeLimitReached();
    }
  }, [playedSeconds, maxWatchTime, onTimeLimitReached]);

  const handleProgress = (progress: { playedSeconds: number }) => {
    if (isPlaying) { 
        const newPlayedSeconds = (maxWatchTime !== Infinity && progress.playedSeconds > maxWatchTime)
                                 ? maxWatchTime
                                 : progress.playedSeconds;
        setPlayedSeconds(newPlayedSeconds);
    }
  };
  
  const handlePlay = () => {
    if (!video) return;
    if (playedSeconds < maxWatchTime || maxWatchTime === Infinity) {
        setIsPlaying(true);
    } else {
        setIsPlaying(false); 
        onTimeLimitReached();
    }
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handleQualityChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    if (!video || !video.sources) return;
    const newQuality = event.target.value;
    const newSource = video.sources.find(s => s.quality === newQuality);
    if (newSource) {
      const currentTime = playerRef.current?.getCurrentTime() || 0;
      setCurrentQuality(newQuality);
      // URL update will be handled by useEffect on currentQuality change
      // setCurrentSourceUrl(newSource.url); // This line is not strictly needed due to useEffect
      // ReactPlayer might handle seek persistence, or you might need to force it if URL change resets time
      setTimeout(() => playerRef.current?.seekTo(currentTime), 100);
    }
  };

  if (!video) {
    return (
      <div className="w-full max-w-4xl mx-auto bg-gray-200 dark:bg-gray-700 rounded-lg shadow-2xl aspect-video flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400 text-lg">Select a video to play.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto bg-black dark:bg-gray-900 rounded-lg shadow-2xl overflow-hidden">
      <div className="aspect-video relative">
        <ReactPlayer
          ref={playerRef}
          url={currentSourceUrl}
          playing={isPlaying}
          controls
          width="100%"
          height="100%"
          onProgress={handleProgress}
          onPlay={handlePlay}
          onPause={handlePause}
          onEnded={() => setIsPlaying(false)}
          config={{
            file: {
              attributes: {}
            }
          }}
        />
        {(playedSeconds >= maxWatchTime && maxWatchTime !== Infinity) && (
            <div className="absolute inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center text-white p-4 z-10">
                <h3 className="text-2xl font-semibold mb-2">Watch Time Limit Reached</h3>
                <p className="text-center mb-4">Your current plan allows {maxWatchTime / 60} minutes of watch time.</p>
                <button 
                    onClick={onTimeLimitReached}
                    className="px-6 py-2 bg-primary-500 hover:bg-primary-600 rounded text-white font-semibold"
                >
                    Upgrade Plan
                </button>
            </div>
        )}
      </div>
      <div className="p-4 bg-gray-100 dark:bg-gray-800 flex flex-col sm:flex-row justify-between items-center">
        <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{video.title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
                {user ? `Plan: ${PLAN_DETAILS[user.currentPlan].displayName} - ` : ''} 
                {maxWatchTime === Infinity ? 'Unlimited watching' : `Limit: ${maxWatchTime / 60} mins`}
            </p>
        </div>
        {video.sources && video.sources.length > 0 && currentQuality && (
          <div className="mt-2 sm:mt-0">
            <label htmlFor="quality-select" className="mr-2 text-sm text-gray-700 dark:text-gray-300">Quality:</label>
            <select
              id="quality-select"
              value={currentQuality}
              onChange={handleQualityChange}
              className="p-1.5 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 dark:text-white focus:ring-primary-500 focus:border-primary-500"
            >
              {video.sources.map(source => (
                <option key={source.quality} value={source.quality}>{source.quality}</option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoPlayer;