const { app, BrowserWindow, shell } = require('electron');
const { spawn } = require('child_process');
const path = require('path');
const http = require('http');

let mainWindow;
let flaskProcess;

const FLASK_PORT = 5000;
const FLASK_URL  = `http://127.0.0.1:${FLASK_PORT}`;

// Ruta al backend compilado
function getBackendPath() {
    if (app.isPackaged) {
        return path.join(process.resourcesPath, 'backend', 'app.exe');
    }
    // Dev mode: run python directly
    return null;
}

function startFlask() {
    return new Promise((resolve, reject) => {
        if (app.isPackaged) {
            const exePath = getBackendPath();
            flaskProcess = spawn(exePath, [], {
                cwd: path.dirname(exePath),
                windowsHide: true
            });
        } else {
            // Dev: use python in .venv
            const venvPython = path.join(__dirname, '..', '.venv', 'Scripts', 'python.exe');
            const appPy     = path.join(__dirname, '..', 'backend', 'app.py');
            flaskProcess = spawn(venvPython, [appPy], {
                cwd: path.join(__dirname, '..', 'backend'),
                windowsHide: true
            });
        }

        flaskProcess.stdout.on('data', d => console.log('[Flask]', d.toString()));
        flaskProcess.stderr.on('data', d => console.error('[Flask]', d.toString()));
        flaskProcess.on('error', reject);

        // Poll until Flask responds
        const MAX = 30;
        let tries = 0;
        const poll = setInterval(() => {
            tries++;
            http.get(FLASK_URL, () => {
                clearInterval(poll);
                resolve();
            }).on('error', () => {
                if (tries >= MAX) { clearInterval(poll); reject(new Error('Flask timeout')); }
            });
        }, 1000);
    });
}

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 800,
        minWidth: 900,
        minHeight: 600,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
        },
        icon: path.join(__dirname, 'assets', 'icon.ico'),
        title: 'Archivo de Residencias — TECNM Ciudad Madero',
        autoHideMenuBar: true,
    });

    mainWindow.loadURL(FLASK_URL);

    // Open external links in browser
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        shell.openExternal(url);
        return { action: 'deny' };
    });
}

app.whenReady().then(async () => {
    try {
        await startFlask();
        createWindow();
    } catch (e) {
        console.error('Failed to start backend:', e);
        app.quit();
    }
});

app.on('window-all-closed', () => {
    if (flaskProcess) flaskProcess.kill();
    if (process.platform !== 'darwin') app.quit();
});

app.on('before-quit', () => {
    if (flaskProcess) flaskProcess.kill();
});
