/**
 * Restructure Script for Timbplast HTTrack Website
 * This script runs locally in the project root to restructure assets.
 */

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);
const mkdir = promisify(fs.mkdir);
const copyFile = promisify(fs.copyFile);
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const rm = promisify(fs.rm);

const PROJECT_DIR = process.cwd();
const ASSETS_DIR = path.join(PROJECT_DIR, 'assets');
const ASSETS_CSS_DIR = path.join(ASSETS_DIR, 'css');
const ASSETS_JS_DIR = path.join(ASSETS_DIR, 'js');
const ASSETS_IMG_DIR = path.join(ASSETS_DIR, 'images');
const ASSETS_FONTS_DIR = path.join(ASSETS_DIR, 'fonts');
const ASSETS_PLUGINS_DIR = path.join(ASSETS_DIR, 'plugins'); // For structured complex assets if needed

const DIRS_TO_PROCESS = [
    'wp-content',
    'wp-includes',
    'wp-json'
];

let assetMap = new Map(); // original path relative to root -> new path relative to root

async function getFiles(dir, fileList = []) {
    try {
        const files = await readdir(dir);
        for (const file of files) {
            const filepath = path.join(dir, file);
            const fileStat = await stat(filepath);
            if (fileStat.isDirectory()) {
                await getFiles(filepath, fileList);
            } else {
                fileList.push(filepath);
            }
        }
    } catch (err) {
        if (err.code !== 'ENOENT') {
            console.error(`Error reading directory ${dir}:`, err);
        }
    }
    return fileList;
}

async function createDirs() {
    const dirs = [ASSETS_DIR, ASSETS_CSS_DIR, ASSETS_JS_DIR, ASSETS_IMG_DIR, ASSETS_FONTS_DIR, ASSETS_PLUGINS_DIR];
    for (const d of dirs) {
        try {
            await mkdir(d, { recursive: true });
        } catch (e) {
            if (e.code !== 'EEXIST') throw e;
        }
    }
}

function getAssetType(filename) {
    const ext = path.extname(filename).toLowerCase().replace(/\?.*$/, '');
    if (ext === '.css') return 'css';
    if (ext === '.js') return 'js';
    if (['.jpg', '.jpeg', '.png', '.gif', '.svg', '.ico', '.webp'].includes(ext)) return 'images';
    if (['.woff', '.woff2', '.ttf', '.eot', '.otf'].includes(ext)) return 'fonts';
    return 'other';
}

function generateNewFilename(originalFilename, prefix = '') {
    // Handling query strings in filenames coming from HTTrack (e.g., style.css?ver=1.0 -> style.css)
    let cleanName = originalFilename.split('?')[0];
    
    // Add prefix if duplicate name exists, but keep simplest logic for now by using prefix to avoid clashing
    if (prefix) {
        return `${prefix}-${cleanName}`;
    }
    return cleanName;
}

async function collectAssets() {
    console.log('Collecting assets...');
    for (const baseDir of DIRS_TO_PROCESS) {
        const fullDirPath = path.join(PROJECT_DIR, baseDir);
        const files = await getFiles(fullDirPath);
        
        for (const file of files) {
            const relPathOriginal = path.relative(PROJECT_DIR, file).replace(/\\/g, '/');
            const filename = path.basename(file);
            const type = getAssetType(filename);
            
            if (type === 'other') continue; // We'll ignore php/json/html in these dirs for now
            
            // To prevent naming collisions, prefix with parent directory name if needed, or structured path
            // e.g. revslider-settings.css instead of settings.css
            const pathParts = relPathOriginal.split('/');
            let prefix = '';
            if (pathParts.length > 2) {
                // Try to get a meaningful prefix from plugin/theme names
                if (relPathOriginal.includes('plugins/')) {
                    const pluginIndex = pathParts.indexOf('plugins');
                    if (pathParts[pluginIndex + 1]) prefix = pathParts[pluginIndex + 1];
                } else if (relPathOriginal.includes('themes/')) {
                   const themeIndex = pathParts.indexOf('themes');
                   if (pathParts[themeIndex + 1]) prefix = pathParts[themeIndex + 1];
                }
            }
            
            let newFilename = generateNewFilename(filename, prefix);
            let targetDir = ASSETS_DIR;
            
            if (type === 'css') targetDir = ASSETS_CSS_DIR;
            else if (type === 'js') targetDir = ASSETS_JS_DIR;
            else if (type === 'images') targetDir = ASSETS_IMG_DIR;
            else if (type === 'fonts') targetDir = ASSETS_FONTS_DIR;
            
            let newDestPath = path.join(targetDir, newFilename);
            
            // Deduplication loop
            let counter = 1;
            while (fs.existsSync(newDestPath) && assetMap.get(relPathOriginal) !== path.relative(PROJECT_DIR, newDestPath).replace(/\\/g, '/')) {
                const parsed = path.parse(newDestPath);
                newFilename = `${parsed.name}_${counter}${parsed.ext}`;
                newDestPath = path.join(targetDir, newFilename);
                counter++;
            }
            
            const newRelPath = path.relative(PROJECT_DIR, newDestPath).replace(/\\/g, '/');
            assetMap.set(relPathOriginal, newRelPath);
            
            // Copy file
            await copyFile(file, newDestPath);
        }
    }
    console.log(`Collected ${assetMap.size} assets.`);
}

function processHtmlContent(content, filepath) {
    let newContent = content;
    const depth = path.relative(PROJECT_DIR, filepath).split(path.sep).length - 1;
    const relativePrefix = depth === 0 ? '' : '../'.repeat(depth);

    // 1. Strip HTTrack Comments
    newContent = newContent.replace(/<!--\s*Mirrored from[\s\S]*?-->/gi, '');
    newContent = newContent.replace(/<!--\s*Added by HTTrack\s*-->[\s\S]*?<!--\s*\/Added by HTTrack\s*-->/gi, '');

    // 2. Rewrite Asset Paths
    // We sort the keys by length descending so we match longest (most specific) paths first
    const sortedAssets = Array.from(assetMap.keys()).sort((a, b) => b.length - a.length);

    for (const oldRelPath of sortedAssets) {
        const newRelPath = assetMap.get(oldRelPath);
        
        // Match old paths. We need to handle variations in how they might be referenced:
        // - exactly oldRelPath (if at root)
        // - ../oldRelPath (if 1 level deep)
        // - https://timbplast.com/oldRelPath (absolute URL)
        // We use regex to carefully replace
        
        // Escape regex special characters in path
        const escapedOldPath = oldRelPath.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        
        // Match exact or relative versions of the old path, inside quotes or url()
        // Attributes: href="...", src="..."
        const attrRegex = new RegExp(`(href|src)=["']([^"']*?${escapedOldPath}(?:\\?[^"']*)?)["']`, 'gi');
        newContent = newContent.replace(attrRegex, (match, attrName, foundVal) => {
             return `${attrName}="${relativePrefix}${newRelPath}"`;
        });
        
        // Inline CSS url()
        const urlRegex = new RegExp(`url\\(["']?([^"')]*(?:\\.\\.\\/)*${escapedOldPath}(?:\\?[^"')]*)?)["']?\\)`, 'gi');
        newContent = newContent.replace(urlRegex, `url(${relativePrefix}${newRelPath})`);
        
        // Data attributes
        const dataRegex = new RegExp(`data-(lazyload|thumb|url)=["']([^"']*?${escapedOldPath}(?:\\?[^"']*)?)["']`, 'gi');
        newContent = newContent.replace(dataRegex, (match, attrName) => {
            return `data-${attrName}="${relativePrefix}${newRelPath}"`;
        });
    }
    
    // 3. Clean up absolute site URLs to relative
    // Often HTTrack leaves absolute URLs for the main site domain.
    newContent = newContent.replace(/https?:\/\/(?:www\.)?timbplast\.com\//gi, relativePrefix || './');

    return newContent;
}

// Ensure CSS files themselves have correct internal paths to images/fonts
async function rewriteCssPaths() {
     console.log('Rewriting inner paths in CSS files...');
     const cssFiles = await getFiles(ASSETS_CSS_DIR);
     
     const sortedAssets = Array.from(assetMap.keys()).sort((a, b) => b.length - a.length);
     
     for (const cssFile of cssFiles) {
         let content = await readFile(cssFile, 'utf8');
         let modified = false;
         
         // CSS is in /assets/css/, so to get to /assets/images/ it's ../images/
         
         for (const oldRelPath of sortedAssets) {
             const newRelPath = assetMap.get(oldRelPath);
             const type = getAssetType(oldRelPath);
             
             if (type === 'images' || type === 'fonts') {
                 // The relative path from inside css to images/fonts is `../<type>/filename`
                 const relativeFromCss = `../${type}/${path.basename(newRelPath)}`;
                 
                 const escapedOldPath = oldRelPath.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
                 const urlRegex = new RegExp(`url\\(["']?([^"')]*(?:\\.\\.\\/)*${escapedOldPath}(?:\\?[^"')]*)?)["']?\\)`, 'gi');
                 
                 if (urlRegex.test(content)) {
                     content = content.replace(urlRegex, `url(${relativeFromCss})`);
                     modified = true;
                 }
                 
                 // Also catch just the basename if they were previously in the same folder relative
                 const basename = path.basename(oldRelPath).replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
                 const looseUrlRegex = new RegExp(`url\\(["']?([^"')]*(?:[\\/\\\\])${basename}(?:\\?[^"')]*)?)["']?\\)`, 'gi');
                  if (looseUrlRegex.test(content)) {
                     content = content.replace(looseUrlRegex, `url(${relativeFromCss})`);
                     modified = true;
                 }
             }
         }
         
         if (modified) {
             await writeFile(cssFile, content, 'utf8');
         }
     }
}

async function processAllHtml() {
    console.log('Processing HTML files...');
    const allFiles = await getFiles(PROJECT_DIR);
    const htmlFiles = allFiles.filter(f => f.endsWith('.html') && !f.includes('wp-content')); // ignore any html stubs in wp-content
    
    for (const file of htmlFiles) {
        let content = await readFile(file, 'utf8');
        const newContent = processHtmlContent(content, file);
        if (content !== newContent) {
            await writeFile(file, newContent, 'utf8');
            console.log(`Updated ${path.relative(PROJECT_DIR, file)}`);
        }
    }
}

async function removeOldDirs() {
    console.log('Removing old WordPress directories...');
    for (const dir of DIRS_TO_PROCESS) {
        const fullDirPath = path.join(PROJECT_DIR, dir);
        if (fs.existsSync(fullDirPath)) {
             await rm(fullDirPath, { recursive: true, force: true });
             console.log(`Removed ${dir}`);
        }
    }
}

async function main() {
    try {
        await createDirs();
        await collectAssets();
        await rewriteCssPaths();
        await processAllHtml();
        await removeOldDirs();
        console.log('Restructuring completed successfully.');
    } catch (err) {
        console.error('Error during restructuring:', err);
    }
}

main();
