const fs = require("fs");
const path = require("path");
const rimraf = require('rimraf');

const SRC_DIR = path.join(__dirname, "../src");
const BUILD_DIR = path.join(__dirname, "../build");

const USERSCRIPT_DIR = path.join(BUILD_DIR, "userscript");
const CHROME_DIR = path.join(BUILD_DIR, "chrome");
const FIREFOX_DIR = path.join(BUILD_DIR, "firefox");

const CSS_DIR = path.join(SRC_DIR, "css");
const JS_DIR = path.join(SRC_DIR, "js");
const CONFIGS_DIR = path.join(__dirname, "../configs");

// Utility function to copy files/folders
function copyFile(src, dest) {
    fs.mkdirSync(path.dirname(dest), {recursive: true});
    fs.copyFileSync(src, dest);
}

// Utility function to merge manifest data
function mergeManifests(sharedManifest, specificManifest) {
    // Combine the 'permissions' arrays and remove duplicates
    const mergedPermissions = [...new Set([...(sharedManifest.permissions || []), ...(specificManifest.permissions || []),]),];

    // Merge the two manifests, with merged permissions
    return {
        ...sharedManifest, ...specificManifest, permissions: mergedPermissions,
    };
}

// Utility function to build the userscript
function buildUserscript() {
    console.log("Building userscript...");

    // Read shared JS and userscript entry point
    const sharedJs = fs.readFileSync(path.join(JS_DIR, "shared.js"), "utf8");
    const userscriptJs = fs.readFileSync(path.join(SRC_DIR, "userscript.js"), "utf8");

    // Read metadata for the userscript
    const userscriptMetadata = fs.readFileSync(path.join(CONFIGS_DIR, "userscript-metadata.js"), "utf8");

    // Read CSS file and inline it TODO
    // const cssFile = fs.readFileSync(path.join(CSS_DIR, "styles.css"), "utf8");

    // Build userscript content
    const userscriptContent = `${userscriptMetadata}


(function () {
    'use strict';
    
// Shared logic
${sharedJs}

// Userscript-specific logic
${userscriptJs}
})();

`;

    // Ensure build directory exists and write userscript
    fs.mkdirSync(USERSCRIPT_DIR, {recursive: true});
    fs.writeFileSync(path.join(USERSCRIPT_DIR, "modular-userscript.user.js"), userscriptContent);

    console.log("Userscript build complete.");
}

// Utility function to build extension (Chrome/Firefox)
function buildExtension(manifestFile, outputDir, sharedManifest, includeBackground) {
    console.log(`Building extension for ${outputDir}...`);

    // Read shared JS
    const sharedJs = fs.readFileSync(path.join(JS_DIR, "shared.js"), "utf8");
    const contentJs = fs.readFileSync(path.join(SRC_DIR, "content.js"), "utf8");

    // Build content.js content
    const contentContent = `// Shared logic
${sharedJs}

// Content.js-specific logic
${contentJs}
`;

    // Merge shared manifest with browser specific override
    const specificManifest = JSON.parse(fs.readFileSync(manifestFile, "utf8"));
    const mergedManifest = mergeManifests(sharedManifest, specificManifest);

    // Read the base content script (same for both browsers)
    copyFile(path.join(CSS_DIR, "styles.css"), path.join(outputDir, "css/styles.css"));
    fs.writeFileSync(path.join(outputDir, "content.js"), contentContent);
    if (includeBackground) {
        const backgroundJs = fs.readFileSync(path.join(SRC_DIR, "background.js"), "utf8");
        fs.writeFileSync(path.join(outputDir, "background.js"), backgroundJs);
    }
    fs.writeFileSync(path.join(outputDir, "manifest.json"), JSON.stringify(mergedManifest, null, 4));

    console.log(`Extension build for ${outputDir} complete.`);
}

// Main build function
function build() {
    // Clean build directory
    rimraf.sync(BUILD_DIR);
    fs.mkdirSync(BUILD_DIR, {recursive: true});

    // Read shared manifest (common for both Chrome and Firefox)
    const sharedManifest = JSON.parse(fs.readFileSync(path.join(SRC_DIR, "manifest.json"), "utf8"));

    // Build Userscript
    buildUserscript();

    // Build Chrome extension
    buildExtension(path.join(CONFIGS_DIR, "chrome-manifest.json"), CHROME_DIR, sharedManifest, true);

    // Build Firefox extension
    buildExtension(path.join(CONFIGS_DIR, "firefox-manifest.json"), FIREFOX_DIR, sharedManifest, false);
}

// Run build
build();
