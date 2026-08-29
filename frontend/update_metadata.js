const fs = require('fs');
const path = require('path');

function fixFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Fix the typo in SeoFields.tsx
    if (filePath.endsWith('SeoFields.tsx')) {
        content = content.replace(/thumbImg: string;\n\s+thumbImg: string;/g, 'thumbImg: string;');
    }
    
    // For generateMetadata:
    // e.g. const title = state.title; -> const title = state.seoTitle || state.title;
    content = content.replace(/const title = ([a-zA-Z0-9_]+)\.title;/g, 'const title = $1.seoTitle || $1.title;');
    
    // For cms pages (line 22 in stateSlug/page.tsx: title: cms.title)
    content = content.replace(/title:\s*([a-zA-Z0-9_]+)\.title(,?)/g, 'title: $1.seoTitle || $1.title$2');

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated metadata in ${filePath}`);
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
console.log('Finished updating metadata logic!');
