const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    send: (channel, ...args) => ipcRenderer.send(channel, ...args),
    invoke: (channel, ...args) => ipcRenderer.invoke(channel, ...args),
    on: (channel, listener) =>
      ipcRenderer.on(channel, (_event, ...args) => listener(_event, ...args)),
    removeListener: (channel, listener) => ipcRenderer.removeListener(channel, listener),
  },
  process: {
    platform: typeof process !== 'undefined' ? process.platform : 'browser',
  },
  posTerminal: {
    saveCredentials: (credentials) => ipcRenderer.invoke('save-pos-terminal-credentials', credentials),
    authenticate: (pbUrl) => ipcRenderer.invoke('authenticate-pos-terminal', { pbUrl }),
  },
});
