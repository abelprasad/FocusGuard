import { useEffect, useRef, useState } from 'react';

export default function CameraFeed() {
  const videoRef = useRef(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState(null);
  const [stream, setStream] = useState(null);

  const startCamera = async () => {
    try {
      // Request camera access with specific constraints
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'  // Front-facing camera
        },
        audio: false  // We don't need audio
      });

      // Attach stream to video element
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
        setIsStreaming(true);
        setError(null);
      }
    } catch (err) {
      // Handle different types of camera errors
      let errorMessage = 'Failed to access camera';

      if (err.name === 'NotAllowedError') {
        errorMessage = 'Camera permission denied. Please allow camera access.';
      } else if (err.name === 'NotFoundError') {
        errorMessage = 'No camera found on this device.';
      } else if (err.name === 'NotReadableError') {
        errorMessage = 'Camera is already in use by another application.';
      }

      setError(errorMessage);
      setIsStreaming(false);
      console.error('Camera error:', err);
    }
  };

  const stopCamera = () => {
    if (stream) {
      // Stop all tracks to release the camera
      stream.getTracks().forEach(track => track.stop());
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      setStream(null);
      setIsStreaming(false);
    }
  };

  // Cleanup: stop camera when component unmounts
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  return (
    <div className="camera-feed">
      {/* Video Element */}
      <div className="relative bg-gray-950 rounded-lg overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-full max-w-2xl rounded-lg ${
            isStreaming ? 'block' : 'hidden'
          }`}
        />

        {/* Placeholder when camera is off */}
        {!isStreaming && !error && (
          <div className="flex items-center justify-center h-96 bg-gray-800 rounded-lg">
            <div className="text-center">
              <svg
                className="mx-auto h-16 w-16 text-gray-500 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              <p className="text-gray-400">Camera is off</p>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="controls mt-4 space-x-4">
        {!isStreaming ? (
          <button
            onClick={startCamera}
            className="bg-focus-green text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors font-medium"
          >
            Start Camera
          </button>
        ) : (
          <button
            onClick={stopCamera}
            className="bg-focus-red text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors font-medium"
          >
            Stop Camera
          </button>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="error mt-4 p-4 bg-red-900/30 border border-red-700 text-red-300 rounded-lg">
          <div className="flex items-start">
            <svg
              className="h-5 w-5 text-red-400 mt-0.5 mr-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <p className="font-medium">Camera Error</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Status Indicator */}
      {isStreaming && (
        <div className="status mt-3 flex items-center text-focus-green">
          <div className="h-2 w-2 bg-focus-green rounded-full mr-2 animate-pulse"></div>
          <span className="font-medium text-sm">Camera Active</span>
        </div>
      )}
    </div>
  );
}
