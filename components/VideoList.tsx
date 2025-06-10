
import React from 'react';
import { Video } from '../types';
import { TrashIcon } from './IconComponents';

interface VideoListProps {
  videos: Video[];
  onSelectVideo: (video: Video) => void;
  searchQuery?: string; // Optional search query
  onDeleteVideo: (videoId: string) => void; // Callback to delete a video
}

const VideoList: React.FC<VideoListProps> = ({ videos, onSelectVideo, searchQuery, onDeleteVideo }) => {
  
  const filteredVideos = searchQuery
    ? videos.filter(video => 
        video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        video.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : videos;

  if (filteredVideos.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-gray-500 dark:text-gray-400 text-lg">
          {searchQuery ? "No videos match your search." : "No videos yet! Click 'Upload' in the header to add your first video."}
        </p>
      </div>
    );
  }

  const handleDeleteClick = (e: React.MouseEvent, videoId: string) => {
    console.log(`[VideoList] handleDeleteClick called for videoId: ${videoId}`); 
    e.stopPropagation(); 
    onDeleteVideo(videoId);
  };

  return (
    <div className="py-6">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-white px-4">
        {searchQuery ? `Search Results for "${searchQuery}"` : 'Available Videos'} ({filteredVideos.length})
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 px-4">
        {filteredVideos.map((video) => {
          // All videos are now potentially deletable
          return (
            <div
              key={video.id}
              onClick={() => onSelectVideo(video)}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden cursor-pointer transform hover:scale-105 transition-transform duration-200 ease-in-out flex flex-col"
              role="button"
              tabIndex={0}
              onKeyPress={(e) => e.key === 'Enter' && onSelectVideo(video)}
              aria-label={`Play video: ${video.title}`}
            >
              <div className="relative">
                <img 
                  src={video.thumbnailUrl} 
                  alt={`Thumbnail for ${video.title}`} 
                  className="w-full h-40 object-cover" 
                  onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/400x225.png?text=No+Thumbnail')}
                />
                {/* Delete button is always shown for all videos */}
                <button
                  onClick={(e) => handleDeleteClick(e, video.id)}
                  className="absolute top-2 right-2 bg-red-500 hover:bg-red-700 text-white p-1.5 rounded-full shadow-md transition-colors"
                  aria-label={`Delete video: ${video.title}`}
                  title="Delete video"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
              <div className="p-4 flex-grow flex flex-col justify-between">
                <div>
                  <h3 className="text-md font-semibold text-gray-900 dark:text-white truncate" title={video.title}>
                    {video.title}
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 h-8 overflow-hidden text-ellipsis">
                    {video.description.substring(0,50)}{video.description.length > 50 ? '...' : ''}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default VideoList;
