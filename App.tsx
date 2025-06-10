
import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import Header from './components/Header';
import VideoPlayer from './components/VideoPlayer';
import CommentSection from './components/CommentSection';
import SubscriptionModal from './components/SubscriptionModal';
import OtpModal from './components/OtpModal';
import VoIPCall from './components/VoIPCall';
import VideoList from './components/VideoList';
import VideoUploadModal from './components/VideoUploadModal';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import ProfileEditModal from './components/ProfileEditModal';
import { ChevronLeftIcon } from './components/IconComponents';

import { 
  DEFAULT_VIDEO_URL, 
  PLACEHOLDER_THUMBNAIL_URL_PREFIX,
  SPECIAL_CHAR_REGEX
} from './constants';
import { Video, Comment as CommentType, User, AuthStatus } from './types';

const LoadingScreen: React.FC<{ message?: string }> = ({ message = "Loading..." }) => {
  const { theme } = useTheme();
  return (
    <div className={`flex items-center justify-center min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-800'}`}>
      {message}
    </div>
  );
};

const AppContent: React.FC = () => {
  const { user, authStatus, isLoadingAuth } = useAuth();
  const { theme } = useTheme();
  
  const [showSignupForm, setShowSignupForm] = useState(false);
  const [videos, setVideos] = useState<Video[]>([]); // Initialize with no videos
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [commentsByVideoId, setCommentsByVideoId] = useState<Record<string, CommentType[]>>({}); // Initialize empty

  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isProfileEditModalOpen, setIsProfileEditModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  useEffect(() => {
    if (authStatus === AuthStatus.LOGGED_IN) {
      setSelectedVideo(null); 
      setShowSignupForm(false); 
    } else if (authStatus === AuthStatus.LOGGED_OUT) {
      setSelectedVideo(null); 
      setShowSignupForm(false); 
      setVideos([]); // Clear videos on logout
      setCommentsByVideoId({}); // Clear comments on logout
    }
  }, [authStatus]);

  useEffect(() => {
    if (selectedVideo && !commentsByVideoId[selectedVideo.id]) {
      setCommentsByVideoId(prev => ({ ...prev, [selectedVideo.id]: [] }));
    }
  }, [selectedVideo, commentsByVideoId]);


  const handleTimeLimitReached = () => setIsSubscriptionModalOpen(true);
  const handleSelectVideo = (video: Video) => setSelectedVideo(video);
  const handleGoBackToList = () => setSelectedVideo(null);
  const handleOpenUploadModal = () => setIsUploadModalOpen(true);
  const handleCloseUploadModal = () => setIsUploadModalOpen(false);
  const handleOpenProfileModal = () => setIsProfileEditModalOpen(true);
  const handleCloseProfileModal = () => setIsProfileEditModalOpen(false);

  const handleUploadVideo = (title: string, description: string) => {
    if (!user) return; 
    const newVideoId = `video-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newVideo: Video = {
      id: newVideoId,
      title,
      description,
      thumbnailUrl: `${PLACEHOLDER_THUMBNAIL_URL_PREFIX}${newVideoId}/400/225`,
      sources: [
        { quality: '360p', url: DEFAULT_VIDEO_URL },
        { quality: '720p', url: DEFAULT_VIDEO_URL },
        { quality: '1080p', url: DEFAULT_VIDEO_URL },
        { quality: '4K', url: DEFAULT_VIDEO_URL },
      ], 
    };
    setVideos(prevVideos => [newVideo, ...prevVideos]);
    setCommentsByVideoId(prevComments => ({ ...prevComments, [newVideo.id]: [] }));
    setSelectedVideo(newVideo); 
  };

  const handleDeleteVideo = (videoId: string) => {
    console.log(`[App] handleDeleteVideo called for videoId: ${videoId}`);
    // All videos are user-uploaded, so no check against initialVideoIds is needed.
    if (window.confirm("Are you sure you want to delete this video? This action cannot be undone.")) {
      setVideos(prevVideos => prevVideos.filter(video => video.id !== videoId));
      setCommentsByVideoId(prevComments => {
        const updatedComments = { ...prevComments };
        delete updatedComments[videoId];
        return updatedComments;
      });
      if (selectedVideo && selectedVideo.id === videoId) {
        setSelectedVideo(null); 
      }
      alert("Video deleted successfully.");
    }
  };

  const currentVideoComments = selectedVideo ? commentsByVideoId[selectedVideo.id] || [] : [];

  const handleAddCommentToVideo = (text: string) => {
    if (!selectedVideo || !user) return;
    SPECIAL_CHAR_REGEX.lastIndex = 0; 
    if (SPECIAL_CHAR_REGEX.test(text)){
        alert("Comment contains invalid characters.");
        return;
    }
    const newComment: CommentType = {
      id: `comment-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      videoId: selectedVideo.id,
      userId: user.id,
      userName: user.name,
      userCity: user.city,
      text,
      timestamp: Date.now(),
      likes: 0,
      dislikes: 0,
    };
    setCommentsByVideoId(prev => ({
      ...prev,
      [selectedVideo.id]: [newComment, ...(prev[selectedVideo.id] || [])].filter(c => c.dislikes < 2)
    }));
  };

  const handleLikeCommentInVideo = (commentId: string) => {
    if (!selectedVideo) return;
    setCommentsByVideoId(prev => ({
      ...prev,
      [selectedVideo.id]: (prev[selectedVideo.id] || []).map(c =>
        c.id === commentId ? { ...c, likes: c.likes + 1 } : c
      ).filter(c => c.dislikes < 2)
    }));
  };

  const handleDislikeCommentInVideo = (commentId: string) => {
    if (!selectedVideo) return;
    setCommentsByVideoId(prev => {
        const updatedComments = (prev[selectedVideo.id] || []).map(c =>
            c.id === commentId ? { ...c, dislikes: c.dislikes + 1 } : c
        );
        return { ...prev, [selectedVideo.id]: updatedComments.filter(c => c.dislikes < 2) };
    });
  };
  
  const handleUpdateCommentTextInVideo = (commentId: string, newText: string, originalText: string, translatedTo: string) => {
    if (!selectedVideo) return;
    setCommentsByVideoId(prev => ({
      ...prev,
      [selectedVideo.id]: (prev[selectedVideo.id] || []).map(c =>
        c.id === commentId ? { ...c, text: newText, originalText, translatedTo } : c
      ).filter(c => c.dislikes < 2)
    }));
  };
  
  if (isLoadingAuth && authStatus !== AuthStatus.LOGGED_IN && authStatus !== AuthStatus.AWAITING_OTP) { 
    return <LoadingScreen message="Loading Your Experience..." />;
  }

  if (authStatus === AuthStatus.LOGGED_OUT) {
    if (showSignupForm) {
      return <SignupPage onSwitchToLogin={() => setShowSignupForm(false)} />;
    }
    return <LoginPage onSwitchToSignup={() => setShowSignupForm(true)} />;
  }
  
  if (authStatus === AuthStatus.AWAITING_OTP) {
     return <LoadingScreen message="Verifying identity..." />;
  }

  return (
    <div className={`min-h-screen flex flex-col ${theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-gray-100 text-gray-900'} transition-colors duration-300`}>
      <Header 
        onUpgradePlanClick={() => setIsSubscriptionModalOpen(true)}
        onUploadClick={handleOpenUploadModal}
        onProfileClick={handleOpenProfileModal}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      <main className="container mx-auto p-0 sm:p-4 flex-grow w-full">
        {selectedVideo ? (
          <>
            <button 
              onClick={handleGoBackToList} 
              className="mb-4 ml-4 sm:ml-0 px-3 py-1.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-md text-sm flex items-center"
            >
              <ChevronLeftIcon className="w-4 h-4 mr-1" /> Back to Video List
            </button>
            <VideoPlayer 
              video={selectedVideo} 
              onTimeLimitReached={handleTimeLimitReached} 
            />
            <CommentSection 
              videoId={selectedVideo.id}
              comments={currentVideoComments}
              onAddComment={handleAddCommentToVideo}
              onLikeComment={handleLikeCommentInVideo}
              onDislikeComment={handleDislikeCommentInVideo}
              onUpdateCommentText={handleUpdateCommentTextInVideo}
            />
             <VoIPCall />
          </>
        ) : (
          <VideoList 
            videos={videos} 
            onSelectVideo={handleSelectVideo} 
            searchQuery={searchQuery}
            onDeleteVideo={handleDeleteVideo}
          />
        )}
      </main>
      <footer className="py-4 text-center text-sm text-gray-500 dark:text-gray-400 border-t dark:border-gray-700 mt-auto">
        {/* Content removed as per request */}
      </footer>
      <SubscriptionModal isOpen={isSubscriptionModalOpen} onClose={() => setIsSubscriptionModalOpen(false)} />
      <VideoUploadModal 
        isOpen={isUploadModalOpen} 
        onClose={handleCloseUploadModal}
        onUpload={handleUploadVideo}
      />
      <ProfileEditModal 
        isOpen={isProfileEditModalOpen}
        onClose={handleCloseProfileModal}
      />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <ThemeProvider>
        <OtpModal /> 
        <AppContent />
      </ThemeProvider>
    </AuthProvider>
  );
};

export default App;
