import { useState, useCallback } from 'react'
import CameraFeed from './components/CameraFeed'
import SessionTypeModal from './components/SessionTypeModal'
import useSessionTracking from './hooks/useSessionTracking'
import { formatDuration, formatSessionTime } from './utils/timeUtils'
import { SESSION_TYPES } from './constants/sessionTypes'

function App() {
  const sessionTracking = useSessionTracking()
  const [showSessionModal, setShowSessionModal] = useState(false)

  // Handle detection updates from CameraFeed
  // Using useCallback to ensure we always have the latest sessionActive value
  const handleDetectionUpdate = useCallback((detectionResults) => {
    if (sessionTracking.sessionActive) {
      sessionTracking.updateFocusState(detectionResults)
    }
  }, [sessionTracking.sessionActive, sessionTracking.updateFocusState])

  // Handle start/stop session
  const handleStartSession = () => {
    if (!sessionTracking.sessionActive) {
      setShowSessionModal(true)
    } else {
      sessionTracking.stopSession()
    }
  }

  // Handle session type selection
  const handleSessionTypeSelected = (sessionConfig) => {
    setShowSessionModal(false)
    sessionTracking.startSession(sessionConfig)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 text-white">
      {/* Main Content */}
      <main className="h-screen flex items-center justify-center p-8">
        <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Camera Feed */}
          <div className="lg:col-span-2">
            <div className="relative backdrop-blur-xl bg-gray-900/40 rounded-3xl p-6 border border-gray-700/50 shadow-2xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 pointer-events-none"></div>
              <CameraFeed onDetectionUpdate={handleDetectionUpdate} />
            </div>
          </div>

          {/* Right: Stats & Controls */}
          <div className="flex flex-col gap-6">
            {/* Session Timer Card */}
            {sessionTracking.sessionActive && (
              <div className="backdrop-blur-xl bg-gray-900/40 rounded-3xl p-8 border border-gray-700/50 shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 pointer-events-none"></div>
                <div className="relative">
                  {sessionTracking.sessionType && (
                    <div className="text-xs font-medium tracking-wider uppercase text-gray-400 mb-2">
                      {SESSION_TYPES[sessionTracking.sessionType]?.name || sessionTracking.sessionType} Session
                    </div>
                  )}
                  <div className="text-xs font-medium tracking-wider uppercase text-gray-400 mb-3">Time Remaining</div>
                  <div className="text-6xl font-bold tabular-nums bg-gradient-to-r from-emerald-300 to-cyan-300 bg-clip-text text-transparent">
                    {formatSessionTime(sessionTracking.remainingTime || 0)}
                  </div>
                  {sessionTracking.targetDuration > 0 && (
                    <div className="mt-4 h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all duration-500"
                        style={{
                          width: `${((sessionTracking.targetDuration - sessionTracking.remainingTime) / sessionTracking.targetDuration) * 100}%`
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Stats Card */}
            {sessionTracking.sessionActive && (
              <div className="backdrop-blur-xl bg-gray-900/40 rounded-3xl p-8 border border-gray-700/50 shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 pointer-events-none"></div>
                <div className="relative space-y-6">
                  <h3 className="text-xs font-medium tracking-wider uppercase text-gray-400 mb-4">Performance</h3>

                  {/* Metrics Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-800/60 rounded-2xl p-4 border border-gray-700/50">
                      <div className="text-xs text-gray-400 mb-2">Focused</div>
                      <div className="text-2xl font-bold text-emerald-400">{formatDuration(sessionTracking.focusedTime)}</div>
                    </div>
                    <div className="bg-gray-800/60 rounded-2xl p-4 border border-gray-700/50">
                      <div className="text-xs text-gray-400 mb-2">Score</div>
                      <div className="text-2xl font-bold bg-gradient-to-r from-violet-300 to-fuchsia-300 bg-clip-text text-transparent">
                        {Math.round(sessionTracking.focusScore)}%
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {sessionTracking.sessionDuration > 0 && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-gray-400">
                        <span>Focus Progress</span>
                        <span>{Math.round(sessionTracking.focusScore)}%</span>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full flex">
                          <div
                            className="bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all duration-500 ease-out"
                            style={{ width: `${(sessionTracking.focusedTime / sessionTracking.sessionDuration) * 100}%` }}
                          />
                          <div
                            className="bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-500 ease-out"
                            style={{ width: `${(sessionTracking.distractedTime / sessionTracking.sessionDuration) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Control Button */}
            <button
              onClick={handleStartSession}
              className={`w-full py-4 px-6 rounded-2xl font-semibold text-sm tracking-wide uppercase transition-all duration-300 shadow-xl ${
                sessionTracking.sessionActive
                  ? 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 hover:shadow-red-500/50 text-white'
                  : 'bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 hover:shadow-emerald-500/50 text-white'
              }`}
            >
              {sessionTracking.sessionActive ? 'End Session' : 'Start Session'}
            </button>
          </div>
        </div>
      </main>

      {/* Session Type Modal */}
      {showSessionModal && (
        <SessionTypeModal
          onSelect={handleSessionTypeSelected}
          onCancel={() => setShowSessionModal(false)}
        />
      )}
    </div>
  )
}

export default App
