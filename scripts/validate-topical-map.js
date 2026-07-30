const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const map = JSON.parse(fs.readFileSync(path.join(root, 'strategy/topical-authority-map.json'), 'utf8'));
const productSlugs = fs.readdirSync(path.join(root, 'products')).filter((file) => file.endsWith('.json')).map((file) => file.slice(0, -5)).sort();
const errors = [];
const assert = (condition, message) => { if (!condition) errors.push(message); };

assert(map.silos.length >= 30 && map.silos.length <= 50, `Expected 30-50 pillars, found ${map.silos.length}`);
const pillarSlugs = map.silos.map((silo) => silo.pillar.slug);
assert(new Set(pillarSlugs).size === pillarSlugs.length, 'Pillar slugs must be unique');

const mapped = new Set();
for (const silo of map.silos) {
  assert(silo.guides.length >= 4, `${silo.pillar.slug}: expected at least four guides`);
  assert(silo.authority.score >= 0 && silo.authority.score <= 100, `${silo.pillar.slug}: invalid authority score`);
  for (const key of ['articleIdeas', 'pinTitles', 'imageHeadlines']) {
    assert(silo.pinterest[key].length === 10, `${silo.pillar.slug}: expected 10 ${key}`);
  }
  const guideSlugs = silo.guides.map((guide) => guide.slug);
  assert(new Set(guideSlugs).size === guideSlugs.length, `${silo.pillar.slug}: duplicate guide slug`);
  for (const guide of silo.guides) {
    for (const slug of guide.reviews) {
      assert(productSlugs.includes(slug), `${silo.pillar.slug}/${guide.slug}: unknown review ${slug}`);
      mapped.add(slug);
    }
  }
}

for (const slug of productSlugs) {
  assert(map.reviews[slug], `Missing review strategy for ${slug}`);
  assert(map.reviews[slug]?.businessIdeas.length === 3, `${slug}: expected three business ideas`);
  assert(map.reviewIndex[slug]?.primarySilo, `${slug}: missing primary silo`);
  assert(mapped.has(slug), `${slug}: not nested under any guide`);
}
assert(Object.keys(map.reviews).length === productSlugs.length, 'Review strategy contains stale or duplicate products');

if (errors.length) {
  console.error(errors.map((error) => `- ${error}`).join('\n'));
  process.exit(1);
}
console.log(`Topical map valid: ${map.silos.length} pillars, ${productSlugs.length} reviews, ${map.comparisonBacklog.length} comparisons.`);
