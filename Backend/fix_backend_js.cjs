const fs = require('fs');
const path = require('path');

const targetFiles = [
    'router/country.js',
    'router/state.js',
    'router/city.js',
    'router/month.js',
    'router/travelExperience.js',
    'router/journey.js',
    'router/cmsPage.js',
    'router/blogPost.js',
    'utils/createCmsRouter.js'
].map(f => path.join(__dirname, f));

targetFiles.forEach(filePath => {
    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');
        
        // description -> seoDescription
        // Careful with regex to only match the property name or z.string()
        content = content.replace(/\bdescription\b/g, 'seoDescription');
        
        // keyword -> seoKeyword
        content = content.replace(/\bkeyword\b/g, 'seoKeyword');
        
        // shortDesc -> overView
        content = content.replace(/\bshortDesc\b/g, 'overView');

        // Note: moreDescription stays moreDescription
        
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated ${filePath}`);
    }
});
