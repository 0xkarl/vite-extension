const join = require('path').join;
const sharp = require('sharp');

const sizes = '19 32 38 48 64 96 128 512'.split(' ').map((n) => parseInt(n));
const input = join(__dirname, '../src/popup/images/logo.png');

main().then(
  () => {
    console.log('done');
    process.exit(0);
  },
  (err) => {
    console.log(err);
    process.exit(-1);
  }
);

async function main() {
  await Promise.all(sizes.map(resize));
}

function resize(size) {
  console.log(`resizing ${size}`);
  const output = join(__dirname, `../src/public/images/icon-${size}.png`);
  return sharp(input).resize(size, size).toFile(output);
}
