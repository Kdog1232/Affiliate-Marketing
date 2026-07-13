#!/usr/bin/env node
const { spawn } = require('child_process');
const fs = require('fs/promises');
const path = require('path');
const sharp = require('sharp');
const { chromium } = require('playwright');

const root = process.cwd();
const productsDir = path.join(root, 'products');
const screenshotsDir = path.join(root, 'public', 'screenshots');
const baseUrl = process.env.SCREENSHOT_BASE_URL || 'http://127.0.0.1:4173';
const forbiddenPageText = /404\s*[:\-]|page not found|not found|application error|server error|loading[.\s]*$|spinner|placeholder|replaceable/i;

async function readProducts() {
  const files = (await fs.readdir(productsDir)).filter((file) => file.endsWith('.json')).sort();
  return Promise.all(files.map(async (file) => JSON.parse(await fs.readFile(path.join(productsDir, file), 'utf8'))));
}

function startServer() {
  if (process.env.SCREENSHOT_BASE_URL) return null;
  const child = spawn('npm', ['run', 'dev', '--', '--hostname', '127.0.0.1', '--port', '4173'], {
    cwd: root,
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, NEXT_TELEMETRY_DISABLED: '1' },
  });
  child.stdout.on('data', (chunk) => process.stdout.write(`[next] ${chunk}`));
  child.stderr.on('data', (chunk) => process.stderr.write(`[next] ${chunk}`));
  return child;
}

async function waitForServer(deadlineMs = 60000) {
  const end = Date.now() + deadlineMs;
  while (Date.now() < end) {
    try {
      const response = await fetch(baseUrl, { redirect: 'manual' });
      if (response.status < 500) return;
    } catch {
      // Server is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  throw new Error(`Timed out waiting for ${baseUrl}`);
}

async function hideOverlays(page) {
  await page.addStyleTag({ content: `
    [id*="cookie" i], [class*="cookie" i], [aria-label*="cookie" i],
    [id*="consent" i], [class*="consent" i], [aria-label*="consent" i],
    [class*="modal" i], [role="dialog"], [aria-modal="true"] {
      display: none !important;
      visibility: hidden !important;
      opacity: 0 !important;
    }
    body { overflow: auto !important; }
  ` });
  for (const name of ['Accept all', 'Accept', 'Agree', 'Got it', 'Close', 'Dismiss']) {
    const button = page.getByRole('button', { name: new RegExp(name, 'i') }).first();
    if (await button.isVisible().catch(() => false)) await button.click().catch(() => {});
  }
}

async function validatePage(page, product) {
  await page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => {});
  await page.getByRole('heading', { name: /overview/i }).waitFor({ timeout: 15000 });
  await page.getByText(product.name, { exact: false }).first().waitFor({ timeout: 15000 });
  const bodyText = await page.locator('body').innerText({ timeout: 10000 });
  if (!bodyText.includes(product.name)) throw new Error(`${product.slug}: missing product title text ${product.name}`);
  if (!/\bOverview\b/i.test(bodyText)) throw new Error(`${product.slug}: missing Overview heading`);
  if (forbiddenPageText.test(bodyText)) throw new Error(`${product.slug}: page contains forbidden error/loading/placeholder text`);
  const spinnerCount = await page.locator('[aria-busy="true"], .spinner, [class*="spinner" i], [class*="loading" i]').count();
  if (spinnerCount > 0) throw new Error(`${product.slug}: page contains loading indicator elements`);
}

async function captureProduct(page, product) {
  const url = new URL(`/${product.slug}`, baseUrl).toString();
  const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
  if (!response || response.status() >= 400) throw new Error(`${product.slug}: HTTP ${response?.status() ?? 'no response'}`);
  await hideOverlays(page);
  await validatePage(page, product);
  await page.setViewportSize({ width: 1600, height: 1200 });
  const buffer = await page.screenshot({ fullPage: true, type: 'png' });
  const output = path.join(screenshotsDir, `${product.slug}-1.webp`);
  await sharp(buffer).resize({ width: 1600, withoutEnlargement: true }).webp({ quality: 82, effort: 6 }).toFile(output);
  console.log(`Saved ${path.relative(root, output)}`);
}

async function main() {
  const products = await readProducts();
  await fs.mkdir(screenshotsDir, { recursive: true });
  const server = startServer();
  try {
    await waitForServer();
    const browser = await chromium.launch();
    try {
      const page = await browser.newPage({ viewport: { width: 1600, height: 1200 }, deviceScaleFactor: 2 });
      for (const product of products) await captureProduct(page, product);
    } finally { await browser.close(); }
  } finally {
    if (server) server.kill('SIGTERM');
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
