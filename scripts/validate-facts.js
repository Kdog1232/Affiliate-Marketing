#!/usr/bin/env node
'use strict';

const path = require('path');
const { validateReview, staleFacts } = require('../lib/facts/system');
const { readJson, sourceManifest, productContext, reviewFiles } = require('./fact-utils');

(async () => {
  const manifest = await sourceManifest();
  const reports = [];
  for (const file of [...reviewFiles('published'), ...reviewFiles('drafts')]) {
    const review = await readJson(file);
    const { registry } = await productContext(review.productSlug, manifest);
    const report = validateReview(review, registry, { minimumScore: 98 });
    const stale = staleFacts(registry);
    reports.push({ file: path.relative(process.cwd(), file), ...report, staleFacts: stale.map((fact) => fact.id) });
  }
  for (const report of reports) {
    console.log(`${report.publicationStatus === 'APPROVED' ? 'PASS' : 'FAIL'} ${report.file}: accuracy=${report.overallAccuracyScore}% unknown=${report.unknownClaims.length} unsupported=${report.unsupportedClaims.length} conflicts=${report.conflictingClaims.length}`);
  }
  const failed = reports.filter((report) => report.publicationStatus !== 'APPROVED');
  if (failed.length) {
    console.error(`Fact validation rejected ${failed.length} review(s). Run npm run audit:facts for details.`);
    process.exitCode = 1;
  }
})().catch((error) => { console.error(error); process.exit(1); });
