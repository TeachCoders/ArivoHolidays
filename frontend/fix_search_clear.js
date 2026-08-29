const fs = require('fs');

const files = [
  './src/feature/state/components/StateClient.tsx',
  './src/feature/city/components/CityClient.tsx',
  './src/feature/journey/components/JourneyClient.tsx',
  './src/feature/travelExperience/components/TravelExperienceClient.tsx',
  './src/feature/season/components/SeasonClient.tsx'
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  const newContent = content.replace(/onChange:\s*\([^)]*\)\s*=>\s*\{([^}]*set[A-Z][a-zA-Z]*\(e\.target\.value\);?)([^}]*)\}/g, (match, p1, p2) => {
    if (match.includes('setSearch("') || match.includes('setSearch(e.target.value)')) return match;
    return `onChange: (e) => {${p1}\n              setSearch("");${p2}}`;
  });
  
  if (content !== newContent) {
    fs.writeFileSync(file, newContent);
    console.log(`Updated ${file}`);
  }
}
