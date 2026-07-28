'use strict';

const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');
const { canonicalProduct, buildRegistry } = require('../lib/facts/system');

const root = path.resolve(__dirname, '..');
const productsDir = path.join(root, 'products');
const sourceManifestPath = path.join(root, 'facts', 'sources.json');

async function readJson(file) { return JSON.parse(await fsp.readFile(file, 'utf8')); }
async function productSlugs() { return (await fsp.readdir(productsDir)).filter((file) => file.endsWith('.json')).map((file) => file.slice(0, -5)).sort(); }
async function sourceManifest() { try { return await readJson(sourceManifestPath); } catch { return { products: {} }; } }
async function productContext(slug, manifest) {
  const product = await readJson(path.join(productsDir, `${slug}.json`));
  const metadata = manifest.products?.[slug] || {};
  const canonical = canonicalProduct(product, metadata);
  return { product, metadata, canonical, registry: buildRegistry(canonical, metadata) };
}
function reviewFiles(kind = 'published') {
  const directory = path.join(root, 'content', kind, 'reviews');
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory).filter((file) => file.endsWith('.json')).map((file) => path.join(directory, file)).sort();
}

module.exports = { root, readJson, productSlugs, sourceManifest, productContext, reviewFiles };
