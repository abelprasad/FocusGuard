# FocusGuard 🎯

**AI-Powered Productivity Monitor for Desktop**

FocusGuard is a cross-platform desktop application that uses computer vision and machine learning to help you stay focused and maintain healthy work habits. It runs locally on your computer, analyzes your behavior in real-time, and provides intelligent feedback to boost your productivity.

---

## 🌟 Overview

FocusGuard monitors your work sessions using your webcam to detect:

- **Presence**: Are you at your desk or away?
- **Posture**: Are you slouching or sitting properly?
- **Distractions**: Are you looking at your phone or getting distracted?
- **Focus Patterns**: When are you most productive?

All processing happens **locally on your machine** - no data is sent to the cloud, ensuring complete privacy.

---

## ✨ Key Features

### 📊 Real-Time Monitoring

- Face detection to track presence at desk
- Posture analysis using pose estimation
- Distraction detection (phone usage, looking away)
- Multi-person detection for interruptions

### 🔔 Smart Notifications

- **Break Reminders**: Alerts when you've been working too long
- **Posture Alerts**: Notifications when slouching is detected
- **Distraction Warnings**: Gentle reminders when focus is lost
- Customizable notification frequency and timing

### 📈 Analytics Dashboard

- **Focus Score**: Percentage of time spent focused vs. distracted
- **Posture Health**: Track slouching patterns over time
- **Session History**: View all work sessions with detailed metrics
- **Heatmaps**: Visualize your most productive hours
- **Trends**: Weekly and monthly productivity patterns

### 🔒 Privacy-First Design

- All computer vision processing happens locally
- No images or video stored (only metadata)
- Optional blur mode for extra privacy
- Clear privacy indicators when camera is active
- Complete control over data collection

### ⚙️ Customization

- Define custom work/break schedules (e.g., Pomodoro)
- Set focus sensitivity levels
- Choose which features to enable/disable
- Custom notification sounds and styles
- Task/project categorization

---

## 🛠️ Technical Architecture

### Technology Stack

**Frontend:**

- **Electron** - Cross-platform desktop framework
- **React** - UI component library
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first styling
- **Recharts/Chart.js** - Data visualization

**Computer Vision:**

- **MediaPipe** - Face detection and pose estimation
- **TensorFlow.js** - Object detection (phones, distractions)
- **OpenCV** - Image processing (optional Python backend)

**Backend/Processing:**

- **Python (Optional)** - Heavy CV processing via FastAPI
- **Node.js** - Electron main process
- **SQLite** - Local database for session tracking

**Deployment:**

- **Electron Builder** - Package for Windows, Mac, Linux

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────┐
│           Electron Main Process                  │
│  - Window Management                             │
│  - System Tray Integration                       │
│  - Native Notifications                          │
│  - IPC Coordination                              │
└────────────┬────────────────────────────────────┘
             │
             ├─────────────────────────────────────┐
             │                                     │
    ┌────────▼────────┐              ┌────────────▼──────────┐
    │  Renderer        │              │  CV Processing        │
    │  (React UI)      │◄────IPC─────►│  - Face Detection     │
    │  - Dashboard     │              │  - Pose Estimation    │
    │  - Settings      │              │  - Object Detection   │
    │  - Analytics     │              │  - Feature Extraction │
    └─────────────────┘              └────────────┬──────────┘
                                                   │
                                      ┌────────────▼──────────┐
                                      │  SQLite Database      │
                                      │  - Sessions           │
                                      │  - Focus Events       │
                                      │  - Posture Data       │
                                      │  - Analytics          │
                                      └───────────────────────┘
```

---

## 🧠 Computer Vision Pipeline

### 1. **Face Detection** (MediaPipe Face Detection)

- Detects if user is present at desk
- Calculates bounding box and confidence score
- Determines if user is looking at screen

### 2. **Pose Estimation** (MediaPipe Pose)

- Tracks 33 body landmarks
- Calculates shoulder/neck angles to detect slouching
- Monitors head position and tilt

### 3. **Object Detection** (YOLO/TensorFlow.js)

- Detects phones in camera frame
- Identifies multiple people (interruptions)
- Recognizes other distractions

### 4. **Focus Classification** (Custom ML Model)

- Combines all CV features into "focus score"
- Learns user's personal focus patterns
- Adapts to individual working styles

---

## 📊 Data Model

### Sessions Table

```sql
CREATE TABLE sessions (
  id INTEGER PRIMARY KEY,
  start_time DATETIME,
  end_time DATETIME,
  task_name TEXT,
  focus_score REAL,
  total_breaks INTEGER,
  posture_alerts INTEGER
);
```

### Focus Events Table

```sql
CREATE TABLE focus_events (
  id INTEGER PRIMARY KEY,
  session_id INTEGER,
  timestamp DATETIME,
  event_type TEXT, -- 'focused', 'distracted', 'away', 'phone'
  confidence REAL,
  FOREIGN KEY (session_id) REFERENCES sessions(id)
);
```

### Posture Data Table

```sql
CREATE TABLE posture_data (
  id INTEGER PRIMARY KEY,
  session_id INTEGER,
  timestamp DATETIME,
  shoulder_angle REAL,
  neck_angle REAL,
  is_slouching BOOLEAN,
  FOREIGN KEY (session_id) REFERENCES sessions(id)
);
```

---

## 🎯 Core Features Breakdown

### Focus Detection Algorithm

```javascript
function calculateFocusScore(cvData) {
  const weights = {
    faceDetected: 0.3, // Present at desk
    lookingAtScreen: 0.3, // Eye gaze toward screen
    noPhone: 0.2, // Phone not in frame
    goodPosture: 0.1, // Proper sitting posture
    noInterruptions: 0.1, // Only one person detected
  };

  let score = 0;
  score += cvData.faceDetected ? weights.faceDetected : 0;
  score += cvData.gazeScore * weights.lookingAtScreen;
  score += cvData.phoneDetected ? 0 : weights.noPhone;
  score += cvData.postureGood ? weights.goodPosture : 0;
  score += cvData.peopleCount === 1 ? weights.noInterruptions : 0;

  return score * 100; // 0-100%
}
```

### Posture Analysis

```javascript
function analyzePosture(poseKeypoints) {
  // Calculate shoulder angle
  const leftShoulder = poseKeypoints[11];
  const rightShoulder = poseKeypoints[12];
  const shoulderAngle = calculateAngle(leftShoulder, rightShoulder);

  // Calculate neck angle
  const nose = poseKeypoints[0];
  const neck = poseKeypoints[13];
  const neckAngle = calculateAngle(nose, neck);

  // Determine if slouching
  const isSlouching = shoulderAngle > 15 || neckAngle < 70;

  return { shoulderAngle, neckAngle, isSlouching };
}
```

---

## 🚀 Development Roadmap

### Phase 1: MVP (Weeks 1-4) ✅ COMPLETE

- [x] Electron + React setup
- [x] Camera access and display
- [x] Basic face detection (MediaPipe)
- [x] Simple notifications (away alerts, session complete, hydration)
- [x] Session start/stop functionality
- [x] Session types (Pomodoro, Deep Work, Short Sprint, Custom)
- [x] Real-time focus score calculation
- [x] Modern glass morphism UI with gradients
- [x] Countdown timer with progress bars
- [x] Visual detection overlay (bounding boxes, landmarks)

### Phase 2: Core Features (Weeks 5-8) 🚧 IN PROGRESS

- [ ] Posture detection implementation (MediaPipe Pose)
- [ ] Distraction detection (phone, multiple people)
- [ ] SQLite database integration for session history
- [ ] Basic analytics dashboard with charts
- [ ] Settings panel (camera, notifications, privacy)
- [ ] Export session data (CSV/JSON)

### Phase 3: Intelligence (Weeks 9-10)

- [ ] Focus score calculation
- [ ] Pattern recognition
- [ ] Personalized recommendations
- [ ] Advanced analytics and visualizations

### Phase 4: Polish (Weeks 11-12)

- [ ] UI/UX improvements
- [ ] Performance optimization
- [ ] System tray integration
- [ ] Auto-launch on startup
- [ ] Cross-platform testing and packaging

### Phase 5: Advanced Features (Future)

- [ ] Machine learning for personalized focus detection
- [ ] Calendar integration
- [ ] Task manager integration
- [ ] Team/accountability features
- [ ] Export reports (PDF, CSV)

---

## 🎨 User Interface Design

### Main Dashboard

- Live camera feed (optional blur)
- Current focus score (real-time)
- Session timer
- Quick stats (today's focus time, breaks taken)
- Start/Stop session button

### Analytics View

- Line charts: Focus over time
- Heatmap: Productivity by hour/day
- Posture health gauge
- Distraction breakdown (pie chart)
- Session history table

### Settings Panel

- Camera settings (resolution, blur)
- Notification preferences
- Break schedule (Pomodoro, custom)
- Privacy controls
- Data export/delete

---

## 🔐 Privacy & Security

### Data Storage

- All data stored locally in SQLite
- No cloud sync (user controls data)
- Optional automatic cleanup of old data

### Camera Privacy

- Visual indicator when camera is active
- Optional blur/pixelate mode
- One-click disable camera
- No images stored, only numerical features

### User Control

- Export all data anytime
- Delete specific sessions or all data
- Disable any tracking feature
- Open-source code for transparency

---

## 📦 Installation & Distribution

### Development

```bash
npm install
npm run electron:dev
```

### Production Build

```bash
npm run electron:build
```

### Distribution

- **macOS**: `.dmg` installer
- **Windows**: `.exe` NSIS installer
- **Linux**: `.AppImage` package

---

## 🎓 Skills Demonstrated

This project showcases:

✅ **Desktop Application Development** - Electron expertise  
✅ **Computer Vision** - Real-time video processing  
✅ **Machine Learning** - Pose estimation, object detection  
✅ **Frontend Development** - React, data visualization  
✅ **Backend Development** - IPC, database design  
✅ **Privacy Engineering** - Local-first architecture  
✅ **Performance Optimization** - Real-time processing  
✅ **Cross-Platform Development** - Windows, Mac, Linux  
✅ **Product Design** - Solving real user problems

---

## 🤔 Challenges & Solutions

### Challenge 1: Real-Time Performance

**Problem**: Processing 30 FPS video is CPU intensive  
**Solution**:

- Reduce processing to 10-15 FPS
- Use TensorFlow.js Web Workers for parallel processing
- Implement frame skipping when CPU usage is high

### Challenge 2: Accuracy vs. Privacy

**Problem**: Better accuracy requires storing more data  
**Solution**:

- Extract only numerical features, not images
- Aggregate data over time intervals
- Give users granular privacy controls

### Challenge 3: False Positives

**Problem**: Incorrectly flagging focus/distractions  
**Solution**:

- Machine learning to learn user's unique patterns
- Adjustable sensitivity settings
- Grace periods before triggering alerts

---

## 🌐 Potential Extensions

### Future Ideas

- **Mobile companion app** - View stats on phone
- **Browser extension** - Track website usage
- **Slack/Teams integration** - Set status based on focus
- **Gamification** - Achievements, streaks, challenges
- **Team dashboards** - Aggregate anonymous stats (opt-in)
- **Voice detection** - Track meetings/calls
- **Standing desk integration** - Remind to stand
- **Eye strain detection** - 20-20-20 rule reminders

---

## 📚 Learning Resources

### Electron

- [Electron Documentation](https://www.electronjs.org/docs)
- [Electron + React Tutorial](https://www.electronjs.org/docs/latest/tutorial/tutorial-prerequisites)

### Computer Vision

- [MediaPipe Documentation](https://developers.google.com/mediapipe)
- [TensorFlow.js Object Detection](https://www.tensorflow.org/js/models)
- [OpenCV Python Tutorials](https://docs.opencv.org/4.x/d6/d00/tutorial_py_root.html)

### Machine Learning

- [Pose Estimation Guide](https://developers.google.com/mediapipe/solutions/vision/pose_landmarker)
- [Real-time ML in JavaScript](https://www.tensorflow.org/js)

---

## 🎯 Success Metrics

### For Internship Applications

- **Technical Complexity**: ⭐⭐⭐⭐⭐ (CV + ML + Desktop)
- **Real-World Impact**: ⭐⭐⭐⭐⭐ (Solves actual problem)
- **Demo-ability**: ⭐⭐⭐⭐⭐ (Live camera demo)
- **Portfolio Standout**: ⭐⭐⭐⭐⭐ (Unique, impressive)

### User Success

- Increase focus time by 25%+
- Reduce posture-related discomfort
- Better work-life balance
- Data-driven productivity insights

---

## 📄 License

MIT License - Open source and free to use

---

## 👤 Author

**Abel** - Computer Science Student at Penn State University Abington  
Building innovative productivity tools with AI and computer vision.

---

**Built with ❤️ for better focus and healthier work habits**
