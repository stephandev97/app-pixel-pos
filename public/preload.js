const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    send: (channel, data) => ipcRenderer.send(channel, data),
    invoke: (channel, data) => ipcRenderer.invoke(channel, data),
    on: (channel, listener) =>
      ipcRenderer.on(channel, (_event, ...args) => listener(_event, ...args)),
    removeListener: (channel, listener) => ipcRenderer.removeListener(channel, listener),
  },
  process: {
    platform: typeof process !== 'undefined' ? process.platform : 'browser',
  },
});
