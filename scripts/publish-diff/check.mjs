#!/usr/bin/env node
/**
 * Compares the current build output against a checked-in baseline to detect
 * accidental changes to the public surface: JS exports, CSS, .d.ts files,
 * and package.json entrypoints.
 *
 * Usage:
 *   pnpm run publish-diff                 # compare against baseline
 *   pnpm run publish-diff:update          # regenerate baseline
 */
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { resolve, relative, join } from 'node:path';

const ROOT = resolve(import.meta.dirname, '../..');
const DIST = resolve(ROOT, 'dist');
const BASELINE_PATH = resolve(import.meta.dirname, 'baseline.json');
const UPDATE_MODE = process.argv.includes('--update');

function sha256(filePath) {
    const content = readFileSync(filePath);
    return createHash('sha256').update(content).digest('hex');
}

function walkDir(dir, base = dir) {
    const results = [];
    if (!existsSync(dir)) return results;
    for (const entry of readdirSync(dir)) {
        const full = join(dir, entry);
        if (statSync(full).isDirectory()) {
            results.push(...walkDir(full, base));
        } else {
            results.push(relative(base, full));
        }
    }
    return results.sort();
}

function extractExports(indexPath) {
    const content = readFileSync(indexPath, 'utf-8');
    const exports = [];
    const re = /(\w+) as (\w+)/g;
    let match;
    while ((match = re.exec(content)) !== null) {
        exports.push(match[2]);
    }
    // Also capture default export or direct export names
    const directRe = /export\s*\{\s*([^}]+)\}/g;
    while ((match = directRe.exec(content)) !== null) {
        const names = match[1].split(',').map(s => {
            const parts = s.trim().split(/\s+as\s+/);
            return parts[parts.length - 1]?.trim();
        }).filter(Boolean);
        for (const name of names) {
            if (!exports.includes(name)) exports.push(name);
        }
    }
    return exports.sort();
}

function getPackageJsonFields() {
    const pkg = JSON.parse(readFileSync(resolve(ROOT, 'package.json'), 'utf-8'));
    return {
        main: pkg.main ?? null,
        module: pkg.module ?? null,
        types: pkg.types ?? null,
        style: pkg.style ?? null,
        exports: pkg.exports ?? null,
    };
}

function buildSnapshot() {
    const esIndex = resolve(DIST, 'es/index.js');
    const cssFile = resolve(DIST, 'adyen-platform-experience-web.css');
    const typesDir = resolve(DIST, 'types');
    const typesEntry = resolve(typesDir, 'index.d.ts');

    return {
        jsExports: existsSync(esIndex) ? extractExports(esIndex) : [],
        esFileCount: walkDir(resolve(DIST, 'es')).filter(f => f.endsWith('.js')).length,
        cssHash: existsSync(cssFile) ? sha256(cssFile) : null,
        typeFiles: walkDir(typesDir).filter(f => f.endsWith('.d.ts')),
        typeEntryHash: existsSync(typesEntry) ? sha256(typesEntry) : null,
        packageJson: getPackageJsonFields(),
    };
}

function diff(baseline, current) {
    const diffs = [];

    // JS exports
    const addedExports = current.jsExports.filter(e => !baseline.jsExports.includes(e));
    const removedExports = baseline.jsExports.filter(e => !current.jsExports.includes(e));
    if (addedExports.length) diffs.push(`  JS exports added: ${addedExports.join(', ')}`);
    if (removedExports.length) diffs.push(`  JS exports removed: ${removedExports.join(', ')}`);

    // ES file count
    if (baseline.esFileCount !== current.esFileCount) {
        diffs.push(`  ES module count: ${baseline.esFileCount} -> ${current.esFileCount}`);
    }

    // CSS
    if (baseline.cssHash !== current.cssHash) {
        diffs.push(`  CSS hash changed: ${baseline.cssHash?.slice(0, 12)}... -> ${current.cssHash?.slice(0, 12)}...`);
    }

    // Type files
    const addedTypes = current.typeFiles.filter(f => !baseline.typeFiles.includes(f));
    const removedTypes = baseline.typeFiles.filter(f => !current.typeFiles.includes(f));
    if (addedTypes.length) diffs.push(`  Type files added (${addedTypes.length}): ${addedTypes.slice(0, 5).join(', ')}${addedTypes.length > 5 ? '...' : ''}`);
    if (removedTypes.length) diffs.push(`  Type files removed (${removedTypes.length}): ${removedTypes.slice(0, 5).join(', ')}${removedTypes.length > 5 ? '...' : ''}`);

    // Type entry hash
    if (baseline.typeEntryHash !== current.typeEntryHash) {
        diffs.push(`  Type entry hash changed: ${baseline.typeEntryHash?.slice(0, 12)}... -> ${current.typeEntryHash?.slice(0, 12)}...`);
    }

    // package.json fields
    const baselineJson = JSON.stringify(baseline.packageJson, null, 2);
    const currentJson = JSON.stringify(current.packageJson, null, 2);
    if (baselineJson !== currentJson) {
        diffs.push(`  package.json entrypoints changed`);
    }

    return diffs;
}

// --- Main ---

const snapshot = buildSnapshot();

if (UPDATE_MODE) {
    writeFileSync(BASELINE_PATH, JSON.stringify(snapshot, null, 4) + '\n');
    console.log(`Baseline updated (${BASELINE_PATH})`);
    console.log(`  JS exports: ${snapshot.jsExports.length}`);
    console.log(`  ES modules: ${snapshot.esFileCount}`);
    console.log(`  Type files: ${snapshot.typeFiles.length}`);
    process.exit(0);
}

if (!existsSync(BASELINE_PATH)) {
    console.error('No baseline found. Run with --update to create one:');
    console.error('  node scripts/publish-diff/check.mjs --update');
    process.exit(1);
}

const baseline = JSON.parse(readFileSync(BASELINE_PATH, 'utf-8'));
const diffs = diff(baseline, snapshot);

if (diffs.length === 0) {
    console.log('Publish contract: no changes detected');
    process.exit(0);
} else {
    console.error('Publish contract CHANGED:');
    for (const d of diffs) console.error(d);
    console.error('\nIf intentional, update the baseline:');
    console.error('  pnpm run publish-diff -- --update');
    process.exit(1);
}
