import { useState } from 'react'
import CameraFeed from './components/CameraFeed'

function App() {
  const [sessionActive, setSessionActive] = useState(false)

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
              <CameraFeed />
            </div>
          </div>

          {/* Right: Controls and Stats */}
          <div className="space-y-6">
            {/* Session Control */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Session Control</h3>
              <button
                onClick={() => setSessionActive(!sessionActive)}
                className={`w-full py-3 rounded-lg font-medium transition-colors ${
                  sessionActive
                    ? 'bg-focus-red hover:bg-red-600'
                    : 'bg-focus-green hover:bg-green-600'
                }`}
              >
                {sessionActive ? 'Stop Session' : 'Start Session'}
              </button>
              {sessionActive && (
                <div className="mt-3 text-sm text-center">
                  <div className="flex items-center justify-center text-focus-green">
                    <div className="h-2 w-2 bg-focus-green rounded-full mr-2 animate-pulse"></div>
                    <span>Session in progress</span>
                  </div>
                </div>
              )}
            </div>

            {/* Today's Stats */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Today's Stats</h3>
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-400 mb-1">Focus Time</div>
                  <div className="text-3xl font-bold text-focus-green">0m</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400 mb-1">Breaks Taken</div>
                  <div className="text-3xl font-bold">0</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400 mb-1">Focus Score</div>
                  <div className="text-3xl font-bold text-focus-blue">--%</div>
                </div>
              </div>
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
