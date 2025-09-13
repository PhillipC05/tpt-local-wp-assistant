# TPT Local WP Assistant

🚀 **One-click WordPress plugin development environment with hot reload!**

Point to your plugin folder and get instant updates in the browser. Perfect for Windows users - no complex setup required!

## ⚡ Quick Start (Windows)

1. **Download Node.js** (if you don't have it): https://nodejs.org/
2. **Download this project** as a ZIP file
3. **Extract the ZIP** to any folder
4. **Double-click `install.bat`** or run `install.ps1` in PowerShell
5. **Double-click the desktop shortcut** that gets created!

That's it! Your WordPress development environment is ready.

## 🎯 What You Get

- **Beautiful GUI App** - Point-and-click interface
- **Hot Reload** - See changes instantly in browser
- **TypeScript Support** - Auto-compilation included
- **SQLite Database** - No MySQL setup needed
- **WordPress Auto-Setup** - Everything installed automatically
- **BrowserSync** - Live reloading across devices

## 📋 Features

- 🔥 **Instant Hot Reload** for PHP, JS, CSS, and TypeScript
- 🖥️ **Professional GUI** - Modern desktop application
- 🗄️ **SQLite Database** - Works perfectly in production
- 🎨 **BrowserSync** - Live reload with device sync
- 📝 **TypeScript Ready** - Automatic compilation
- 🛠️ **WP-CLI Integration** - Automated WordPress setup
- ⚙️ **Auto PHP Installation** - Downloads PHP automatically on Windows

## 🖥️ GUI Mode (Recommended)

```bash
npm run gui
```

Features a beautiful interface with:
- System dependency checking
- Plugin folder selection
- Real-time status and logs
- One-click start/stop
- Direct browser launch

## 💻 CLI Mode (Advanced)

```bash
npx tpt-wp-dev start /path/to/plugin
```

## 📦 Installation Options

### Option 1: One-Click Installer (Windows)
1. Download the ZIP
2. Extract anywhere
3. Run `install.bat` or `install.ps1`
4. Use the desktop shortcut!

### Option 2: Manual Installation
```bash
npm install
npm run gui  # Start GUI
```

### Option 3: Build Standalone App
```bash
npm run build-win  # Creates installer
```

## 🔧 System Requirements

- **Windows 10/11** (primary), macOS, or Linux
- **Node.js 16+** (installer checks for this)
- **PHP** (automatically installed on Windows)

## Installation

### GUI Version (Recommended)

```bash
npm install
npm run gui
```

This opens the graphical interface for easy plugin development.

### CLI Version

```bash
npm install -g .
```

Or run locally:

```bash
npm install
npm link
```

## Quick Start

### GUI Mode
1. **Install PHP** (7.4+) if not already installed
2. **Run**: `npm run gui`
3. **Select plugin folder** using the browse button
4. **Click "Start Development"**
5. **Open browser** at http://localhost:3000

### CLI Mode
1. **Install PHP** (7.4+) if not already installed
2. **Clone or create a WordPress plugin** in a folder
3. **Run the assistant**:

```bash
tpt-wp-dev start /path/to/your/plugin/folder
```

4. **Start developing** - changes will appear instantly in your browser!

## Example Plugin

Try the included example plugin:

**GUI**: Click "Use Example" button
**CLI**: `tpt-wp-dev start example-plugin`

This creates a WordPress site with a simple plugin that demonstrates:
- PHP shortcode functionality
- JavaScript interactions
- CSS styling
- Hot reload for all file types

## Usage

### Basic Usage

```bash
tpt-wp-dev start /path/to/your/plugin/folder
```

### Advanced Options

```bash
# Custom ports
tpt-wp-dev start /path/to/plugin --port 3001 --wp-port 8081

# Help
tpt-wp-dev --help
```

## How It Works

1. **Environment Setup**: Downloads WordPress core and sets up SQLite database
2. **Plugin Integration**: Copies your plugin to the WordPress environment and activates it
3. **Servers**: Starts PHP development server and BrowserSync proxy
4. **File Watching**: Monitors your plugin files for changes
5. **Hot Reload**: Automatically syncs changes and refreshes the browser

## TypeScript Support

If your plugin contains `.ts` files, the assistant will:

- Create a `tsconfig.json` if one doesn't exist
- Compile TypeScript files on change
- Sync compiled JavaScript to WordPress
- Provide hot reload for both source and compiled files

## Development Workflow

1. Create/edit your plugin files (PHP, JS, CSS, TS)
2. Changes are automatically detected
3. TypeScript files are compiled (if applicable)
4. Files are synced to the WordPress environment
5. Browser automatically refreshes

## File Structure

```
wordpress-dev-env/          # Auto-generated WordPress installation
├── wp-content/
│   ├── plugins/
│   │   └── your-plugin/    # Your plugin files are copied here
│   └── database/           # SQLite database files
├── wp-config.php
└── ...                     # WordPress core files
```

## Accessing WordPress

- **Site**: http://localhost:3000
- **Admin**: http://localhost:3000/wp-admin
- **Login**: admin / password

## Troubleshooting

### PHP Not Found
Install PHP 7.4+ and ensure it's in your PATH.

### Permission Issues
Make sure you have write permissions in the current directory.

### Port Conflicts
Use `--port` and `--wp-port` options to specify different ports.

## Production Deployment

Your plugin code remains unchanged and works with MySQL in production. The SQLite setup is only for local development.

## License

MIT
