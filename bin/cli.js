#!/usr/bin/env node

const { Command } = require('commander');
const path = require('path');
const WPDevAssistant = require('../lib/wp-dev-assistant');

const program = new Command();

program
  .name('tpt-wp-dev')
  .description('Automated WordPress plugin development with hot reload')
  .version('1.0.0');

program
  .command('start <pluginPath>')
  .description('Start development environment for WordPress plugin')
  .option('-p, --port <port>', 'Port for the development server', '3000')
  .option('-w, --wp-port <wpPort>', 'Port for WordPress PHP server', '8080')
  .action(async (pluginPath, options) => {
    const absolutePluginPath = path.resolve(pluginPath);

    console.log(`🚀 Starting TPT Local WP Assistant for: ${absolutePluginPath}`);

    const assistant = new WPDevAssistant(absolutePluginPath, {
      port: parseInt(options.port),
      wpPort: parseInt(options.wpPort)
    });

    try {
      await assistant.start();
    } catch (error) {
      console.error('❌ Error starting development environment:', error.message);
      process.exit(1);
    }
  });

program.parse();
