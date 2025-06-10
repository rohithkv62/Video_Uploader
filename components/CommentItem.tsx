
import React, { useState } from 'react';
import { Comment } from '../types';
import { TranslateIcon } from './IconComponents'; // ThumbsUpIcon and ThumbsDownIcon removed from imports
import { translateText } from '../services/geminiService';
import { AVAILABLE_TRANSLATION_LANGUAGES } from '../constants';

interface CommentItemProps {
  comment: Comment;
  onLike: (commentId: string) => void;
  onDislike: (commentId: string) => void;
  onUpdateCommentText: (commentId: string, newText: string, originalText: string, translatedTo: string) => void;
}

const CommentItem: React.FC<CommentItemProps> = ({ comment, onLike, onDislike, onUpdateCommentText }) => {
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState('');
  const [targetLang, setTargetLang] = useState<string>(AVAILABLE_TRANSLATION_LANGUAGES[0].code); // Default to English

  const handleTranslate = async () => {
    if (!comment.text) return;
    setIsTranslating(true);
    setError('');
    try {
      const textToTranslate = comment.originalText || comment.text;
      const translated = await translateText(textToTranslate, targetLang);
      onUpdateCommentText(comment.id, translated, textToTranslate, targetLang);
    } catch (err) {
      console.error("Translation failed:", err);
      setError('Failed to translate. Please try again.');
    } finally {
      setIsTranslating(false);
    }
  };

  const displayTime = new Date(comment.timestamp).toLocaleString();

  return (
    <div className="p-3 border-b border-gray-200 dark:border-gray-700">
      <div className="flex justify-between items-start mb-1">
        <div>
            <span className="font-semibold text-sm text-gray-800 dark:text-white">{comment.userName}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">from {comment.userCity}</span>
        </div>
        <span className="text-xs text-gray-500 dark:text-gray-400">{displayTime}</span>
      </div>
      <p className="text-gray-700 dark:text-gray-300 text-sm mb-2 whitespace-pre-wrap">
        {comment.text}
        {comment.originalText && comment.translatedTo && (
            <span className="text-xs text-gray-400 dark:text-gray-500 block mt-1">
                (Translated from original to {AVAILABLE_TRANSLATION_LANGUAGES.find(l=>l.code === comment.translatedTo)?.name || comment.translatedTo})
            </span>
        )}
        </p>
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => onLike(comment.id)} 
            className="flex items-center text-gray-500 hover:text-green-500 dark:text-gray-400 dark:hover:text-green-400 transition-colors"
            aria-label="Like comment"
          >
            <span role="img" aria-label="thumbs up" className="mr-1 text-lg">👍</span> {comment.likes}
          </button>
          <button 
            onClick={() => onDislike(comment.id)} 
            className="flex items-center text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
            aria-label="Dislike comment"
          >
            <span role="img" aria-label="thumbs down" className="mr-1 text-lg">👎</span> {comment.dislikes}
          </button>
        </div>
        <div className="flex items-center">
          <select 
            value={targetLang} 
            onChange={(e) => setTargetLang(e.target.value)}
            disabled={isTranslating}
            className="mr-2 p-1 text-xs border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 dark:text-white focus:ring-primary-500 focus:border-primary-500"
            aria-label="Select language for translation"
          >
            {AVAILABLE_TRANSLATION_LANGUAGES.map(lang => (
              <option key={lang.code} value={lang.code}>{lang.name}</option>
            ))}
          </select>
          <button 
            onClick={handleTranslate} 
            disabled={isTranslating}
            className="flex items-center text-gray-500 hover:text-primary-500 dark:text-gray-400 dark:hover:text-primary-400 transition-colors disabled:opacity-50"
          >
            <TranslateIcon className="w-4 h-4 mr-1" /> {isTranslating ? 'Translating...' : 'Translate'}
          </button>
        </div>
      </div>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
};

export default CommentItem;
