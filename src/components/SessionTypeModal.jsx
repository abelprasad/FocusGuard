import { useState } from 'react';
import { SESSION_TYPES } from '../constants/sessionTypes';

export default function SessionTypeModal({ onSelect, onCancel }) {
  const [customDuration, setCustomDuration] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [error, setError] = useState('');

  const handlePresetSelect = (sessionType) => {
    const config = {
      type: SESSION_TYPES[sessionType].id,
      duration: SESSION_TYPES[sessionType].duration,
      name: SESSION_TYPES[sessionType].name
    };
    onSelect(config);
  };

  const handleCustomSelect = () => {
    setShowCustomInput(true);
  };

  const handleCustomSubmit = () => {
    const minutes = parseInt(customDuration, 10);

    // Validation
    if (isNaN(minutes) || minutes < 1) {
      setError('Please enter a valid duration (minimum 1 minute)');
      return;
    }
    if (minutes > 180) {
      setError('Maximum duration is 180 minutes (3 hours)');
      return;
    }

    const config = {
      type: 'custom',
      duration: minutes * 60, // Convert to seconds
      name: `${minutes} Minute Session`
    };
    onSelect(config);
  };

  const handleCustomInputChange = (e) => {
    setCustomDuration(e.target.value);
    setError('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="relative bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 max-w-2xl w-full border border-gray-700/50 shadow-2xl">
        {/* Title */}
        <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-emerald-300 to-cyan-300 bg-clip-text text-transparent">
          Choose Your Session
        </h2>
        <p className="text-gray-400 mb-8">Select a preset or create a custom duration</p>

        {/* Session Type Grid */}
        {!showCustomInput ? (
          <div className="grid grid-cols-2 gap-4 mb-6">
            {/* Pomodoro */}
            <button
              onClick={() => handlePresetSelect('pomodoro')}
              className="group relative backdrop-blur-xl bg-gray-900/40 rounded-2xl p-6 border border-gray-700/50 hover:border-emerald-500/50 transition-all duration-300 text-left"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="text-4xl mb-3">{SESSION_TYPES.pomodoro.icon}</div>
                <div className="text-xl font-semibold text-white mb-1">{SESSION_TYPES.pomodoro.name}</div>
                <div className="text-sm text-gray-400">{SESSION_TYPES.pomodoro.description}</div>
                <div className="mt-3 text-emerald-400 font-mono font-semibold">{SESSION_TYPES.pomodoro.duration / 60} minutes</div>
              </div>
            </button>

            {/* Deep Work */}
            <button
              onClick={() => handlePresetSelect('deepWork')}
              className="group relative backdrop-blur-xl bg-gray-900/40 rounded-2xl p-6 border border-gray-700/50 hover:border-violet-500/50 transition-all duration-300 text-left"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="text-4xl mb-3">{SESSION_TYPES.deepWork.icon}</div>
                <div className="text-xl font-semibold text-white mb-1">{SESSION_TYPES.deepWork.name}</div>
                <div className="text-sm text-gray-400">{SESSION_TYPES.deepWork.description}</div>
                <div className="mt-3 text-violet-400 font-mono font-semibold">{SESSION_TYPES.deepWork.duration / 60} minutes</div>
              </div>
            </button>

            {/* Short Sprint */}
            <button
              onClick={() => handlePresetSelect('shortSprint')}
              className="group relative backdrop-blur-xl bg-gray-900/40 rounded-2xl p-6 border border-gray-700/50 hover:border-yellow-500/50 transition-all duration-300 text-left"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="text-4xl mb-3">{SESSION_TYPES.shortSprint.icon}</div>
                <div className="text-xl font-semibold text-white mb-1">{SESSION_TYPES.shortSprint.name}</div>
                <div className="text-sm text-gray-400">{SESSION_TYPES.shortSprint.description}</div>
                <div className="mt-3 text-yellow-400 font-mono font-semibold">{SESSION_TYPES.shortSprint.duration / 60} minutes</div>
              </div>
            </button>

            {/* Custom */}
            <button
              onClick={handleCustomSelect}
              className="group relative backdrop-blur-xl bg-gray-900/40 rounded-2xl p-6 border border-gray-700/50 hover:border-blue-500/50 transition-all duration-300 text-left"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="text-4xl mb-3">{SESSION_TYPES.custom.icon}</div>
                <div className="text-xl font-semibold text-white mb-1">{SESSION_TYPES.custom.name}</div>
                <div className="text-sm text-gray-400">{SESSION_TYPES.custom.description}</div>
                <div className="mt-3 text-blue-400 font-mono font-semibold">1-180 minutes</div>
              </div>
            </button>
          </div>
        ) : (
          /* Custom Duration Input */
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-400 mb-3">
              Enter session duration (minutes)
            </label>
            <input
              type="number"
              min="1"
              max="180"
              value={customDuration}
              onChange={handleCustomInputChange}
              placeholder="e.g., 30"
              className="w-full bg-gray-800/60 border border-gray-700/50 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-colors"
              autoFocus
            />
            {error && (
              <div className="mt-2 text-sm text-red-400">{error}</div>
            )}
            <div className="mt-4 flex gap-3">
              <button
                onClick={handleCustomSubmit}
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-300"
              >
                Start Custom Session
              </button>
              <button
                onClick={() => {
                  setShowCustomInput(false);
                  setCustomDuration('');
                  setError('');
                }}
                className="px-6 py-3 rounded-xl font-semibold text-gray-400 hover:text-white border border-gray-700/50 hover:border-gray-600 transition-colors"
              >
                Back
              </button>
            </div>
          </div>
        )}

        {/* Cancel Button */}
        {!showCustomInput && (
          <button
            onClick={onCancel}
            className="w-full mt-4 py-3 px-6 rounded-xl font-semibold text-gray-400 hover:text-white border border-gray-700/50 hover:border-gray-600 transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}
