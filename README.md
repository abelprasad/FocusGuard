# FocusGuard

**AI-Powered Productivity Monitor for Desktop**

FocusGuard is a cross-platform desktop application that uses computer vision (MediaPipe) to help you stay focused and maintain healthy work habits. It runs locally on your computer, analyzes your behavior in real-time using face detection, and provides intelligent feedback to boost your productivity.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey)
![Status](https://img.shields.io/badge/status-Alpha-orange)

---

## Features

### Currently Implemented (Phase 1 Complete!)

- **Real-Time Face Detection** - MediaPipe-powered face detection tracks your presence at your desk
- **Session Tracking** - Start/stop work sessions with real-time metrics
- **Focus Score** - Live calculation of focused vs. distracted vs. away time
- **Session Types** - Choose from Pomodoro (25min), Deep Work (90min), Short Sprint (15min), or custom durations
- **Smart Notifications** - Get notified when you've been away for 10+ seconds, session complete alerts, and hydration reminders
- **Modern Glass Morphism UI** - Beautiful gradient accents with backdrop blur effects
- **Privacy-First** - All processing happens locally, no data leaves your machine
- **Visual Feedback** - Live bounding boxes and confidence scores overlaid on camera feed

### Coming Soon (Phase 2+)

- Posture detection and slouching alerts
- Distraction detection (phone usage, multiple people)
- SQLite database for session history
- Analytics dashboard with charts and trends
- Break reminders and Pomodoro timer integration
- Settings panel for customization

---

## Technology Stack

**Frontend:**
- Electron (v39) - Cross-platform desktop framework
- React (v19) - UI components
- Vite (v7) - Lightning-fast build tool
- Tailwind CSS (v4) - Modern utility-first styling

**Computer Vision:**
- MediaPipe Tasks Vision - Face detection with landmarks
- Real-time video processing at 30 FPS

**Backend:**
- Node.js - Electron main process
- better-sqlite3 - Local database (planned)

---

## Installation

### Prerequisites

- Node.js 18+
- npm or yarn
- Webcam (required for face detection)

### Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/FocusGuard.git
cd FocusGuard
```

2. Install dependencies:
```bash
npm install
```

3. Run in development mode:
```bash
npm run electron:dev
```

This will:
- Start Vite dev server on http://localhost:5173
- Launch Electron window with hot reload
- Enable camera access for face detection

### Building for Production

```bash
npm run electron:build
```

This creates installers in the `release/` directory:
- **Windows**: `.exe` NSIS installer
- **macOS**: `.dmg` disk image
- **Linux**: `.AppImage` package

---

## Usage

1. **Start the App** - Launch FocusGuard via the desktop icon or `npm run electron:dev`

2. **Enable Camera** - Click "Enable Camera" to start face detection

3. **Start Session** - Click "Start Session" and choose a session type:
   - **Pomodoro** (25 minutes) - Classic focused work interval
   - **Deep Work** (90 minutes) - Extended deep focus session
   - **Short Sprint** (15 minutes) - Quick focused burst
   - **Custom** - Set your own duration

4. **Stay Focused** - The app tracks your presence and calculates:
   - **Focused Time** - When face is detected with high confidence (>60%)
   - **Distracted Time** - When face is detected with low confidence (<60%)
   - **Away Time** - When no face is detected
   - **Focus Score** - Percentage of time spent focused

5. **End Session** - Click "End Session" when done, or let the timer complete

---

## Privacy & Security

- All computer vision processing happens **locally on your device**
- No images or video are ever stored - only numerical metrics (time, confidence scores)
- No data is sent to any server or cloud service
- Camera can be disabled at any time with one click
- Open-source code for complete transparency

---

## Project Structure

```
FocusGuard/
├── electron/              # Electron main process
│   ├── main.js           # Main process entry point
│   └── preload.cjs       # IPC bridge between main and renderer
├── src/                  # React frontend
│   ├── components/       # React components
│   │   ├── CameraFeed.jsx          # Camera & face detection
│   │   └── SessionTypeModal.jsx    # Session type selector
│   ├── hooks/            # Custom React hooks
│   │   └── useSessionTracking.js   # Session state management
│   ├── utils/            # Utility functions
│   │   ├── faceDetector.js         # MediaPipe wrapper
│   │   └── timeUtils.js            # Time formatting
│   ├── constants/        # App constants
│   │   └── sessionTypes.js         # Session type definitions
│   ├── App.jsx           # Main app component
│   └── main.jsx          # React entry point
├── public/               # Static assets
├── package.json          # Dependencies and scripts
└── README.md            # This file
```

---

## Development

### Available Scripts

- `npm run dev` - Start Vite dev server only
- `npm run electron:dev` - Start full Electron app with hot reload
- `npm run build` - Build React app for production
- `npm run electron:build` - Build and package desktop app
- `npm run lint` - Run ESLint

### Architecture

FocusGuard uses a standard Electron architecture:

1. **Main Process** (`electron/main.js`) - Manages native app lifecycle, windows, and notifications
2. **Renderer Process** (`src/`) - React UI running in Chromium
3. **Preload Script** (`electron/preload.cjs`) - Secure IPC bridge using `contextBridge`

Face detection runs in the renderer process using MediaPipe's JavaScript library, processing video frames from `getUserMedia()` in real-time.

---

## Roadmap

See [CLAUDE.md](./CLAUDE.md) for detailed development roadmap.

**Phase 1 (Complete):**
- Electron + React setup
- Camera access and display
- MediaPipe face detection
- Session tracking with metrics
- Basic notifications

**Phase 2 (In Progress):**
- Posture detection
- Distraction detection
- SQLite database
- Analytics dashboard

**Phase 3 (Planned):**
- Advanced ML for focus patterns
- Customizable alerts
- Data export
- System tray integration

---

## Contributing

This is currently a personal portfolio project, but suggestions and feedback are welcome! Feel free to open an issue.

---

## License

MIT License - see [LICENSE](./LICENSE) for details

---

## Author

**Abel** - Computer Science Student at Penn State University Abington

Building innovative productivity tools with AI and computer vision.

---

## Acknowledgments

- [MediaPipe](https://developers.google.com/mediapipe) - Google's ML solutions for face detection
- [Electron](https://www.electronjs.org/) - Cross-platform desktop framework
- [React](https://react.dev/) - UI component library
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
