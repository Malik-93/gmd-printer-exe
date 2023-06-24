import { app, BrowserWindow, ipcMain } from 'electron';

let mainWindow: BrowserWindow | any,
    isNodeAppUp: boolean = false,
    itr: number = 1,
    maxItr: number = 5,
    lasMaxItr: 20,
    intervalID: any;

function createWindow() {
    try {
        mainWindow = new BrowserWindow({
            width: 800,
            height: 600,
            webPreferences: {
                nodeIntegration: true,
            },
        });
        function clear_interval() {
            clearInterval(intervalID);
            maxItr = 5;
            itr = 1;
            console.log(`Interval stoped/cleared to listen node app`);
        }
        async function loadURL() {
            try {
                await mainWindow.loadURL('http://localhost:9000');
                isNodeAppUp = true;
                console.log(`Electron app is listening to node app...`);
                clear_interval();
            } catch (error) {
                console.log('[loadURL].error', error);
            }
        }
        intervalID = setInterval(() => {
            if (!isNodeAppUp && itr < maxItr) {
                console.log(`Interval to listen node app try -> ${itr}.`);
                loadURL();
                itr++;
            } else {
                if (maxItr <= lasMaxItr) {
                    maxItr += maxItr;
                    console.log(`Increased max iteration value to -> ${maxItr}.`);
                } else clear_interval();
            }
        }, 5 * 1000);
        mainWindow.on('closed', function () {
            mainWindow = null;
        });
    } catch (error) {
        console.log('[createWindow].error', error);
    }

}

app.on('ready', () => {
    createWindow();
});

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', function () {
    if (mainWindow === null) {
        createWindow();
    }
});

ipcMain.on('app_version', (event) => {
    event.sender.send('app_version', { version: app.getVersion() });
});