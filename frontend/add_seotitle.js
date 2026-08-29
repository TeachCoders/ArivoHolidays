const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    
    // In types: h1Title?: string;
    content = content.replace(/h1Title\?: string;/g, 'seoTitle?: string;\n  h1Title?: string;');
    
    // In forms defaultValues: h1Title: initialData?.h1Title || "",
    content = content.replace(/h1Title:\s*initialData\?\.h1Title\s*\|\|\s*\"\",/g, 'seoTitle: initialData?.seoTitle || "",\n      h1Title: initialData?.h1Title || "",');
    
    // In form submit/prepare data: h1Title: formData.h1Title.trim() || undefined,
    content = content.replace(/h1Title:\s*formData\.h1Title\.trim\(\)\s*\|\|\s*undefined,/g, 'seoTitle: formData.seoTitle.trim() || undefined,\n      h1Title: formData.h1Title.trim() || undefined,');
    
    // Same but without formData prefix (some use seoData or just destructured)
    content = content.replace(/h1Title:\s*seoData\.h1Title\.trim\(\)\s*\|\|\s*undefined,/g, 'seoTitle: seoData.seoTitle.trim() || undefined,\n      h1Title: seoData.h1Title.trim() || undefined,');
    
    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Added seoTitle to ${filePath}`);
    }
}

function walk(dir) {
    fs.readdirSync(dir).forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walk(fullPath);
        } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
            replaceInFile(fullPath);
        }
    });
}

walk('./src/feature');
console.log('Finished adding seoTitle to types and forms!');
