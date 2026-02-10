
import { app, BrowserWindow } from 'electron';
import * as path from 'path';
import { fork } from 'child_process';

let mainWindow: BrowserWindow | null;
let backendProcess: any;

function createWindow() {
    mainWindow = new BrowserWindow({
        title: 'WealthWatch',
        width: 1200,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: true,
            contextIsolation: false,
            sandbox: false, // Ensure Node integration works
        },
    });

    // In development mode (not packaged), load from Vite dev server
    if (!app.isPackaged) {
        mainWindow.loadURL('http://localhost:5173');
        mainWindow.webContents.openDevTools();
    } else {
        // In production, load the built index.html
        mainWindow.loadFile(path.join(__dirname, '../frontend/dist/index.html'));
    }

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

app.on('ready', () => {
    // Start Backend Server
    // In specific prod setting we spawn the nestjs main.js
    if (app.isPackaged) {
        const backendScript = path.join(__dirname, '../backend/dist/main.js');

        console.log('Starting backend from:', backendScript);

        // We use fork because we want to run a node module
        backendProcess = fork(backendScript, [], {
            env: { ...process.env, PORT: '3000' }
        });

        backendProcess.on('error', (err: any) => {
            console.error('Failed to start backend:', err);
        });
    }

    createWindow();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        if (backendProcess) {
            backendProcess.kill();
        }
        app.quit();
    }
});

app.on('will-quit', () => {
    if (backendProcess) {
        backendProcess.kill();
    }
});

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});
