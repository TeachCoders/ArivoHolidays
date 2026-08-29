const fs = require('fs');

const files = [
  './src/feature/state/components/StateClient.tsx',
  './src/feature/city/components/CityClient.tsx'
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  
  // Find setSearch(""); and add setIsActive(""); right after it inside countryId/stateId/cityId blocks.
  // Actually, wait, it's easier to just find setSearch(""); and replace it with setSearch("");\n              setIsActive("");
  // BUT we don't want to add setIsActive("") to the isActive dropdown itself, because that would immediately clear the active dropdown!
  
  // So we only replace it if it's NOT inside the isActive dropdown.
  // How to distinguish? The isActive dropdown has: setIsActive(e.target.value);
  const newContent = content.replace(/(setSearch\(""\);)/g, (match, p1, offset, string) => {
    // Check if the surrounding block is for isActive
    const slice = string.slice(Math.max(0, offset - 100), offset);
    if (slice.includes("setIsActive(e.target.value)")) {
      return match; // Don't add it here
    }
    return `setSearch("");\n              setIsActive("");`;
  });
  
  if (content !== newContent) {
    fs.writeFileSync(file, newContent);
    console.log(`Updated ${file}`);
  }
}
