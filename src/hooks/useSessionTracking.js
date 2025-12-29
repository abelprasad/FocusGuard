import { useState, useRef, useEffect } from 'react';

/**
 * Custom hook for tracking work session metrics
 * Manages session state, timer, and focus/distraction/away time tracking
 */
export default function useSessionTracking() {
  // Session state
  const [sessionActive, setSessionActive] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const [sessionDuration, setSessionDuration] = useState(0);
  const [focusedTime, setFocusedTime] = useState(0);
  const [distractedTime, setDistractedTime] = useState(0);
  const [awayTime, setAwayTime] = useState(0);

  // Refs for tracking without re-renders
  const currentStateRef = useRef('away'); // 'focused' | 'distracted' | 'away'
  const lastUpdateTimeRef = useRef(null);
  const intervalRef = useRef(null);

  /**
   * Start a new session
   * Resets all metrics and starts the timer
   */
  const startSession = () => {
    const now = Date.now();

    setSessionActive(true);
    setSessionStartTime(now);
    setSessionDuration(0);
    setFocusedTime(0);
    setDistractedTime(0);
    setAwayTime(0);

    currentStateRef.current = 'away';
    lastUpdateTimeRef.current = now;

    // Start interval to increment duration every second
    intervalRef.current = setInterval(() => {
      setSessionDuration(prev => prev + 1);
    }, 1000);
  };

  /**
   * Stop the current session
   * Returns final metrics for potential persistence
   */
  const stopSession = () => {
    setSessionActive(false);

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Return final metrics (for future database storage)
    return {
      duration: sessionDuration,
      focusedTime,
      distractedTime,
      awayTime,
      focusScore: sessionDuration > 0 ? (focusedTime / sessionDuration) * 100 : 0
    };
  };

  /**
   * Update focus state based on face detection results
   * Called every time new detection results arrive (~10 FPS)
   */
  const updateFocusState = (detectionResults) => {
    if (!sessionActive || !lastUpdateTimeRef.current) return;

    // Classify current state based on detection
    let newState = 'away';
    if (detectionResults.faceDetected) {
      // Confidence threshold: >= 0.6 is focused, < 0.6 is distracted
      newState = detectionResults.confidence >= 0.6 ? 'focused' : 'distracted';
    }

    // Calculate time delta since last update
    const now = Date.now();
    const deltaSeconds = (now - lastUpdateTimeRef.current) / 1000;

    // Add delta to the appropriate time bucket based on PREVIOUS state
    // (We track what state we WERE in, not what we're transitioning to)
    if (currentStateRef.current === 'focused') {
      setFocusedTime(prev => prev + deltaSeconds);
    } else if (currentStateRef.current === 'distracted') {
      setDistractedTime(prev => prev + deltaSeconds);
    } else {
      setAwayTime(prev => prev + deltaSeconds);
    }

    // Update refs for next iteration
    currentStateRef.current = newState;
    lastUpdateTimeRef.current = now;
  };

  // Calculate focus score as percentage
  const focusScore = sessionDuration > 0
    ? (focusedTime / sessionDuration) * 100
    : 0;

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    sessionActive,
    sessionDuration,
    focusedTime,
    distractedTime,
    awayTime,
    focusScore,
    startSession,
    stopSession,
    updateFocusState
  };
}
