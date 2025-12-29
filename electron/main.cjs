const { app, BrowserWindow, session } = require('electron');
const path = require('path');

// Determine if we're in development or production
const isDev = process.env.NODE_ENV === 'development';

let mainWindow;

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      // SECURITY: These settings are crucial for security
      contextIsolation: true,      // Isolates renderer from Node.js
      nodeIntegration: false,       // Prevents Node.js in renderer
      sandbox: true,                // Enables Chromium sandbox
      preload: path.join(__dirname, 'preload.cjs')  // Secure IPC bridge
    }
  });

  // CAMERA PERMISSIONS: Grant media access automatically
  session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
    // Allow camera/microphone, deny everything else
    if (permission === 'media') {
      callback(true);  // Grant permission
    } else {
      callback(false); // Deny permission
    }
  });

  // Load the app (different for dev vs production)
  if (isDev) {
    // Development: Load from Vite dev server
    mainWindow.loadURL('http://localhost:5173');
    // Open DevTools automatically in development
    mainWindow.webContents.openDevTools();
  } else {
    // Production: Load built files
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

// App lifecycle events
app.whenReady().then(() => {
  createWindow();

  // macOS: Re-create window when dock icon clicked (if no windows open)
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed (except on macOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
