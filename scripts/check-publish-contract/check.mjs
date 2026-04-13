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
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildSnapshot, diff } from './lib.js';

const ROOT = resolve(import.meta.dirname, '../..');
const BASELINE_PATH = resolve(import.meta.dirname, 'baseline.json');
const UPDATE_MODE = process.argv.includes('--update');

export function run() {
    const snapshot = buildSnapshot(ROOT);

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
    }

    console.error('Publish contract CHANGED:');
    for (const entry of diffs) {
      console.error(entry);
    }
    console.error('\nIf intentional, update the baseline:');
    console.error('  pnpm run publish-diff -- --update');
    process.exit(1);
}

run();
