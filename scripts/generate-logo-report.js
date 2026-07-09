const fs = require('fs');
const path = require('path');
const { collectLogoStatuses } = require('./logo-utils');

const docsDir = path.join(process.cwd(), 'docs');
const reportPath = path.join(docsDir, 'missing-logos.md');
const statuses = collectLogoStatuses();

fs.mkdirSync(docsDir, { recursive: true });

const lines = [
  '# Missing Logos',
  '',
  `Generated from product JSON logo paths in \`products/\`.`,
  '',
];

for (const item of statuses) {
  lines.push(`## ${item.name}`);
  lines.push(`Missing: ${item.exists ? 'No' : 'Yes'}`);
  lines.push(`Logo: ${item.logo}`);
  lines.push('');
}

fs.writeFileSync(reportPath, `${lines.join('\n')}\n`);
console.log(`Generated ${path.relative(process.cwd(), reportPath)}`);
