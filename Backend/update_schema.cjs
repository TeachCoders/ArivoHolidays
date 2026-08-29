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
        let updated = match.replace(/\bdescription\s+String\b/, 'seoDescription String');
        updated = updated.replace(/\bkeyword\s+String\?\b/, 'seoKeyword    String?');
        updated = updated.replace(/\bshortDesc\s+String\?\b/, 'overView      String?');
        return updated;
    });
});

fs.writeFileSync(path, content, 'utf8');
console.log('Schema updated.');
