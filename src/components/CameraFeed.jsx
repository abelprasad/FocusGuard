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
        className="relative overflow-hidden"
        style={{
          display: isStreaming ? 'grid' : 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '400px'
        }}
      >
        {/* Video Element */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={isStreaming ? 'block' : 'hidden'}
          style={{
            gridArea: isStreaming ? '1 / 1' : undefined,
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
          <div className="text-center">
            <button
              onClick={startCamera}
              disabled={!detectorReady}
              className="text-sm font-light tracking-wide uppercase transition-colors text-white hover:text-gray-400 disabled:text-gray-600 disabled:cursor-not-allowed"
            >
              {detectorReady ? 'Enable Camera' : 'Loading...'}
            </button>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="mt-6 text-sm text-gray-500 text-center">
          {error}
        </div>
      )}

      {/* Minimal Camera Control */}
      {isStreaming && (
        <div className="mt-6 text-center">
          <button
            onClick={stopCamera}
            className="text-xs font-light tracking-wide uppercase transition-colors text-gray-600 hover:text-gray-400"
          >
            Disable Camera
          </button>
        </div>
      )}
    </div>
  );
}
