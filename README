# Fatamorgana Plus

## Overview

This project is a cross-platform browser extension and userscript for extend FataMorgana (Myhordes external map) features. It supports:

- **Chrome Extension**
- **Firefox Extension**
- **Standalone Userscript**

### Features
- Highlight Expeditions

---

## Directory Structure

```
project/
├── src/
│   ├── manifest.json             # Base manifest shared by all platforms
│   ├── assets/                   # Shared assets (e.g., images, icons)
│   ├── css/                      # Shared styles
│   ├── js/                       # Shared JS modules
│   ├── content.js                # Browser extension entrypoint
│   ├── background.js             # Chrome specific to get FM global data variable
│   └── userscript.js             # Userscript entry point
├── configs/
│   ├── chrome-manifest.json      # Chrome-specific manifest overrides
│   ├── firefox-manifest.json     # Firefox-specific manifest overrides
│   └── userscript-metadata.js    # Userscript metadata (added during build)
├── build/                        # Build output for extensions and userscript
├── scripts/
│   └── build.js                  # Build script for generating outputs
├── package.json                  # Dependencies and scripts
├── .gitignore                    # Ignored files and folders
└── README.md                     # Project documentation
```

---

## Prerequisites

Ensure you have the following installed:

- **Node.js** (16.x or higher)
- **npm** (comes with Node.js)

---

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/2phost/fatamorgana-plus.git
   cd fatamorgana-plus
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

---

## Build Instructions

The project uses a build script to generate platform-specific outputs.

### Build All Platforms
To build all platforms (Chrome, Firefox, and Userscript):
```bash
npm run build
```

### Build Specific Outputs

#### Chrome Extension:
```bash
npm run build:chrome
```
- Output: `build/chrome/`

#### Firefox Extension:
```bash
npm run build:firefox
```
- Output: `build/firefox/`

#### Userscript:
```bash
npm run build:userscript
```
- Output: `build/userscript/your-userscript.user.js`

---

## Development

### Adding Features
1. Add shared resources to the appropriate directories:
   - **CSS**: `src/css/`
   - **JS Modules**: `src/js/`
   - **Assets**: `src/assets/`

2. Update platform-specific configurations as needed:
   - **Chrome**: `configs/chrome-manifest.json`
   - **Firefox**: `configs/firefox-manifest.json`

3. Test your changes by building and loading the output into your browser.

### Loading the Extension Locally
1. **Chrome**:
   - Go to `chrome://extensions/`.
   - Enable "Developer mode."
   - Click "Load unpacked" and select the `build/chrome` folder.

2. **Firefox**:
   - Go to `about:debugging#/runtime/this-firefox`.
   - Click "Load Temporary Add-on" and select the `manifest.json` file from the `build/firefox` folder.

---

## Project Scripts

- **Clean and Build All Platforms**:
  ```bash
  npm run start
  ```
- **Build All Platforms**:
  ```bash
  npm run build
  ```
- **Clean**:
  ```bash
  npm run clean
  ```

---

## Contributing

Contributions are welcome! To contribute:

1. Fork the repository.
2. Create a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. Commit your changes:
   ```bash
   git commit -m "Add your feature description"
   ```
4. Push the branch:
   ```bash
   git push origin feature/your-feature-name
   ```
5. Open a Pull Request.

---

## License

This project is licensed under the [GNU General Public License v3.0](https://www.gnu.org/licenses/gpl-3.0.html).

---

## Additional Notes

### Debugging
- Use browser developer tools to inspect injected elements and log outputs.
- Test the userscript separately using a userscript manager like **Tampermonkey**.
