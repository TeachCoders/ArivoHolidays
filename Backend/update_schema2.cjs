const fs = require('fs');

const path = './prisma/schema.prisma';
let content = fs.readFileSync(path, 'utf8');

const targetModels = [
    'Country', 'State', 'City', 'Month', 
    'TravelExperience', 'Journey', 'CmsPage', 'BlogPost'
];

targetModels.forEach(model => {
    // Find the block for the model
    const regex = new RegExp(`(model ${model} \\{[\\s\\S]*?\\})`);
    content = content.replace(regex, (match) => {
        let updated = match.replace(/(\s+)description(\s+)String(\s+)/g, '$1seoDescription$2String$3');
        updated = updated.replace(/(\s+)keyword(\s+)String\?(\s+)/g, '$1seoKeyword$2String?$3');
        updated = updated.replace(/(\s+)shortDesc(\s+)String\?(\s+)/g, '$1overView$2String?$3');
        return updated;
    });
});

fs.writeFileSync(path, content, 'utf8');
console.log('Schema updated again.');
