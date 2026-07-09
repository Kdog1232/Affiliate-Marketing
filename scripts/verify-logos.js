const { collectLogoStatuses } = require('./logo-utils');

const statuses = collectLogoStatuses();
const missing = statuses.filter((item) => !item.exists);

for (const item of statuses) {
  const status = item.exists ? '✓ Found' : '✗ Missing';
  const reason = item.isSupported ? '' : ' (unsupported file type; use SVG, PNG, or WEBP)';
  console.log(`${status} ${item.logo} (${item.name})${reason}`);
}

if (missing.length > 0) {
  console.log(`\n${missing.length} missing logo file${missing.length === 1 ? '' : 's'}; ProductLogo will render fallbacks until assets are added.`);
}
