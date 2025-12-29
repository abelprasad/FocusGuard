/**
 * Time formatting utilities for FocusGuard session tracking
 */

/**
 * Format seconds to human-readable duration
 * Examples: "5h 23m", "45m 12s", "23s"
 * @param {number} totalSeconds - Total seconds to format
 * @returns {string} Formatted duration string
 */
export function formatDuration(totalSeconds) {
  if (totalSeconds === 0) return '0s';

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);

  const parts = [];

  if (hours > 0) {
    parts.push(`${hours}h`);
    parts.push(`${minutes}m`);
  } else if (minutes > 0) {
    parts.push(`${minutes}m`);
    parts.push(`${seconds}s`);
  } else {
    parts.push(`${seconds}s`);
  }

  return parts.join(' ');
}

/**
 * Format seconds to session time format (HH:MM:SS)
 * @param {number} totalSeconds - Total seconds to format
 * @returns {string} Formatted time string (HH:MM:SS)
 */
export function formatSessionTime(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);

  return [
    hours.toString().padStart(2, '0'),
    minutes.toString().padStart(2, '0'),
    seconds.toString().padStart(2, '0')
  ].join(':');
}

/**
 * Calculate elapsed seconds from a start timestamp
 * @param {number} startTime - Start timestamp (from Date.now())
 * @returns {number} Elapsed seconds
 */
export function getElapsedSeconds(startTime) {
  if (!startTime) return 0;
  return Math.floor((Date.now() - startTime) / 1000);
}
