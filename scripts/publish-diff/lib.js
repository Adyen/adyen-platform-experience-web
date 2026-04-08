import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

const EXPORT_BLOCK_RE = /export\s*\{\s*([^}]+)\s*\}/gs;
const PACKAGE_JSON_ENTRYPOINT_FIELDS = ['main', 'module', 'types', 'style', 'exports'];

export function sha256(filePath) {
    const content = readFileSync(filePath);
    return createHash('sha256').update(content).digest('hex');
}

export function walkDir(dir, base = dir) {
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

function getExportName(entry) {
    const parts = entry.trim().split(/\s+as\s+/);
    return parts[parts.length - 1]?.trim();
}

export function extractExportsFromContent(content) {
    const exports = new Set();

    for (const match of content.matchAll(EXPORT_BLOCK_RE)) {
        for (const entry of match[1].split(',')) {
            const name = getExportName(entry);

            if (name) {
                exports.add(name);
            }
        }
    }

    return [...exports].sort();
}

export function extractExports(indexPath) {
    return extractExportsFromContent(readFileSync(indexPath, 'utf-8'));
}

export function getPackageJsonFields(root) {
    const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf-8'));

    return {
        main: pkg.main ?? null,
        module: pkg.module ?? null,
        types: pkg.types ?? null,
        style: pkg.style ?? null,
        exports: pkg.exports ?? null,
    };
}

function collectPackageEntrypoints(value, field) {
    if (typeof value === 'string') {
        return [{ field, path: value }];
    }

    if (Array.isArray(value)) {
        return value.flatMap((entry, index) => collectPackageEntrypoints(entry, `${field}[${index}]`));
    }

    if (!value || typeof value !== 'object') {
        return [];
    }

    return Object.entries(value).flatMap(([key, entry]) => {
        const nextField = field === 'exports' ? `exports[${JSON.stringify(key)}]` : `${field}.${key}`;
        return collectPackageEntrypoints(entry, nextField);
    });
}

export function getMissingPackageEntrypoints(packageJson, root) {
    const entrypoints = PACKAGE_JSON_ENTRYPOINT_FIELDS.flatMap(field => collectPackageEntrypoints(packageJson[field] ?? null, field));

    return entrypoints.filter(({ path }) => !existsSync(resolve(root, path)));
}

function getTypeTreeHash(typesDir, typeFiles) {
    if (typeFiles.length === 0) {
        return null;
    }

    const manifest = typeFiles.map(filePath => `${filePath}:${sha256(resolve(typesDir, filePath))}`);

    return createHash('sha256').update(manifest.join('\n')).digest('hex');
}

export function buildSnapshot(root) {
    const dist = resolve(root, 'dist');
    const esIndex = resolve(dist, 'es/index.js');
    const cssFile = resolve(dist, 'adyen-platform-experience-web.css');
    const typesDir = resolve(dist, 'types');
    const packageJson = getPackageJsonFields(root);
    const typeFiles = walkDir(typesDir).filter(filePath => filePath.endsWith('.d.ts'));

    return {
        jsExports: existsSync(esIndex) ? extractExports(esIndex) : [],
        esFileCount: walkDir(resolve(dist, 'es')).filter(filePath => filePath.endsWith('.js')).length,
        cssHash: existsSync(cssFile) ? sha256(cssFile) : null,
        typeFiles,
        typeTreeHash: getTypeTreeHash(typesDir, typeFiles),
        missingPackageEntrypoints: getMissingPackageEntrypoints(packageJson, root),
        packageJson,
    };
}

export function diff(baseline, current) {
    const diffs = [];

    const addedExports = current.jsExports.filter(entry => !baseline.jsExports.includes(entry));
    const removedExports = baseline.jsExports.filter(entry => !current.jsExports.includes(entry));

    if (addedExports.length) diffs.push(`  JS exports added: ${addedExports.join(', ')}`);
    if (removedExports.length) diffs.push(`  JS exports removed: ${removedExports.join(', ')}`);

    if (baseline.esFileCount !== current.esFileCount) {
        diffs.push(`  ES module count: ${baseline.esFileCount} -> ${current.esFileCount}`);
    }

    if (baseline.cssHash !== current.cssHash) {
        diffs.push(`  CSS hash changed: ${baseline.cssHash?.slice(0, 12)}... -> ${current.cssHash?.slice(0, 12)}...`);
    }

    const addedTypes = current.typeFiles.filter(filePath => !baseline.typeFiles.includes(filePath));
    const removedTypes = baseline.typeFiles.filter(filePath => !current.typeFiles.includes(filePath));

    if (addedTypes.length) {
        diffs.push(`  Type files added (${addedTypes.length}): ${addedTypes.slice(0, 5).join(', ')}${addedTypes.length > 5 ? '...' : ''}`);
    }

    if (removedTypes.length) {
        diffs.push(`  Type files removed (${removedTypes.length}): ${removedTypes.slice(0, 5).join(', ')}${removedTypes.length > 5 ? '...' : ''}`);
    }

    if (addedTypes.length === 0 && removedTypes.length === 0 && baseline.typeTreeHash !== current.typeTreeHash) {
        diffs.push(
            `  Type declarations changed within existing files: ${baseline.typeTreeHash?.slice(0, 12)}... -> ${current.typeTreeHash?.slice(0, 12)}...`
        );
    }

    if (current.missingPackageEntrypoints.length) {
        const missingEntrypoints = current.missingPackageEntrypoints.map(({ field, path }) => `${field} -> ${path}`);
        diffs.push(`  package.json entrypoints missing: ${missingEntrypoints.join(', ')}`);
    }

    const baselineJson = JSON.stringify(baseline.packageJson, null, 2);
    const currentJson = JSON.stringify(current.packageJson, null, 2);

    if (baselineJson !== currentJson) {
        diffs.push('  package.json entrypoints changed');
    }

    return diffs;
}
