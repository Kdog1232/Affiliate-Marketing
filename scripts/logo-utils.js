const fs = require('fs');
const path = require('path');

const SUPPORTED_LOGO_EXTENSIONS = new Set(['.svg', '.png', '.webp']);
const productsDir = path.join(process.cwd(), 'products');
const publicDir = path.join(process.cwd(), 'public');

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function collectProductLogos() {
  return fs.readdirSync(productsDir)
    .filter((file) => file.endsWith('.json'))
    .sort((a, b) => a.localeCompare(b))
    .flatMap((file) => {
      const product = readJson(path.join(productsDir, file));
      const items = [{ name: product.name, logo: product.logo, source: file }];

      for (const alternative of product.alternatives || []) {
        items.push({
          name: alternative.name,
          logo: alternative.logo,
          source: `${file}#alternatives`,
        });
      }

      return items;
    });
}

function logoStatus(item) {
  const logo = (item.logo || '').trim();
  const extension = path.extname(logo).toLowerCase();
  const isSupported = SUPPORTED_LOGO_EXTENSIONS.has(extension);
  const relativeLogoPath = logo.replace(/^\//, '');
  const logoPath = path.join(publicDir, relativeLogoPath);
  const exists = Boolean(logo) && isSupported && fs.existsSync(logoPath);

  return {
    ...item,
    logo,
    exists,
    isSupported,
    logoPath,
    relativeLogoPath,
  };
}

function collectLogoStatuses() {
  const seen = new Set();

  return collectProductLogos()
    .map(logoStatus)
    .filter((item) => {
      const key = `${item.name}:${item.logo}`;
      if (!item.logo || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

module.exports = {
  SUPPORTED_LOGO_EXTENSIONS,
  collectLogoStatuses,
  publicDir,
};
