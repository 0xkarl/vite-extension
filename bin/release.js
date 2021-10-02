const fs = require('fs');

main();

function main() {
  const version = process.env.RELEASE;
  write('/../package.json', version);
  write('/../src/public/manifest.json', version);
}

function write(filePath, version) {
  const f = __dirname + filePath;
  const d = JSON.parse(fs.readFileSync(f, 'utf8'));
  d.version = version;
  fs.writeFileSync(f, JSON.stringify(d, null, 2), 'utf8');
}