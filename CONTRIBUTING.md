# Contributing to TPT Local WP Assistant

Thank you for your interest in contributing to TPT Local WP Assistant! This document provides guidelines and information for contributors.

## 🚀 Quick Start

1. **Fork** the repository
2. **Clone** your fork: `git clone https://github.com/your-username/tpt-local-wp-assistant.git`
3. **Install dependencies**: `npm install`
4. **Run setup**: `npm run setup`
5. **Start developing**: `npm run gui`

## 🛠️ Development Setup

### Prerequisites
- **Node.js 16+**
- **PHP 7.4+** (automatically installed on Windows)
- **Git**

### Installation
```bash
# Clone the repository
git clone https://github.com/your-repo/tpt-local-wp-assistant.git
cd tpt-local-wp-assistant

# Install dependencies
npm install

# Run setup (installs PHP on Windows)
npm run setup

# Start the GUI for development
npm run gui
```

### Development Workflow

1. **Create a feature branch**: `git checkout -b feature/your-feature-name`
2. **Make your changes**
3. **Test thoroughly**:
   - Run the GUI: `npm run gui`
   - Test CLI: `npm run start`
   - Test example plugin
4. **Run linting**: `npm run lint` (if available)
5. **Commit your changes**: `git commit -m "Add: your feature description"`
6. **Push to your fork**: `git push origin feature/your-feature-name`
7. **Create a Pull Request**

## 📋 Contribution Guidelines

### Code Style
- **JavaScript**: Follow ESLint configuration (if present)
- **Consistent naming**: Use camelCase for variables/functions
- **Comments**: Add JSDoc comments for functions
- **Error handling**: Always handle errors appropriately
- **Security**: Be mindful of security implications

### Commit Messages
Use conventional commit format:
```
type(scope): description

[optional body]

[optional footer]
```

Types:
- `feat`: New features
- `fix`: Bug fixes
- `docs`: Documentation
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Testing
- `chore`: Maintenance

Examples:
```
feat: add TypeScript support
fix: resolve PHP installation issue on Windows
docs: update installation instructions
```

### Pull Request Process

1. **Update the README.md** if needed
2. **Update CHANGELOG.md** with your changes
3. **Add tests** for new features
4. **Ensure CI passes**
5. **Request review** from maintainers

### Testing

Before submitting:
- ✅ GUI launches without errors
- ✅ CLI commands work
- ✅ Example plugin loads
- ✅ Hot reload functions
- ✅ No console errors
- ✅ Cross-platform compatibility

## 🏗️ Architecture

### Project Structure
```
├── bin/                 # CLI entry points
├── lib/                 # Core application logic
├── gui/                 # Electron GUI files
├── example-plugin/      # Demo WordPress plugin
├── assets/             # Icons and assets
├── setup.js            # Installation script
├── electron-main.js    # Electron main process
└── package.json        # Dependencies and scripts
```

### Key Components

- **WPDevAssistant** (`lib/wp-dev-assistant.js`): Core application logic
- **Electron Main** (`electron-main.js`): Desktop app framework
- **GUI** (`gui/index.html`): User interface
- **Setup** (`setup.js`): Automated installation

## 🐛 Bug Reports

**Great Bug Reports** include:
- Clear title and description
- Steps to reproduce
- Expected vs actual behavior
- Screenshots (for GUI issues)
- System information (OS, Node.js version, etc.)
- Error logs

## 💡 Feature Requests

**Great Feature Requests** include:
- Clear description of the feature
- Use case and benefits
- Mockups or examples (if UI-related)
- Implementation suggestions

## 📚 Documentation

- **README.md**: Main documentation
- **CHANGELOG.md**: Version history
- **INSTALL.txt**: Quick installation guide
- **Inline comments**: Code documentation

## 🔒 Security

- Report security issues privately
- Do not create public issues for security vulnerabilities
- See SECURITY.md for details (if exists)

## 📝 License

By contributing, you agree that your contributions will be licensed under the same license as the project (MIT).

## 🙏 Recognition

Contributors will be:
- Listed in CHANGELOG.md
- Mentioned in release notes
- Added to a future contributors file

Thank you for contributing to TPT Local WP Assistant! 🎉
