const { app, BrowserWindow, dialog, ipcMain, Menu } = require('electron');
const path = require('path');
const WPDevAssistant = require('./lib/wp-dev-assistant');

let mainWindow;
let wpAssistant = null;

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    },
    icon: path.join(__dirname, 'assets', 'icon.png'), // Optional icon
    title: 'TPT Local WP Assistant'
  });

  // Load the GUI
  mainWindow.loadFile('gui/index.html');

  // Open DevTools in development
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
    if (wpAssistant) {
      wpAssistant.cleanup();
      wpAssistant = null;
    }
  });
}

// App event handlers
app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// IPC handlers for GUI communication
ipcMain.handle('select-plugin-folder', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory'],
    title: 'Select WordPress Plugin Folder'
  });

  if (!result.canceled) {
    return result.filePaths[0];
  }
  return null;
});

ipcMain.handle('start-development', async (event, pluginPath) => {
  try {
    if (wpAssistant) {
      await wpAssistant.cleanup();
    }

    wpAssistant = new WPDevAssistant(pluginPath);

    // Set up logging callback to send logs to GUI
    wpAssistant.setLogCallback((message) => {
      mainWindow.webContents.send('log-message', message);
    });

    await wpAssistant.start();

    return { success: true, message: 'Development environment started successfully!' };
  } catch (error) {
    return { success: false, message: error.message };
  }
});

ipcMain.handle('stop-development', async () => {
  try {
    if (wpAssistant) {
      await wpAssistant.cleanup();
      wpAssistant = null;
    }
    return { success: true, message: 'Development environment stopped.' };
  } catch (error) {
    return { success: false, message: error.message };
  }
});

ipcMain.handle('check-dependencies', async () => {
  const results = {
    node: true, // We're running in Node.js
    php: false,
    wpCli: false
  };

  // Check PHP
  try {
    const { spawn } = require('child_process');
    await new Promise((resolve, reject) => {
      const php = spawn('php', ['--version']);
      php.on('close', (code) => {
        if (code === 0) {
          results.php = true;
          resolve();
        } else {
          reject();
        }
      });
      php.on('error', reject);
    });
  } catch (error) {
    // PHP not found
  }

  // Check WP-CLI
  try {
    const { spawn } = require('child_process');
    await new Promise((resolve, reject) => {
      const wp = spawn('wp', ['--version']);
      wp.on('close', (code) => {
        if (code === 0) {
          results.wpCli = true;
          resolve();
        } else {
          reject();
        }
      });
      wp.on('error', reject);
    });
  } catch (error) {
    // WP-CLI not found
  }

  return results;
});

// Create application menu
const template = [
  {
    label: 'File',
    submenu: [
      {
        label: 'Select Plugin Folder',
        click: () => {
          mainWindow.webContents.send('menu-select-folder');
        }
      },
      { type: 'separator' },
      {
        label: 'Exit',
        click: () => {
          app.quit();
        }
      }
    ]
  },
  {
    label: 'Development',
    submenu: [
      {
        label: 'Start Development',
        click: () => {
          mainWindow.webContents.send('menu-start-dev');
        }
      },
      {
        label: 'Stop Development',
        click: () => {
          mainWindow.webContents.send('menu-stop-dev');
        }
      }
    ]
  },
  {
    label: 'Help',
    submenu: [
      {
        label: 'About',
        click: () => {
          dialog.showMessageBox(mainWindow, {
            type: 'info',
            title: 'About TPT Local WP Assistant',
            message: 'TPT Local WP Assistant',
            detail: 'Automated WordPress plugin development with hot reload.\nVersion 1.0.0'
          });
        }
      }
    ]
  }
];

const menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);
