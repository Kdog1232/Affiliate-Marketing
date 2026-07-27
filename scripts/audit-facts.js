#!/usr/bin/env node
'use strict';

const fs = require('fs/promises');
const path = require('path');
const { validateReview, staleFacts } = require('../lib/facts/system');
const { root, readJson, productSlugs, sourceManifest, productContext, reviewFiles } = require('./fact-utils');

function bullets(items, render = (item) => String(item)) { return items.length ? items.map((item) => `  - ${render(item)}`).join('\n') : '  - None'; }

(async () => {
  const manifest = await sourceManifest();
  const reviews = new Map();
  for (const file of reviewFiles('published')) reviews.set(path.basename(file, '.json'), file);
  const sections = [];
  for (const slug of await productSlugs()) {
    const { canonical, registry } = await productContext(slug, manifest);
    const stale = staleFacts(registry);
    const file = reviews.get(slug);
    const report = file ? validateReview(await readJson(file), registry) : null;
    sections.push([
      `## ${canonical.productName} (\`${slug}\`)`,
      `- Publication status: **${report?.publicationStatus || 'NO PUBLISHED REVIEW'}**`,
      `- Accuracy: ${report ? `${report.overallAccuracyScore}%` : 'N/A'}`,
      `- Last verified: ${canonical.lastVerifiedDate || 'Missing'}`,
      `- Fact coverage: ${report ? `${report.factCoveragePercent}%` : 'N/A'}`,
      '- Unsupported statements:', bullets(report?.unsupportedClaims || [], (claim) => `\`${claim.text}\``),
      '- Unknown statements:', bullets(report?.unknownClaims || [], (claim) => `\`${claim.text}\``),
      '- Missing sources/facts:', bullets(report?.missingFacts || Object.keys(canonical).filter((key) => canonical[key] === null), (item) => `\`${item}\``),
      '- Stale facts:', bullets(stale, (fact) => `\`${fact.id}\``),
      '- Hallucinated features:', bullets((report?.unsupportedClaims || []).filter((claim) => /feature|integration|model|api|plan|price|certif|compliance/i.test(claim.text)), (claim) => `\`${claim.text}\``),
    ].join('\n'));
  }
  const sourceDates = Object.values(manifest.products || {}).map((item) => item.lastVerifiedDate).filter(Boolean).sort();
  const auditDate = sourceDates.at(-1) || 'No source verification date';
  const output = `# Repository Fact Accuracy Audit\n\nSource snapshot: ${auditDate}\n\nThis report treats omitted canonical fields as unknown; generators must omit them rather than guess.\n\n${sections.join('\n\n')}\n`;
  const destination = path.join(root, 'docs', 'fact-accuracy-audit.md');
  await fs.writeFile(destination, output);
  console.log(`Wrote ${path.relative(root, destination)}`);
})().catch((error) => { console.error(error); process.exit(1); });
