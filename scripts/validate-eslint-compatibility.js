#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const semver = require('semver');

const root = path.resolve(__dirname, '..');
const lock = require(path.join(root, 'package-lock.json'));
const packages = lock.packages || {};
const errors = [];

function locked(name) {
  const entry = packages[`node_modules/${name}`];
  if (!entry?.version) errors.push(`${name} is not installed at the lockfile root.`);
  return entry;
}

function requirePeer(owner, dependency, version) {
  const ownerEntry = locked(owner);
  const range = ownerEntry?.peerDependencies?.[dependency];
  if (!range) return errors.push(`${owner} does not declare a ${dependency} compatibility range.`);
  if (!semver.satisfies(version, range)) errors.push(`${dependency}@${version} is unsupported by ${owner}@${ownerEntry.version}; expected ${range}.`);
}

const next = locked('next');
const nextConfig = locked('eslint-config-next');
const eslint = locked('eslint');
const react = locked('react');
const reactDom = locked('react-dom');
const typescript = locked('typescript');
const rushstack = locked('@rushstack/eslint-patch');

if (next?.version !== nextConfig?.version) errors.push(`next@${next?.version} and eslint-config-next@${nextConfig?.version} must have identical versions.`);
requirePeer('eslint-config-next', 'eslint', eslint?.version);
requirePeer('eslint-config-next', 'typescript', typescript?.version);
requirePeer('next', 'react', react?.version);
requirePeer('next', 'react-dom', reactDom?.version);

const eslintInstallations = Object.entries(packages).filter(([key, value]) => key.endsWith('node_modules/eslint') && value?.version);
if (eslintInstallations.length !== 1) errors.push(`Expected exactly one ESLint installation, found ${eslintInstallations.length}: ${eslintInstallations.map(([key, value]) => `${key}@${value.version}`).join(', ')}`);

const nextDependencies = nextConfig?.dependencies || {};
if (!nextDependencies['@rushstack/eslint-patch']) errors.push('eslint-config-next no longer declares @rushstack/eslint-patch; review and remove the legacy FlatCompat configuration.');
if (!rushstack) errors.push('eslint-config-next requires @rushstack/eslint-patch, but it is absent from the lockfile.');
if (rushstack && nextDependencies['@rushstack/eslint-patch'] && !semver.satisfies(rushstack.version, nextDependencies['@rushstack/eslint-patch'])) errors.push(`@rushstack/eslint-patch@${rushstack.version} is unsupported by eslint-config-next@${nextConfig.version}; expected ${nextDependencies['@rushstack/eslint-patch']}.`);

const config = fs.readFileSync(path.join(root, 'eslint.config.mjs'), 'utf8');
if (/from ['"]eslint-config-next['"]/.test(config)) errors.push('Do not import the legacy eslint-config-next object directly from flat config; use FlatCompat with next/core-web-vitals and next/typescript.');
if (/eslint-patch/.test(config)) errors.push('Do not import @rushstack/eslint-patch directly; eslint-config-next owns that transitive patch.');
if (!config.includes('FlatCompat') || !config.includes('next/core-web-vitals') || !config.includes('next/typescript')) errors.push('eslint.config.mjs must use the supported Next 15 FlatCompat configuration.');

if (errors.length) {
  console.error('ESLint/Next.js compatibility validation failed:\n- ' + errors.join('\n- '));
  process.exit(1);
}

console.log(`Compatible toolchain: next=${next.version}, react=${react.version}, eslint=${eslint.version}, eslint-config-next=${nextConfig.version}, @rushstack/eslint-patch=${rushstack.version}, typescript=${typescript.version}; ESLint installations=1.`);
