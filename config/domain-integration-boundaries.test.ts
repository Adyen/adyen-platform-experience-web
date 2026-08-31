import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, test } from 'vitest';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const readTypeScriptFiles = (directory: string): string =>
    readdirSync(directory, { withFileTypes: true })
        .flatMap(entry => {
            const path = join(directory, entry.name);
            if (entry.isDirectory()) return readTypeScriptFiles(path);
            return entry.name.endsWith('.ts') && !entry.name.endsWith('.test.ts') ? readFileSync(path, 'utf8') : [];
        })
        .join('\n');

describe('domain integration package boundaries', () => {
    test('publishes one minimal lifecycle entrypoint', () => {
        const integrationPackage = JSON.parse(readFileSync(join(root, 'packages/shared/domain-integration/package.json'), 'utf8'));

        expect(Object.keys(integrationPackage.exports).sort()).toEqual(['.', './package.json']);
        expect(Object.keys(integrationPackage.dependencies ?? {})).toEqual([]);
        expect(existsSync(join(root, 'packages/shared/adapter-protocol/package.json'))).toBe(false);
        expect(existsSync(join(root, 'packages/shared/portal-adapter/package.json'))).toBe(false);
        expect(existsSync(join(root, 'packages/shared/domain-adapter/package.json'))).toBe(false);
    });

    test('contains lifecycle composition without project or framework policy', () => {
        const source = readTypeScriptFiles(join(root, 'packages/shared/domain-integration/src'));

        expect(source).not.toMatch(/@integration-components|@adyen/);
        expect(source).not.toMatch(/from ['"](?:vite|vue|vue-i18n|preact)['"]/);
        expect(source).not.toMatch(/\b(?:capabilit|manifest|negotiat|protocol|translation|reports|sdk|version)\w*\b/i);
        expect(source).not.toMatch(/\bElement\b/);
    });
});
