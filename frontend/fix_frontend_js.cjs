const fs = require('fs');
const path = require('path');

const targetDirs = [
    'src/feature/country',
    'src/feature/state',
    'src/feature/city',
    'src/feature/month',
    'src/feature/travelExperience',
    'src/feature/journey',
    'src/feature/cms',
    'src/feature/blog',
    'src/feature/destinations',
    'src/components/shared',
    'src/app/(site)'
].map(d => path.join(__dirname, d));

function replaceInFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Only do replacements if not TourPackage related (just to be safe)
    if (!filePath.includes('tourPackages') && !filePath.includes('TourPackage')) {
        content = content.replace(/\bdescription\b/g, 'seoDescription');
        // moreDescription gets changed to moreseoDescription by previous regex, we must fix it
        content = content.replace(/\bmoreseoDescription\b/g, 'moreDescription');
        // Also shortseoDescription to shortDescription
        content = content.replace(/\bshortseoDescription\b/g, 'shortDescription');

        content = content.replace(/\bkeyword\b/g, 'seoKeyword');
        content = content.replace(/\bshortDesc\b/g, 'overView');
    }

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated ${filePath}`);
    }
}

function walk(dir) {
    if (!fs.existsSync(dir)) return;
    fs.readdirSync(dir).forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walk(fullPath);
        } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
            replaceInFile(fullPath);
        }
    });
}

targetDirs.forEach(dir => walk(dir));
console.log('Frontend updated!');
