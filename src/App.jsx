import { useCallback } from 'react'
import CameraFeed from './components/CameraFeed'
import useSessionTracking from './hooks/useSessionTracking'
import { formatDuration, formatSessionTime } from './utils/timeUtils'

function App() {
  const sessionTracking = useSessionTracking()

  // Handle detection updates from CameraFeed
  // Using useCallback to ensure we always have the latest sessionActive value
  const handleDetectionUpdate = useCallback((detectionResults) => {
    if (sessionTracking.sessionActive) {
      sessionTracking.updateFocusState(detectionResults)
    }
  }, [sessionTracking.sessionActive, sessionTracking.updateFocusState])

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-focus-blue">
            FocusGuard 🎯
          </h1>
          <div className="text-sm text-gray-400">
            AI-Powered Productivity Monitor
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Camera Feed */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Live Feed</h2>
              <CameraFeed onDetectionUpdate={handleDetectionUpdate} />
            </div>
          </div>

          {/* Right: Controls and Stats */}
          <div className="space-y-6">
            {/* Session Control */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Session Control</h3>

              {/* Session Timer */}
              {sessionTracking.sessionActive && (
                <div className="text-center p-4 bg-gray-900 rounded-lg mb-4">
                  <div className="text-sm text-gray-400 mb-1">Session Time</div>
                  <div className="text-3xl font-bold text-focus-blue tabular-nums">
                    {formatSessionTime(sessionTracking.sessionDuration)}
                  </div>
                </div>
              )}

              {/* Start/Stop Button */}
              <button
                onClick={sessionTracking.sessionActive ? sessionTracking.stopSession : sessionTracking.startSession}
                className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                  sessionTracking.sessionActive
                    ? 'bg-focus-red hover:bg-red-600'
                    : 'bg-focus-green hover:bg-green-600'
                }`}
              >
                {sessionTracking.sessionActive ? 'End Session' : 'Start Session'}
              </button>

              {sessionTracking.sessionActive && (
                <div className="mt-3 text-sm text-center">
                  <div className="flex items-center justify-center text-focus-green">
                    <div className="h-2 w-2 bg-focus-green rounded-full mr-2 animate-pulse"></div>
                    <span>Session in progress</span>
                  </div>
                </div>
              )}
            </div>

            {/* Session Stats */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Session Stats</h3>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="bg-gray-900 rounded-lg p-3 text-center">
                  <div className="text-xs text-gray-400 mb-1">Focused</div>
                  <div className="text-lg font-semibold text-focus-green">
                    {formatDuration(sessionTracking.focusedTime)}
                  </div>
                </div>
                <div className="bg-gray-900 rounded-lg p-3 text-center">
                  <div className="text-xs text-gray-400 mb-1">Away</div>
                  <div className="text-lg font-semibold text-gray-400">
                    {formatDuration(sessionTracking.awayTime)}
                  </div>
                </div>
                <div className="bg-gray-900 rounded-lg p-3 text-center">
                  <div className="text-xs text-gray-400 mb-1">Score</div>
                  <div className="text-lg font-semibold text-focus-blue">
                    {Math.round(sessionTracking.focusScore)}%
                  </div>
                </div>
              </div>

              {/* Time Breakdown Bar */}
              {sessionTracking.sessionActive && sessionTracking.sessionDuration > 0 && (
                <div>
                  <div className="text-xs text-gray-400 mb-2">Time Breakdown</div>
                  <div className="h-3 bg-gray-700 rounded-full overflow-hidden flex">
                    <div
                      className="bg-focus-green transition-all duration-300"
                      style={{ width: `${(sessionTracking.focusedTime / sessionTracking.sessionDuration) * 100}%` }}
                      title={`Focused: ${formatDuration(sessionTracking.focusedTime)}`}
                    />
                    <div
                      className="bg-focus-red transition-all duration-300"
                      style={{ width: `${(sessionTracking.distractedTime / sessionTracking.sessionDuration) * 100}%` }}
                      title={`Distracted: ${formatDuration(sessionTracking.distractedTime)}`}
                    />
                    <div
                      className="bg-gray-500 transition-all duration-300"
                      style={{ width: `${(sessionTracking.awayTime / sessionTracking.sessionDuration) * 100}%` }}
                      title={`Away: ${formatDuration(sessionTracking.awayTime)}`}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-400 mt-2">
                    <span className="flex items-center">
                      <span className="inline-block w-2 h-2 bg-focus-green rounded-full mr-1"></span>
                      Focused
                    </span>
                    <span className="flex items-center">
                      <span className="inline-block w-2 h-2 bg-focus-red rounded-full mr-1"></span>
                      Distracted
                    </span>
                    <span className="flex items-center">
                      <span className="inline-block w-2 h-2 bg-gray-500 rounded-full mr-1"></span>
                      Away
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Info */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Tips</h3>
              <ul className="text-sm text-gray-400 space-y-2">
                <li className="flex items-start">
                  <span className="text-focus-green mr-2">•</span>
                  <span>Start camera to begin monitoring</span>
                </li>
                <li className="flex items-start">
                  <span className="text-focus-blue mr-2">•</span>
                  <span>Good posture keeps you focused</span>
                </li>
                <li className="flex items-start">
                  <span className="text-focus-red mr-2">•</span>
                  <span>Take breaks every 50 minutes</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
