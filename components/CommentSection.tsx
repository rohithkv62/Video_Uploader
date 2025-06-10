import React, { useState } from 'react';
import { Comment, User } from '../types';
import { useAuth } from '../contexts/AuthContext';
import CommentItem from './CommentItem';
import { SPECIAL_CHAR_REGEX } from '../constants';

interface CommentSectionProps {
  videoId: string | null; // videoId can be null if no video is selected
  comments: Comment[];
  onAddComment: (text: string) => void;
  onLikeComment: (commentId: string) => void;
  onDislikeComment: (commentId: string) => void;
  onUpdateCommentText: (commentId: string, newText: string, originalText: string, translatedTo: string) => void;
}

const CommentSection: React.FC<CommentSectionProps> = ({ 
  videoId, 
  comments, 
  onAddComment, 
  onLikeComment, 
  onDislikeComment,
  onUpdateCommentText
}) => {
  const { user } = useAuth();
  const [newCommentText, setNewCommentText] = useState('');
  const [error, setError] = useState('');

  if (!videoId) { // If no video is selected, don't render the comment section or show a placeholder
    return (
      <div className="mt-8 p-4 bg-white dark:bg-gray-800 shadow-lg rounded-lg max-w-4xl mx-auto">
        <p className="text-gray-500 dark:text-gray-400">Select a video to see comments.</p>
      </div>
    );
  }

  const handleAddCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('You must be logged in to comment.');
      return;
    }
    if (!newCommentText.trim()) {
      setError('Comment cannot be empty.');
      return;
    }
    // Reset regex state before test
    SPECIAL_CHAR_REGEX.lastIndex = 0; 
    if (SPECIAL_CHAR_REGEX.test(newCommentText)) {
        setError('Comment contains invalid characters. Please use letters, numbers, and common punctuation.');
        return;
    }
    setError('');
    onAddComment(newCommentText);
    setNewCommentText('');
  };

  return (
    <div className="mt-8 p-4 bg-white dark:bg-gray-800 shadow-lg rounded-lg max-w-4xl mx-auto">
      <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Comments ({comments.length})</h3>
      {user && (
        <form onSubmit={handleAddCommentSubmit} className="mb-6">
          <textarea
            value={newCommentText}
            onChange={(e) => setNewCommentText(e.target.value)}
            placeholder="Add a public comment..."
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            rows={3}
            aria-label="New comment input"
          />
          {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          <button
            type="submit"
            className="mt-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-md transition-colors"
          >
            Comment
          </button>
        </form>
      )}
      {!user && <p className="text-gray-600 dark:text-gray-400 mb-4">Login to post comments.</p>}
      
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {comments.length > 0 ? (
          comments.map(comment => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onLike={onLikeComment}
              onDislike={onDislikeComment}
              onUpdateCommentText={onUpdateCommentText}
            />
          ))
        ) : (
          <p className="text-gray-500 dark:text-gray-400">No comments yet for this video. Be the first to comment!</p>
        )}
      </div>
    </div>
  );
};

export default CommentSection;