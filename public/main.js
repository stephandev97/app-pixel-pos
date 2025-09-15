const { app, BrowserWindow } = require('electron');

const path = require('path')
const isDev = process.env.NODE_ENV === "development";

require('@electron/remote/main').initialize()

const {default: installExtension, REDUX_DEVTOOLS, REACT_DEVELOPER_TOOLS} = require("electron-devtools-installer");

function createWindow() {
    const win = new BrowserWindow({
        resizable: false,
        width: 500,
        height: 800,
        autoHideMenuBar: false,
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true,
            contextIsolation: false,
        }
    })

    win.loadURL('http://localhost:3000')
    //win.loadURL(`file://${path.join(__dirname, '../build/index.html')}`)
    win.webContents.once("dom-ready", async () => {await installExtension([REDUX_DEVTOOLS, REACT_DEVELOPER_TOOLS]).then((name) => console.log(`Added Extension:  ${name}`)).catch((err) => console.log("An error occurred: ", err)).finally(() => {
    win.webContents.openDevTools();});});
}

app.on('ready', createWindow)

//Quit when all windows are closed.
app.on('window-all-closed', function(){
    //On OS X it common for applications and their menu bar
    //to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('active', function() {
    //On OS X it's common to re-create a window in the app when the
    //dock icon is clicked and there are no other windows open
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
})