const fs = require('fs');
const path = require('path');

function fixFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // We only want seoTitle || title in page.tsx files for metadata.
    // For other files, revert it back.
    if (!filePath.endsWith('page.tsx')) {
        content = content.replace(/([a-zA-Z0-9_]+)\.seoTitle\s*\|\|\s*\1\.title/g, '$1.title');
    }

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Reverted seoTitle in ${filePath}`);
    }
}

function walk(dir) {
    fs.readdirSync(dir).forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walk(fullPath);
        } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
            fixFile(fullPath);
        }
    });
}

walk('./src');
console.log('Finished reverting non-page files!');
