import React, { useState } from 'react';
import { CloseIcon } from './IconComponents';

interface VideoUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (title: string, description: string) => void;
}

const VideoUploadModal: React.FC<VideoUploadModalProps> = ({ isOpen, onClose, onUpload }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Title is required.');
      return;
    }
    if (!description.trim()) {
      setError('Description is required.');
      return;
    }
    setError('');
    onUpload(title, description);
    setTitle('');
    setDescription('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75 flex items-center justify-center z-[100] p-4">
      <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-lg shadow-xl w-full max-w-lg relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          aria-label="Close upload modal"
        >
          <CloseIcon />
        </button>
        <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-white">Upload Video</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="videoTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              Video Title
            </label>
            <input
              type="text"
              id="videoTitle"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-gray-700 dark:text-white"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="videoDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              Video Description
            </label>
            <textarea
              id="videoDescription"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-gray-700 dark:text-white"
              required
            />
          </div>
          <div className="mb-6">
            <label htmlFor="videoFile" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              Video File (Cosmetic for Demo)
            </label>
            <input
              type="file"
              id="videoFile"
              className="mt-1 block w-full text-sm text-gray-500 dark:text-gray-400
                         file:mr-4 file:py-2 file:px-4
                         file:rounded-md file:border-0
                         file:text-sm file:font-semibold
                         file:bg-primary-50 dark:file:bg-gray-600
                         file:text-primary-700 dark:file:text-primary-300
                         hover:file:bg-primary-100 dark:hover:file:bg-gray-500"
              accept="video/*"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Actual file processing is not implemented in this demo. Default video source will be used.</p>
          </div>
          {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
          <button
            type="submit"
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-colors"
          >
            Upload Video
          </button>
        </form>
      </div>
    </div>
  );
};

export default VideoUploadModal;