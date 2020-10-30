const { app, BrowserWindow } = require('electron')

var mainWindow = null;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        'min-width': 500,
        'min-height': 200,
        'accept-first-mouse': true,
        'title-bar-style': 'hidden',
        webPreferences: {
            nodeIntegration: true
        },
    })
    mainWindow.loadFile('electron/index.html')
    // win.webContents.openDevTools()

    // Emitted when the window is closed.
    mainWindow.on('closed', function() {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null;
    });
}

console.log(app);

app.whenReady().then(createWindow)

app.on('window-all-closed', function() {
    if (process.platform != 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
    }
})
