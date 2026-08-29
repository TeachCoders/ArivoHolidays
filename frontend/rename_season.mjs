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

const files = walkSync('/home/rajnish/Rajnish/trip_backup/frontend/src/feature/season');

files.forEach(file => {
  if (file.endsWith('.ts') || file.endsWith('.tsx')) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Replace API endpoints
    content = content.replace(/\/month/g, '/season');
    
    // Replace Month -> Season
    content = content.replace(/Month/g, 'Season');
    
    // Replace month -> season (careful with variable names, e.g. month.title -> season.title)
    content = content.replace(/month/g, 'season');
    
    fs.writeFileSync(file, content);
  }
});
