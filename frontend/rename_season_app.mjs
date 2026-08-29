import fs from 'fs';
import path from 'path';

const walkSync = function(dir, filelist) {
  let files = fs.readdirSync(dir);
  filelist = filelist || [];
  files.forEach(function(file) {
    if (fs.statSync(dir + '/' + file).isDirectory()) {
      filelist = walkSync(dir + '/' + file, filelist);
    }
    else {
      filelist.push(path.join(dir, file));
    }
  });
  return filelist;
};

const files = walkSync('/home/rajnish/Rajnish/trip_backup/frontend/src/app/(dashboard)/dashboard/season');

files.forEach(file => {
  if (file.endsWith('.ts') || file.endsWith('.tsx')) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Replace Month -> Season
    content = content.replace(/Month/g, 'Season');
    
    // Replace month -> season
    content = content.replace(/month/g, 'season');
    
    fs.writeFileSync(file, content);
  }
});
