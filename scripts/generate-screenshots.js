#!/usr/bin/env node
const { spawn } = require('node:child_process');
const fs = require('node:fs/promises');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const host = process.env.SCREENSHOT_HOST || '127.0.0.1';
const port = Number(process.env.SCREENSHOT_PORT || 3000);
const baseUrl = process.env.SCREENSHOT_BASE_URL || `http://${host}:${port}`;
const outputDir = path.join(root, process.env.SCREENSHOT_OUTPUT_DIR || 'public/screenshots/generated');
const timeoutMs = Number(process.env.SCREENSHOT_TIMEOUT_MS || 60000);

function run(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd: root, stdio: 'inherit', shell: process.platform === 'win32', ...options });
    child.on('error', reject);
    child.on('exit', (code) => code === 0 ? resolve() : reject(new Error(`${command} ${args.join(' ')} exited with ${code}`)));
  });
}

async function waitForSite() {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    try {
      const response = await fetch(baseUrl, { signal: AbortSignal.timeout(2000) });
      if (response.ok || response.status < 500) return;
    } catch {
      // The server is still starting; keep polling until the timeout expires.
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  throw new Error(`Timed out waiting for ${baseUrl}. Next.js screenshots use port ${port}, not Vite's 4173 preview port.`);
}

async function loadRoutes() {
  const productDir = path.join(root, 'products');
  const productFiles = (await fs.readdir(productDir)).filter((file) => file.endsWith('.json')).sort();
  const productRoutes = await Promise.all(productFiles.map(async (file) => {
    const product = JSON.parse(await fs.readFile(path.join(productDir, file), 'utf8'));
    return { name: product.slug, path: `/${product.slug}` };
  }));
  return [{ name: 'home', path: '/' }, ...productRoutes];
}

async function captureScreenshots() {
  const { chromium } = require('@playwright/test');

  await fs.mkdir(outputDir, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1600, height: 1000 }, deviceScaleFactor: 1 });
  const routes = await loadRoutes();
  const files = [];

  for (const route of routes) {
    const target = new URL(route.path, baseUrl).toString();
    const file = path.join(outputDir, `${route.name}.png`);
    console.log(`Capturing ${target} -> ${path.relative(root, file)}`);
    await page.goto(target, { waitUntil: 'networkidle', timeout: timeoutMs });
    await page.screenshot({ path: file, fullPage: true });
    files.push(file);
  }

  await browser.close();
  return files;
}

async function validate(files) {
  for (const file of files) {
    const stats = await fs.stat(file);
    if (stats.size < 1000) throw new Error(`Screenshot validation failed for ${path.relative(root, file)}: file is too small (${stats.size} bytes).`);
  }
  console.log(`Validated ${files.length} screenshots in ${path.relative(root, outputDir)}.`);
}

async function main() {
  console.log('Building Next.js app for local screenshot capture. This is separate from production deployment builds.');
  await run('npm', ['run', 'build']);

  const server = spawn('npx', ['next', 'start', '-H', host, '-p', String(port)], { cwd: root, stdio: 'inherit', shell: process.platform === 'win32' });
  const stopServer = () => {
    if (!server.killed) server.kill('SIGTERM');
  };
  process.on('exit', stopServer);
  process.on('SIGINT', () => { stopServer(); process.exit(130); });
  process.on('SIGTERM', () => { stopServer(); process.exit(143); });

  try {
    await waitForSite();
    const files = await captureScreenshots();
    await validate(files);
  } finally {
    stopServer();
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
