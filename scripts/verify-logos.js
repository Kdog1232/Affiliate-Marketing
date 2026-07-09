const fs = require('fs');
const path = require('path');

const productsDir = path.join(process.cwd(), 'products');
const publicDir = path.join(process.cwd(), 'public');

function collectProducts() {
  return fs.readdirSync(productsDir)
    .filter((file) => file.endsWith('.json'))
    .flatMap((file) => {
      const product = JSON.parse(fs.readFileSync(path.join(productsDir, file), 'utf8'));
      const items = [{ name: product.name, logo: product.logo }];
      for (const alternative of product.alternatives || []) {
        items.push({ name: alternative.name, logo: alternative.logo });
      }
      return items;
    });
}

let missingCount = 0;
const seen = new Set();

for (const product of collectProducts()) {
  const logo = (product.logo || '').trim();
  if (!logo || seen.has(`${product.name}:${logo}`)) continue;
  seen.add(`${product.name}:${logo}`);

  const relativeLogoPath = logo.replace(/^\//, '');
  const logoPath = path.join(publicDir, relativeLogoPath);
  const exists = fs.existsSync(logoPath);
  const status = exists ? '✓ Existing' : '✗ Missing';

  if (!exists) missingCount += 1;
  console.log(`${status} ${logo} (${product.name})`);
}

if (missingCount > 0) {
  console.log(`\n${missingCount} missing logo file${missingCount === 1 ? '' : 's'}; ProductLogo will render fallbacks until SVGs are added.`);
}
