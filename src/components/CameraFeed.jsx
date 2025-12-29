import { useEffect, useRef, useState } from 'react';
import { FaceDetector } from '../utils/faceDetector';

export default function CameraFeed({ onDetectionUpdate }) {
  // Refs for video and canvas elements
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Camera state
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState(null);
  const [stream, setStream] = useState(null);

  // Face detection state
  const [detectorReady, setDetectorReady] = useState(false);
  const [detectionResults, setDetectionResults] = useState({
    faceDetected: false,
    faces: [],
    confidence: 0
  });

  // Face detector instance (persist across renders)
  const detectorRef = useRef(null);
  const animationFrameRef = useRef(null);

  /**
   * Initialize MediaPipe Face Detector
   * Runs once when component mounts
   */
  useEffect(() => {
    const initDetector = async () => {
      try {
        console.log('Loading face detection model...');
        detectorRef.current = new FaceDetector();
        await detectorRef.current.initialize();
        setDetectorReady(true);
        console.log('✅ Face detector ready!');
      } catch (err) {
        console.error('Failed to initialize face detector:', err);
        setError('Face detection unavailable. Camera will still work.');
      }
    };

    initDetector();

    // Cleanup on unmount
    return () => {
      if (detectorRef.current) {
        detectorRef.current.dispose();
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  /**
   * Start camera stream
   */
  const startCamera = async () => {
    try {
      // Request camera access
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: false
      });

      // Attach to video element
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
        setIsStreaming(true);
        setError(null);

        // Start face detection loop once video is playing
        videoRef.current.onloadeddata = () => {
          startDetectionLoop();
        };
      }
    } catch (err) {
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
    }
  };

  /**
   * Stop camera and detection
   */
  const stopCamera = () => {
    // Stop detection loop
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    // Stop camera stream
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      setStream(null);
      setIsStreaming(false);
    }

    // Clear canvas
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }

    // Reset detection state
    setDetectionResults({ faceDetected: false, faces: [], confidence: 0 });
  };

  /**
   * Main detection loop
   * Runs continuously while camera is active
   */
  const startDetectionLoop = () => {
    const detectAndDraw = () => {
      if (!videoRef.current || !canvasRef.current || !detectorRef.current) {
        animationFrameRef.current = requestAnimationFrame(detectAndDraw);
        return;
      }

      const video = videoRef.current;
      const canvas = canvasRef.current;

      // Match canvas size to video's DISPLAYED size (not internal resolution)
      const displayWidth = video.offsetWidth;
      const displayHeight = video.offsetHeight;

      // Update both internal buffer AND CSS display size
      if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
        canvas.width = displayWidth;
        canvas.height = displayHeight;
        canvas.style.width = `${displayWidth}px`;
        canvas.style.height = `${displayHeight}px`;
      }

      // Run face detection
      const results = detectorRef.current.detect(video);

      // Update state and draw if we got new results
      if (results) {
        const detectionData = {
          faceDetected: results.faceDetected,
          faces: results.faces,
          confidence: results.faces[0]?.confidence || 0
        };

        setDetectionResults(detectionData);

        // Report to parent component for session tracking
        if (onDetectionUpdate) {
          onDetectionUpdate(detectionData);
        }

        drawDetections(results, canvas, video);
      }

      // Continue loop
      animationFrameRef.current = requestAnimationFrame(detectAndDraw);
    };

    detectAndDraw();
  };

  /**
   * Draw detection results on canvas
   * @param {Object} results - Detection results from FaceDetector
   * @param {HTMLCanvasElement} canvas - Canvas to draw on
   * @param {HTMLVideoElement} video - Video element for scaling
   */
  const drawDetections = (results, canvas, video) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear previous frame
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!results.faceDetected) return;

    // Draw each detected face
    results.faces.forEach(face => {
      // MediaPipe returns pixel coordinates for video resolution,
      // so we need to scale to canvas display size
      const scaleX = canvas.width / video.videoWidth;
      const scaleY = canvas.height / video.videoHeight;

      const x = face.boundingBox.x * scaleX;
      const y = face.boundingBox.y * scaleY;
      const width = face.boundingBox.width * scaleX;
      const height = face.boundingBox.height * scaleY;

      // Draw bounding box
      ctx.strokeStyle = '#10B981'; // focus-green
      ctx.lineWidth = 3;
      ctx.strokeRect(x, y, width, height);

      // Draw confidence score
      ctx.fillStyle = '#10B981';
      ctx.font = 'bold 16px sans-serif';
      const confidenceText = `${Math.round(face.confidence * 100)}%`;
      ctx.fillText(confidenceText, x, y - 10);

      // Draw facial landmarks (keypoints)
      ctx.fillStyle = '#3B82F6'; // focus-blue
      face.landmarks.forEach(landmark => {
        const lx = landmark.x * canvas.width;
        const ly = landmark.y * canvas.height;
        ctx.beginPath();
        ctx.arc(lx, ly, 3, 0, 2 * Math.PI);
        ctx.fill();
      });
    });
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [stream]);

  return (
    <div className="camera-feed">
      {/* Video + Canvas Container */}
      <div
        className="relative bg-gray-950 rounded-lg overflow-hidden"
        style={{
          display: isStreaming ? 'grid' : 'block'
        }}
      >
        {/* Video Element */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`rounded-lg ${
            isStreaming ? 'block' : 'hidden'
          }`}
          style={{
            gridArea: isStreaming ? '1 / 1' : undefined,
            maxWidth: '672px',
            width: '100%'
          }}
        />

        {/* Canvas Overlay for drawing detections */}
        <canvas
          ref={canvasRef}
          style={{
            display: isStreaming ? 'block' : 'none',
            gridArea: isStreaming ? '1 / 1' : undefined,
            pointerEvents: 'none'
          }}
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
              {detectorReady && (
                <p className="text-xs text-focus-green mt-2">✓ Face detection ready</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="controls mt-4 space-x-4">
        {!isStreaming ? (
          <button
            onClick={startCamera}
            disabled={!detectorReady}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              detectorReady
                ? 'bg-focus-green text-white hover:bg-green-600'
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }`}
          >
            {detectorReady ? 'Start Camera' : 'Loading detector...'}
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
              <p className="font-medium">Error</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Detection Results Display */}
      {isStreaming && detectorReady && (
        <div className="mt-4 grid grid-cols-3 gap-3">
          {/* Face Detected Status */}
          <div className={`p-3 rounded-lg border ${
            detectionResults.faceDetected
              ? 'bg-green-900/20 border-focus-green'
              : 'bg-gray-800 border-gray-700'
          }`}>
            <div className="text-xs text-gray-400 mb-1">Presence</div>
            <div className={`font-semibold ${
              detectionResults.faceDetected ? 'text-focus-green' : 'text-gray-500'
            }`}>
              {detectionResults.faceDetected ? 'Detected' : 'Not Detected'}
            </div>
          </div>

          {/* Confidence Score */}
          <div className="p-3 rounded-lg bg-gray-800 border border-gray-700">
            <div className="text-xs text-gray-400 mb-1">Confidence</div>
            <div className="font-semibold text-focus-blue">
              {Math.round(detectionResults.confidence * 100)}%
            </div>
          </div>

          {/* Face Count */}
          <div className="p-3 rounded-lg bg-gray-800 border border-gray-700">
            <div className="text-xs text-gray-400 mb-1">Faces</div>
            <div className="font-semibold text-white">
              {detectionResults.faces.length}
            </div>
          </div>
        </div>
      )}

      {/* Status Indicator */}
      {isStreaming && (
        <div className="status mt-3 flex items-center text-focus-green">
          <div className="h-2 w-2 bg-focus-green rounded-full mr-2 animate-pulse"></div>
          <span className="font-medium text-sm">
            Camera Active • Face Detection Running
          </span>
        </div>
      )}
    </div>
  );
}
