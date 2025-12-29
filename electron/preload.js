const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// IPC safely without exposing the entire IPC API
contextBridge.exposeInMainWorld('electronAPI', {
  // Platform information
  platform: process.platform,

  // Electron and Node versions
  versions: {
    node: process.versions.node,
    chrome: process.versions.chrome,
    electron: process.versions.electron
  }

  // Future IPC methods will go here, for example:
  // startSession: (data) => ipcRenderer.invoke('session:start', data),
  // stopSession: () => ipcRenderer.invoke('session:stop'),
  // saveToDatabase: (data) => ipcRenderer.invoke('db:save', data),
  // notify: (title, body) => ipcRenderer.invoke('notify', { title, body })
});
