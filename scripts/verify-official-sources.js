#!/usr/bin/env node
'use strict';

const fs = require('fs/promises');
const path = require('path');
const crypto = require('crypto');
const { root, productSlugs, sourceManifest, productContext } = require('./fact-utils');

const CACHE = path.join(root, '.cache', 'official-sources');
const MAX_BYTES = 2_000_000;

(async () => {
  const manifest = await sourceManifest();
  await fs.mkdir(CACHE, { recursive: true });
  let failures = 0;
  for (const slug of await productSlugs()) {
    const { canonical, metadata } = await productContext(slug, manifest);
    const urls = [...new Set([canonical.officialUrl, ...(canonical.officialDocumentation || []), ...(metadata.pricingPages || []), ...(metadata.releaseNotes || []), ...(metadata.helpCenters || []), ...(metadata.developerDocs || []), ...(metadata.integrationDocs || []), ...(metadata.apiDocs || [])].filter(Boolean))];
    for (const url of urls) {
      try {
        const response = await fetch(url, { redirect: 'follow', headers: { 'user-agent': 'AffiliateMarketingFactVerifier/1.0' }, signal: AbortSignal.timeout(20000) });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const body = (await response.text()).slice(0, MAX_BYTES);
        const key = crypto.createHash('sha256').update(url).digest('hex');
        await fs.writeFile(path.join(CACHE, `${key}.json`), JSON.stringify({ url, finalUrl: response.url, status: response.status, verifiedAt: new Date().toISOString(), sha256: crypto.createHash('sha256').update(body).digest('hex'), body }, null, 2));
        console.log(`Verified ${slug}: ${url}`);
      } catch (error) { failures += 1; console.error(`Failed ${slug}: ${url} (${error.message})`); }
    }
  }
  if (failures) process.exitCode = 1;
})().catch((error) => { console.error(error); process.exit(1); });
