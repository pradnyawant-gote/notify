const fs = require('node:fs');
const path = require('node:path');
const sharp = require(process.env.DAYFLOW_SHARP_PATH || 'sharp');
const assets = path.resolve(__dirname, '../assets');
async function main() {
  await sharp(fs.readFileSync(path.join(assets, 'icon.svg')))
    .png()
    .toFile(path.join(assets, 'icon.png'));
  await sharp(fs.readFileSync(path.join(assets, 'adaptive-icon.svg')))
    .png()
    .toFile(path.join(assets, 'adaptive-icon.png'));
  await sharp(fs.readFileSync(path.join(assets, 'icon.svg')))
    .resize(64, 64)
    .png()
    .toFile(path.join(assets, 'favicon.png'));
}
main().catch((e) => {
  console.error(e.message);
  process.exitCode = 1;
});
