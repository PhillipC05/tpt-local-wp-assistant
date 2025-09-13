const fs = require('fs-extra');
const path = require('path');
const { spawn } = require('child_process');
const chokidar = require('chokidar');
const browserSync = require('browser-sync');
const chalk = require('chalk');

class WPDevAssistant {
  constructor(pluginPath, options = {}) {
    this.pluginPath = pluginPath;
    this.options = {
      port: options.port || 3000,
      wpPort: options.wpPort || 8080,
      ...options
    };

    this.wordpressPath = path.join(process.cwd(), 'wordpress-dev-env');
    this.pluginName = path.basename(pluginPath);
    this.wordpressPluginPath = path.join(this.wordpressPath, 'wp-content', 'plugins', this.pluginName);

    this.processes = [];
    this.browserSyncInstance = null;
    this.onLog = null; // Callback for GUI logging
  }

  setLogCallback(callback) {
    this.onLog = callback;
  }

  log(message) {
    if (this.onLog) {
      this.onLog(message);
    }
    console.log(message);
  }

  async start() {
    try {
      this.log('📋 Checking dependencies...');
      await this.checkDependencies();

      this.log('⬇️ Setting up WordPress environment...');
      await this.setupWordPress();

      this.log('📁 Setting up plugin...');
      await this.setupPlugin();

      this.log('🎯 Starting servers...');
      await this.startServers();

      this.log('👀 Starting file watchers...');
      this.startFileWatchers();

      this.log('✅ Development environment ready!');
      this.log(`🌐 Open: http://localhost:${this.options.port}`);
      this.log(`🔧 WordPress Admin: http://localhost:${this.options.port}/wp-admin`);
      this.log('💡 Edit your plugin files and see changes instantly!');

      // Keep the process running
      process.on('SIGINT', () => this.cleanup());
      process.on('SIGTERM', () => this.cleanup());

    } catch (error) {
      await this.cleanup();
      throw error;
    }
  }

  async checkDependencies() {
    // Check if PHP is installed
    try {
      await this.runCommand('php', ['--version']);
      this.log('✅ PHP found');
    } catch (error) {
      throw new Error('PHP is not installed. Please install PHP 7.4+ and add it to your PATH.');
    }

    // Check if WP-CLI is available or download it
    try {
      await this.runCommand('wp', ['--version']);
      this.log('✅ WP-CLI found');
    } catch (error) {
      this.log('⚠️ WP-CLI not found, downloading...');
      await this.downloadWPCLI();
    }
  }

  async downloadWPCLI() {
    const wpCliPath = path.join(process.cwd(), 'wp-cli.phar');

    if (!await fs.pathExists(wpCliPath)) {
      this.log('Downloading WP-CLI...');
      // Download WP-CLI phar file
      const https = require('https');
      const url = 'https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar';

      await new Promise((resolve, reject) => {
        const file = fs.createWriteStream(wpCliPath);
        https.get(url, (response) => {
          response.pipe(file);
          file.on('finish', () => {
            file.close();
            resolve();
          });
        }).on('error', reject);
      });
    }

    // Use php wp-cli.phar instead of wp command
    this.wpCommand = `php ${wpCliPath}`;
  }

  async setupWordPress() {
    // Create WordPress directory
    await fs.ensureDir(this.wordpressPath);

    // Download WordPress core
    const wpCommand = this.wpCommand || 'wp';
    await this.runCommand(wpCommand, ['core', 'download'], { cwd: this.wordpressPath });

    // Create wp-config.php with SQLite
    const configContent = `<?php
define('DB_NAME', 'wordpress');
define('DB_USER', '');
define('DB_PASSWORD', '');
define('DB_HOST', '');
define('WP_DEBUG', true);
define('WP_DEBUG_LOG', true);

// SQLite integration
define('USE_MYSQL', false);
define('DB_DIR', __DIR__ . '/wp-content/database');
define('DB_FILE', 'wp-content/db.php');

require_once(ABSPATH . 'wp-settings.php');
`;

    await fs.writeFile(path.join(this.wordpressPath, 'wp-config.php'), configContent);

    // Download and install SQLite plugin
    this.log('Setting up SQLite integration...');
    const sqliteRepoUrl = 'https://github.com/wordpress/sqlite-database-integration/archive/refs/heads/main.zip';

    // Download SQLite integration
    const https = require('https');
    const AdmZip = require('adm-zip');
    const sqliteZipPath = path.join(this.wordpressPath, 'sqlite-integration.zip');

    await new Promise((resolve, reject) => {
      const file = fs.createWriteStream(sqliteZipPath);
      https.get(sqliteRepoUrl, (response) => {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve();
        });
      }).on('error', reject);
    });

    // Extract SQLite integration
    const zip = new AdmZip(sqliteZipPath);
    zip.extractAllTo(this.wordpressPath, true);

    // Move SQLite files to correct locations
    const sqliteExtractPath = path.join(this.wordpressPath, 'sqlite-database-integration-main');
    await fs.move(path.join(sqliteExtractPath, 'db.copy'), path.join(this.wordpressPath, 'wp-content', 'db.php'));
    await fs.move(path.join(sqliteExtractPath, 'sqlite-integration.php'), path.join(this.wordpressPath, 'wp-content', 'plugins', 'sqlite-integration.php'));

    // Clean up
    await fs.remove(sqliteZipPath);
    await fs.remove(sqliteExtractPath);

    // Install WordPress
    await this.runCommand(wpCommand, ['core', 'install',
      '--url=http://localhost:' + this.options.wpPort,
      '--title=WP Dev Environment',
      '--admin_user=admin',
      '--admin_password=password',
      '--admin_email=admin@example.com'
    ], { cwd: this.wordpressPath });
  }

  async setupPlugin() {
    // Copy plugin to WordPress plugins directory
    await fs.copy(this.pluginPath, this.wordpressPluginPath);

    // Activate the plugin
    const wpCommand = this.wpCommand || 'wp';
    await this.runCommand(wpCommand, ['plugin', 'activate', this.pluginName], { cwd: this.wordpressPath });
  }

  async startServers() {
    // Start PHP development server
    const phpProcess = spawn('php', ['-S', `localhost:${this.options.wpPort}`, '-t', '.'], {
      cwd: this.wordpressPath,
      stdio: 'inherit'
    });

    this.processes.push(phpProcess);

    // Start BrowserSync
    this.browserSyncInstance = browserSync.create();
    await new Promise((resolve) => {
      this.browserSyncInstance.init({
        proxy: `http://localhost:${this.options.wpPort}`,
        port: this.options.port,
        open: true,
        notify: false,
        files: [
          path.join(this.wordpressPluginPath, '**/*.php'),
          path.join(this.wordpressPluginPath, '**/*.js'),
          path.join(this.wordpressPluginPath, '**/*.css')
        ]
      }, resolve);
    });
  }

  startFileWatchers() {
    // Watch plugin source files
    const watcher = chokidar.watch(this.pluginPath, {
      ignored: /(^|[\/\\])\../, // ignore dotfiles
      persistent: true
    });

    // Also watch dist folder for compiled JS files
    const distWatcher = chokidar.watch(path.join(this.pluginPath, 'dist'), {
      ignored: /(^|[\/\\])\../, // ignore dotfiles
      persistent: true,
      ignoreInitial: true
    });

    watcher.on('change', async (filePath) => {
      const relativePath = path.relative(this.pluginPath, filePath);
      const targetPath = path.join(this.wordpressPluginPath, relativePath);

      try {
        // Check if it's a TypeScript file
        if (filePath.endsWith('.ts')) {
          await this.compileTypeScript(filePath);
          // Don't copy .ts files directly, wait for compiled .js
          return;
        }

        // Copy file to WordPress
        await fs.copy(filePath, targetPath);
        this.log(`🔄 Updated: ${relativePath}`);
      } catch (error) {
        this.log(`❌ Error updating ${relativePath}: ${error.message}`);
      }
    });

    watcher.on('add', async (filePath) => {
      const relativePath = path.relative(this.pluginPath, filePath);
      const targetPath = path.join(this.wordpressPluginPath, relativePath);

      try {
        if (filePath.endsWith('.ts')) {
          await this.compileTypeScript(filePath);
          // Don't copy .ts files directly
          return;
        }
        await fs.copy(filePath, targetPath);
        this.log(`➕ Added: ${relativePath}`);
      } catch (error) {
        this.log(`❌ Error adding ${relativePath}: ${error.message}`);
      }
    });

    watcher.on('unlink', async (filePath) => {
      const relativePath = path.relative(this.pluginPath, filePath);
      const targetPath = path.join(this.wordpressPluginPath, relativePath);

      try {
        await fs.remove(targetPath);
        this.log(`➖ Removed: ${relativePath}`);
      } catch (error) {
        this.log(`❌ Error removing ${relativePath}: ${error.message}`);
      }
    });

    // Watch compiled JS files
    distWatcher.on('change', async (filePath) => {
      const relativePath = path.relative(path.join(this.pluginPath, 'dist'), filePath);
      const targetPath = path.join(this.wordpressPluginPath, relativePath);

      try {
        await fs.copy(filePath, targetPath);
        this.log(`🔄 Compiled JS updated: ${relativePath}`);
      } catch (error) {
        this.log(`❌ Error updating compiled JS ${relativePath}: ${error.message}`);
      }
    });

    distWatcher.on('add', async (filePath) => {
      const relativePath = path.relative(path.join(this.pluginPath, 'dist'), filePath);
      const targetPath = path.join(this.wordpressPluginPath, relativePath);

      try {
        await fs.copy(filePath, targetPath);
        this.log(`➕ Compiled JS added: ${relativePath}`);
      } catch (error) {
        this.log(`❌ Error adding compiled JS ${relativePath}: ${error.message}`);
      }
    });

    distWatcher.on('unlink', async (filePath) => {
      const relativePath = path.relative(path.join(this.pluginPath, 'dist'), filePath);
      const targetPath = path.join(this.wordpressPluginPath, relativePath);

      try {
        await fs.remove(targetPath);
        this.log(`➖ Compiled JS removed: ${relativePath}`);
      } catch (error) {
        this.log(`❌ Error removing compiled JS ${relativePath}: ${error.message}`);
      }
    });
  }

  async compileTypeScript(tsFilePath) {
    const tsconfigPath = path.join(this.pluginPath, 'tsconfig.json');

    // Check if tsconfig exists, create default if not
    if (!await fs.pathExists(tsconfigPath)) {
      const defaultTsConfig = {
        "compilerOptions": {
          "target": "ES2018",
          "module": "commonjs",
          "outDir": "./dist",
          "rootDir": "./src",
          "strict": true,
          "esModuleInterop": true,
          "skipLibCheck": true,
          "forceConsistentCasingInFileNames": true,
          "declaration": false,
          "sourceMap": false
        },
        "include": ["src/**/*"],
        "exclude": ["node_modules", "dist"]
      };
      await fs.writeJson(tsconfigPath, defaultTsConfig);
    }

    // Use tsc command for compilation
    try {
      await this.runCommand('npx', ['tsc', '--noEmitOnError', tsFilePath], { cwd: this.pluginPath });
      this.log(`📝 Compiled: ${path.relative(this.pluginPath, tsFilePath)}`);
    } catch (error) {
      this.log(`❌ TypeScript compilation failed for ${path.relative(this.pluginPath, tsFilePath)}`);
    }
  }

  async runCommand(command, args = [], options = {}) {
    return new Promise((resolve, reject) => {
      const child = spawn(command, args, {
        stdio: 'inherit',
        ...options
      });

      child.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Command failed: ${command} ${args.join(' ')}`));
        }
      });

      child.on('error', reject);
    });
  }

  async cleanup() {
    this.log('\n🧹 Cleaning up...');

    // Stop BrowserSync
    if (this.browserSyncInstance) {
      this.browserSyncInstance.exit();
    }

    // Kill all processes
    this.processes.forEach(process => {
      try {
        process.kill();
      } catch (error) {
        // Ignore errors when killing processes
      }
    });

    this.log('✅ Cleanup complete');
    process.exit(0);
  }
}

module.exports = WPDevAssistant;
