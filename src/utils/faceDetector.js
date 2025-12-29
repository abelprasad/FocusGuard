import { FaceDetector as MediaPipeFaceDetector, FilesetResolver } from '@mediapipe/tasks-vision';

/**
 * FaceDetector - Wrapper around MediaPipe Face Detection
 *
 * This class handles:
 * - Loading the MediaPipe face detection model
 * - Processing video frames to detect faces
 * - Returning detection results (bounding boxes, confidence scores)
 *
 * Usage:
 *   const detector = new FaceDetector();
 *   await detector.initialize();
 *   const results = detector.detect(videoElement);
 */
export class FaceDetector {
  constructor() {
    this.detector = null;
    this.isInitialized = false;
    this.lastDetectionTime = 0;

    // Performance: Process frames every 100ms (10 FPS) to save CPU
    this.detectionInterval = 100; // milliseconds
  }

  /**
   * Initialize the MediaPipe face detector
   * Downloads model files and creates detector instance
   * Call this once before using detect()
   */
  async initialize() {
    if (this.isInitialized) {
      console.log('FaceDetector already initialized');
      return;
    }

    try {
      console.log('Initializing MediaPipe Face Detector...');

      // Step 1: Load MediaPipe vision tasks
      const vision = await FilesetResolver.forVisionTasks(
        // Path to MediaPipe WASM files (hosted on CDN)
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
      );

      // Step 2: Create face detector with configuration
      this.detector = await MediaPipeFaceDetector.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite',
          delegate: 'GPU' // Use GPU acceleration if available
        },
        runningMode: 'VIDEO', // Optimized for video streams
        minDetectionConfidence: 0.5 // Only return detections with >50% confidence
      });

      this.isInitialized = true;
      console.log('✅ MediaPipe Face Detector initialized successfully');
    } catch (error) {
      console.error('Failed to initialize FaceDetector:', error);
      throw new Error(`FaceDetector initialization failed: ${error.message}`);
    }
  }

  /**
   * Detect faces in a video frame
   *
   * @param {HTMLVideoElement} videoElement - The video element to analyze
   * @returns {Object} Detection results with faces array and metadata
   *
   * Returns:
   * {
   *   faces: [
   *     {
   *       boundingBox: { x, y, width, height }, // Face position
   *       confidence: 0.95,                      // Detection confidence (0-1)
   *       landmarks: [...],                      // Facial landmarks (eyes, nose, etc)
   *     }
   *   ],
   *   faceDetected: true/false,                  // Quick check
   *   timestamp: 1234567890,                     // When detected
   * }
   */
  detect(videoElement) {
    if (!this.isInitialized || !this.detector) {
      console.warn('FaceDetector not initialized. Call initialize() first.');
      return { faces: [], faceDetected: false, timestamp: Date.now() };
    }

    // Performance optimization: Skip frames if detecting too frequently
    const now = Date.now();
    if (now - this.lastDetectionTime < this.detectionInterval) {
      return null; // Signal to use previous results
    }
    this.lastDetectionTime = now;

    try {
      // Run detection on current video frame
      const timestamp = performance.now();
      const detections = this.detector.detectForVideo(videoElement, timestamp);

      // Transform MediaPipe results into our format
      const faces = detections.detections.map(detection => ({
        // Bounding box: normalized coordinates (0-1), we'll convert to pixels later
        boundingBox: {
          x: detection.boundingBox.originX,
          y: detection.boundingBox.originY,
          width: detection.boundingBox.width,
          height: detection.boundingBox.height
        },
        // Confidence score (how sure the model is this is a face)
        confidence: detection.categories[0]?.score || 0,
        // Keypoints (6 facial landmarks: eyes, nose, mouth corners)
        landmarks: detection.keypoints.map(kp => ({
          x: kp.x,
          y: kp.y
        }))
      }));

      return {
        faces,
        faceDetected: faces.length > 0,
        timestamp: now
      };
    } catch (error) {
      console.error('Face detection error:', error);
      return { faces: [], faceDetected: false, timestamp: Date.now() };
    }
  }

  /**
   * Clean up resources
   * Call this when you're done with face detection
   */
  dispose() {
    if (this.detector) {
      this.detector.close();
      this.detector = null;
      this.isInitialized = false;
      console.log('FaceDetector disposed');
    }
  }

  /**
   * Update detection interval (how often to process frames)
   * @param {number} interval - Milliseconds between detections
   */
  setDetectionInterval(interval) {
    this.detectionInterval = Math.max(33, interval); // Minimum 30 FPS
  }
}
