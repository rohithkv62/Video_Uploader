
import React, { useState, useRef, useEffect } from 'react';
import { VideoCameraIcon, StopIcon, RecordIcon, ScreenShareIcon } from './IconComponents';

const VoIPCall: React.FC = () => {
  const [isCallActive, setIsCallActive] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null); // For actual P2P call, this would show remote stream
  
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);

  // Cleanup streams on component unmount
  useEffect(() => {
    return () => {
      localStream?.getTracks().forEach(track => track.stop());
      screenStream?.getTracks().forEach(track => track.stop());
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    };
  }, [localStream, screenStream]);

  const startCall = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      setIsCallActive(true);
      // In a real app, here you would initiate connection to a remote peer via WebRTC signaling server
      console.log("Call started. Local stream active.");
      // Mock remote stream for UI testing
      if (remoteVideoRef.current) {
        // This is just a placeholder. A real remote stream comes from a peer.
        // To simulate, you could play the local stream in remote view if no peer connected.
        // remoteVideoRef.current.srcObject = stream; // Example for testing UI with local stream
      }
    } catch (error) {
      console.error('Error starting call:', error);
      alert('Could not start call. Check camera/microphone permissions.');
    }
  };

  const stopCall = () => {
    localStream?.getTracks().forEach(track => track.stop());
    setLocalStream(null);
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null; // Clear remote as well
    
    if (isScreenSharing) stopScreenShare(); // Also stop screen share if active
    if (isRecording) stopRecording(); // Also stop recording if active

    setIsCallActive(false);
    console.log("Call ended.");
  };

  const startScreenShare = async () => {
    if (!isCallActive) {
        alert("Start a call first to share your screen.");
        return;
    }
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      setScreenStream(stream);
      // In a real app, you'd send this stream to the peer.
      // For local display/recording, you might replace local video or show it separately.
      // Here, we'll just log it and manage its state.
      if (localVideoRef.current) { // Optionally replace local video with screen share
         localVideoRef.current.srcObject = stream;
      }
      setIsScreenSharing(true);
      stream.getVideoTracks()[0].onended = () => { // Listener for when user stops sharing via browser UI
        stopScreenShare(true); // Pass true to indicate it was externally stopped
      };
      console.log("Screen sharing started.");
    } catch (error) {
      console.error('Error starting screen share:', error);
      alert('Could not start screen share.');
    }
  };

  const stopScreenShare = (externallyStopped = false) => {
    screenStream?.getTracks().forEach(track => track.stop());
    setScreenStream(null);
    setIsScreenSharing(false);
    // Restore local video if it was replaced by screen share
    if (localStream && localVideoRef.current) {
        localVideoRef.current.srcObject = localStream;
    }
    if(!externallyStopped) console.log("Screen sharing stopped by user action.");
    else console.log("Screen sharing stopped (browser UI or track ended).");
  };

  const startRecording = () => {
    if (!localStream && !screenStream) {
        alert("Nothing to record. Start call or screen share first.");
        return;
    }
    // Prefer screenStream if available, else localStream
    const streamToRecord = screenStream || localStream;
    if (!streamToRecord) {
        alert("No active stream to record.");
        return;
    }

    setRecordedChunks([]); // Clear previous recording chunks
    try {
      mediaRecorderRef.current = new MediaRecorder(streamToRecord, { mimeType: 'video/webm;codecs=vp9' });
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setRecordedChunks((prev) => [...prev, event.data]);
        }
      };
      mediaRecorderRef.current.onstop = () => {
        // Handled by stopRecording or download function
      };
      mediaRecorderRef.current.start();
      setIsRecording(true);
      console.log("Recording started.");
    } catch (error) {
        console.error("Error starting recording:", error);
        alert(`Failed to start recording. Browser may not support chosen mimetype. ${error}`);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    console.log("Recording stopped.");
    // Download will be triggered separately or after this if chunks exist
  };

  const downloadRecording = () => {
    if (recordedChunks.length === 0) {
      alert("No recording available to download.");
      return;
    }
    const blob = new Blob(recordedChunks, { type: 'video/webm' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = `recorded_session_${new Date().toISOString()}.webm`;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
    setRecordedChunks([]); // Clear chunks after download
    console.log("Recording downloaded.");
  };

  return (
    <div className="mt-8 p-4 bg-white dark:bg-gray-800 shadow-lg rounded-lg max-w-4xl mx-auto">
      <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Video Call Session</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="bg-gray-900 aspect-video rounded overflow-hidden flex items-center justify-center">
          <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
          {!localStream && <p className="text-gray-400">Your Video</p>}
        </div>
        <div className="bg-gray-900 aspect-video rounded overflow-hidden flex items-center justify-center">
          <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
          {/* Mocking message, in real app this fills when peer connects */}
          {!isCallActive && <p className="text-gray-400">Friend's Video (Waiting)</p>}
          {isCallActive && !remoteVideoRef.current?.srcObject && <p className="text-gray-400">Friend's Video (Connecting...)</p>}
        </div>
      </div>
      <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-3">
        {!isCallActive ? (
          <button onClick={startCall} className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-md flex items-center transition-colors">
            <VideoCameraIcon className="w-5 h-5 mr-2" /> Start Call
          </button>
        ) : (
          <button onClick={stopCall} className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-md flex items-center transition-colors">
            <StopIcon className="w-5 h-5 mr-2" /> End Call
          </button>
        )}

        {isCallActive && !isScreenSharing && (
          <button onClick={startScreenShare} className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-md flex items-center transition-colors">
            <ScreenShareIcon className="w-5 h-5 mr-2" /> Share Screen
          </button>
        )}
        {isCallActive && isScreenSharing && (
          <button onClick={() => stopScreenShare()} className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-md flex items-center transition-colors">
            <StopIcon className="w-5 h-5 mr-2" /> Stop Sharing
          </button>
        )}

        {isCallActive && !isRecording && (
          <button onClick={startRecording} className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white font-semibold rounded-md flex items-center transition-colors">
            <RecordIcon className="w-5 h-5 mr-2 fill-white" /> Start Recording
          </button>
        )}
        {isCallActive && isRecording && (
          <button onClick={stopRecording} className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-md flex items-center transition-colors">
            <StopIcon className="w-5 h-5 mr-2" /> Stop Recording
          </button>
        )}
      </div>
      {recordedChunks.length > 0 && !isRecording && (
          <div className="mt-4 text-center">
            <button onClick={downloadRecording} className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white font-semibold rounded-md transition-colors">
              Download Recording
            </button>
          </div>
        )}
    </div>
  );
};

export default VoIPCall;

