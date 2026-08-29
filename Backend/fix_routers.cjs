const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Zod schema
    content = content.replace(/pageTitle:\s*z\.string\(\)\.optional\(\),?/g, 'seoTitle: z.string().optional(),\n  h1Title: z.string().optional(),');
    
    // Select objects
    content = content.replace(/pageTitle:\s*true,?/g, 'seoTitle: true,\n    h1Title: true,');
    
    // bannerTile
    content = content.replace(/bannerTile/g, 'bannerTitle');
    
    fs.writeFileSync(filePath, content, 'utf8');
}

const dirs = ['./router', './utils'];
dirs.forEach(dir => {
    fs.readdirSync(dir).forEach(file => {
        if (file.endsWith('.js')) {
            replaceInFile(path.join(dir, file));
        }
    });
});
console.log('Fixed backend routers and utils!');
