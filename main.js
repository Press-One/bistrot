const { app, BrowserWindow } = require('electron')

var mainWindow = null;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1000,
        height: 1000,
        'min-width': 500,
        'min-height': 200,
        'accept-first-mouse': true,
        'title-bar-style': 'hidden',
        webPreferences: {
            nodeIntegration: true
        },
    })
    mainWindow.loadFile('electron/index.html')
    // mainWindow.loadFile('app/dist/app/index.html')
    mainWindow.webContents.openDevTools()

    // Emitted when the window is closed.
    mainWindow.on('closed', function() {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null;
    });

}

// const { ipcMain } = require('electron')
// ipcMain.handle('doA', (event, a, b, c) => {
//     // ... do actions on behalf of the Renderer
//     console.log(event, a, b, c);
// });
// console.log(app);

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





/*
Dashboard
actInfo.js
actAccount.js me
actBalance.js


Wallet
actOpenaccount.js
actStatement.js
Statement
actBuyram.js
actUndelegate.js
actCancel.js
actDelegate.js
actDeposit.js
actRefund.js
actWithdraw.js


Keys
actKeys.js
actActivekey.js
actKeystore.js
actOwnerkey.js
actUnlock.js


BP Hosting


BP Manage
actRegproducer.js
actProducers.js
actAuth.js
Rewards
actReward.js


uniswap
actDefichart.js
actDefimine.js
actDefiprice.js


Ballot
actBallot.js
actVote.js


Tools
actConfig.js
actGenesis.js
actRunsrv.js
actBlock.js
actEvolve.js
actSpdtest.js
actCreateaccount.js
actTail.js
actTrx.js


Notifications


help
actCmd.js
actHelp.js


About
actVersion.js
*/
