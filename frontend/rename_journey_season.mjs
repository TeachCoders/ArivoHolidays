import fs from 'fs';

const files = [
  '/home/rajnish/Rajnish/trip_backup/frontend/src/feature/journey/components/JourneyForm.tsx',
  '/home/rajnish/Rajnish/trip_backup/frontend/src/feature/journey/components/form-sections/JourneyBasicInfo.tsx'
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Replace Month -> Season
    content = content.replace(/Month/g, 'Season');
    
    // Replace month -> season
    content = content.replace(/month/g, 'season');
    
    fs.writeFileSync(file, content);
  }
});
