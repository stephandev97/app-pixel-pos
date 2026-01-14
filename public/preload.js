const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
    ipcRenderer: {
        invoke: (channel, data) => ipcRenderer.invoke(channel, data),
        on: (channel, func) => ipcRenderer.on(channel, (_event, ...args) => func(_event, ...args)),
        removeListener: (channel, func) => ipcRenderer.removeListener(channel, func),
    },
    process: {
        platform: process.platform
    }
});