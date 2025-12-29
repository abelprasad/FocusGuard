export const SESSION_TYPES = {
  pomodoro: {
    id: 'pomodoro',
    name: 'Pomodoro',
    duration: 25 * 60, // 25 minutes in seconds
    icon: '🍅',
    description: '25 minutes of focused work'
  },
  deepWork: {
    id: 'deepWork',
    name: 'Deep Work',
    duration: 90 * 60, // 90 minutes in seconds
    icon: '🧠',
    description: '90 minutes of deep concentration'
  },
  shortSprint: {
    id: 'shortSprint',
    name: 'Short Sprint',
    duration: 15 * 60, // 15 minutes in seconds
    icon: '⚡',
    description: '15 minutes quick focus session'
  },
  custom: {
    id: 'custom',
    name: 'Custom',
    duration: null, // User-defined
    icon: '⚙️',
    description: 'Set your own duration'
  }
};
