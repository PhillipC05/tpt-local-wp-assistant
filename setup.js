#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const { spawn } = require('child_process');
const https = require('https');
const os = require('os');

const chalk = require('chalk');

class SetupAssistant {
  constructor() {
    this.isWindows = os.platform() === 'win32';
    this.phpPath = null;
  }

  async run() {
    console.log(chalk.blue('🚀 TPT Local WP Assistant Setup'));
    console.log(chalk.gray('================================'));

    try {
      // Check if PHP is already installed
      const phpInstalled = await this.checkPHP();
      if (phpInstalled) {
        console.log(chalk.green('✅ PHP is already installed!'));
        return;
      }

      console.log(chalk.yellow('⚠️ PHP not found. Installing PHP automatically...'));

      if (this.isWindows) {
        await this.installPHPWindows();
      } else {
        console.log(chalk.red('❌ Automatic PHP installation is only supported on Windows.'));
        console.log(chalk.yellow('Please install PHP manually:'));
        console.log(chalk.cyan('  - Visit: https://windows.php.net/download/'));
        console.log(chalk.cyan('  - Download PHP 8.1+ Thread Safe version'));
        console.log(chalk.cyan('  - Extract to C:\\php'));
        console.log(chalk.cyan('  - Add C:\\php to your PATH environment variable'));
        process.exit(1);
      }

    } catch (error) {
      console.error(chalk.red('❌ Setup failed:'), error.message);
      process.exit(1);
    }
  }

  async checkPHP() {
    return new Promise((resolve) => {
      const php = spawn('php', ['--version'], { stdio: 'pipe' });
      php.on('close', (code) => {
        resolve(code === 0);
      });
      php.on('error', () => {
        resolve(false);
      });
    });
  }

  async installPHPWindows() {
    const phpDir = 'C:\\php';
    const zipPath = path.join(os.tmpdir(), 'php.zip');

    try {
      // Create PHP directory
      console.log('Creating PHP directory...');
      await fs.ensureDir(phpDir);

      // Download PHP
      console.log('Downloading PHP...');
      const phpUrl = 'https://windows.php.net/downloads/releases/php-8.1.19-Win32-vs16-x64.zip';

      await this.downloadFile(phpUrl, zipPath);

      // Extract PHP
      console.log('Extracting PHP...');
      const AdmZip = require('adm-zip');
      const zip = new AdmZip(zipPath);
      zip.extractAllTo(phpDir, true);

      // Clean up zip file
      await fs.remove(zipPath);

      // Create php.ini
      console.log('Configuring PHP...');
      const phpIniPath = path.join(phpDir, 'php.ini');
      const phpIniContent = `extension_dir = "ext"
extension=mbstring
extension=openssl
extension=curl
extension=sqlite3
extension=pdo_sqlite
extension=fileinfo
extension=gd
extension=zip
extension=exif

[PHP]
max_execution_time = 300
max_input_time = 300
memory_limit = 512M
post_max_size = 50M
upload_max_filesize = 50M
max_file_uploads = 20

[Date]
date.timezone = UTC

[mail function]
SMTP = localhost
smtp_port = 25
`;

      await fs.writeFile(phpIniPath, phpIniContent);

      // Add to PATH
      console.log('Adding PHP to PATH...');
      await this.addToPath(phpDir);

      console.log(chalk.green('✅ PHP installed successfully!'));
      console.log(chalk.yellow('Please restart your command prompt/terminal for PATH changes to take effect.'));

    } catch (error) {
      console.error(chalk.red('Failed to install PHP:'), error.message);
      throw error;
    }
  }

  async downloadFile(url, destPath) {
    return new Promise((resolve, reject) => {
      const file = fs.createWriteStream(destPath);
      const request = https.get(url, (response) => {
        if (response.statusCode !== 200) {
          reject(new Error(`Failed to download: ${response.statusCode}`));
          return;
        }

        const totalSize = parseInt(response.headers['content-length'], 10);
        let downloadedSize = 0;

        response.on('data', (chunk) => {
          downloadedSize += chunk.length;
          if (totalSize) {
            const progress = Math.round((downloadedSize / totalSize) * 100);
            process.stdout.write(`\rDownloading... ${progress}%`);
          }
        });

        response.pipe(file);
      });

      file.on('finish', () => {
        process.stdout.write('\n');
        resolve();
      });

      request.on('error', reject);
      file.on('error', reject);
    });
  }

  async addToPath(dir) {
    return new Promise((resolve, reject) => {
      // This is a simplified version. In a real implementation,
      // you'd need to modify the Windows registry or use setx
      console.log(chalk.yellow('Note: You may need to manually add PHP to your PATH:'));
      console.log(chalk.cyan(`  Path to add: ${dir}`));
      console.log(chalk.cyan('  Or restart your terminal after installation.'));

      // Try to use setx command
      const setx = spawn('setx', ['PATH', `%PATH%;${dir}`], { stdio: 'inherit' });
      setx.on('close', (code) => {
        if (code === 0) {
          console.log(chalk.green('PATH updated successfully!'));
        } else {
          console.log(chalk.yellow('Could not update PATH automatically.'));
        }
        resolve();
      });
      setx.on('error', () => {
        resolve(); // Don't fail if setx doesn't work
      });
    });
  }
}

// Run setup if this script is executed directly
if (require.main === module) {
  const setup = new SetupAssistant();
  setup.run();
}

module.exports = SetupAssistant;
