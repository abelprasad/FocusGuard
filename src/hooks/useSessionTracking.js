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

  // Countdown timer state
  const [sessionType, setSessionType] = useState(null);
  const [targetDuration, setTargetDuration] = useState(0);
  const [remainingTime, setRemainingTime] = useState(0);

  // Away notification state
  const [awayStartTime, setAwayStartTime] = useState(null);
  const [awayNotificationShown, setAwayNotificationShown] = useState(false);

  // Refs for tracking without re-renders
  const currentStateRef = useRef('away'); // 'focused' | 'distracted' | 'away'
  const lastUpdateTimeRef = useRef(null);
  const intervalRef = useRef(null);
  const waterIntervalRef = useRef(null);

  /**
   * Session complete handler
   * Called when countdown reaches 0
   */
  const handleSessionComplete = () => {
    if (window.electronAPI?.notify) {
      window.electronAPI.notify(
        'Session Complete! 🎉',
        `Your ${sessionType || 'focus'} session has ended. Great work!`
      );
    }
    stopSession();
  };

  /**
   * Start a new session
   * Resets all metrics and starts the timer
   * @param {Object} sessionConfig - { type, duration, name }
   */
  const startSession = (sessionConfig) => {
    const now = Date.now();

    setSessionActive(true);
    setSessionStartTime(now);
    setSessionType(sessionConfig.type);
    setTargetDuration(sessionConfig.duration);
    setRemainingTime(sessionConfig.duration);
    setSessionDuration(0);
    setFocusedTime(0);
    setDistractedTime(0);
    setAwayTime(0);
    setAwayStartTime(null);
    setAwayNotificationShown(false);

    currentStateRef.current = 'away';
    lastUpdateTimeRef.current = now;

    // Start interval for countdown and elapsed time tracking
    intervalRef.current = setInterval(() => {
      setRemainingTime(prev => {
        if (prev <= 1) {
          handleSessionComplete();
          return 0;
        }
        return prev - 1;
      });
      setSessionDuration(prev => prev + 1);
    }, 1000);

    // Start water notification timer (every 30 minutes)
    waterIntervalRef.current = setInterval(() => {
      if (window.electronAPI?.notify) {
        window.electronAPI.notify(
          'Stay Hydrated! 💧',
          'Time to drink some water'
        );
      }
    }, 30 * 60 * 1000); // 30 minutes
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

    if (waterIntervalRef.current) {
      clearInterval(waterIntervalRef.current);
      waterIntervalRef.current = null;
    }

    setAwayStartTime(null);
    setAwayNotificationShown(false);

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

    // Away notification tracking
    if (newState === 'away') {
      if (!awayStartTime) {
        setAwayStartTime(Date.now());
      } else {
        const awaySeconds = (Date.now() - awayStartTime) / 1000;

        // Show notification after 10 seconds, only once per away period
        if (awaySeconds >= 10 && !awayNotificationShown) {
          if (window.electronAPI?.notify) {
            window.electronAPI.notify(
              'Come Back! 👀',
              "You've been away for a while. Stay focused!"
            );
          }
          setAwayNotificationShown(true);
        }
      }
    } else {
      // Reset when user returns
      setAwayStartTime(null);
      setAwayNotificationShown(false);
    }

    // Update refs for next iteration
    currentStateRef.current = newState;
    lastUpdateTimeRef.current = now;
  };

  // Calculate focus score as percentage
  const focusScore = sessionDuration > 0
    ? (focusedTime / sessionDuration) * 100
    : 0;

  // Cleanup intervals on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (waterIntervalRef.current) {
        clearInterval(waterIntervalRef.current);
      }
    };
  }, []);

  return {
    sessionActive,
    sessionDuration,
    sessionType,
    targetDuration,
    remainingTime,
    focusedTime,
    distractedTime,
    awayTime,
    focusScore,
    startSession,
    stopSession,
    updateFocusState
  };
}
