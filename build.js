const fs = require('fs');
const path = require('path');
const UglifyJS = require('uglify-js');
const htmlMinify = require('html-minifier').minify;
const JavaScriptObfuscator = require('javascript-obfuscator');

// Read the HTML template
let html = fs.readFileSync('index.html', 'utf8');

// Find the script tags
const scriptTags = html.match(/<script src="[^"]+"><\/script>/g);

// Collect all JS code
let allJsCode = '';

// Replace each script tag with its content
if (scriptTags) {
    scriptTags.forEach(tag => {
        const src = tag.match(/src="([^"]+)"/)[1];
        const content = fs.readFileSync(src, 'utf8');
        allJsCode += content + '\n';
        html = html.replace(tag, ''); // Remove script tag
    });
}

// Obfuscate all JS code together with safer settings
const obfuscationResult = JavaScriptObfuscator.obfuscate(allJsCode, {
    compact: true,
    controlFlowFlattening: false,
    deadCodeInjection: false,
    debugProtection: false,
    disableConsoleOutput: false,
    identifierNamesGenerator: 'hexadecimal',
    renameGlobals: false,
    rotateStringArray: true,
    selfDefending: false,
    splitStrings: false,
    stringArray: true,
    stringArrayEncoding: ['base64'],  // Fixed: Now using correct array format
    stringArrayThreshold: 0.75,
    transformObjectKeys: false,
    unicodeEscapeSequence: false
});

// Add obfuscated code back to HTML
html = html.replace('</body>', `<script>${obfuscationResult.getObfuscatedCode()}</script></body>`);

// Minify the entire HTML
const minifiedHtml = htmlMinify(html, {
    collapseWhitespace: true,
    removeComments: true,
    minifyCSS: true,
    minifyJS: false  // Disable since we already obfuscated
});

// Create dist directory if it doesn't exist
if (!fs.existsSync('dist')) {
    fs.mkdirSync('dist');
}

// Write the combined, obfuscated and minified file
fs.writeFileSync('dist/spaceinvaders.html', minifiedHtml);

console.log('Built, obfuscated and minified dist/spaceinvaders.html successfully!'); 