import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { ALLOWED_DECLARATION_EXPORTS, ALLOWED_RUNTIME_EXPORTS } from './allowed-exports.js';
import ts from 'typescript';

const PACKAGE_JSON_ENTRYPOINT_FIELDS = ['main', 'module', 'types', 'style', 'exports'] as const;

interface PackageJsonFields {
    main: string | null;
    module: string | null;
    types: string | null;
    style: string | null;
    exports: Record<string, unknown> | null;
}

interface MissingEntrypoint {
    field: string;
    path: string;
}

export interface Snapshot {
    jsExports: string[];
    cjsExports: string[];
    declarationExports: string[];
    esFileCount: number;
    cssHash: string | null;
    typeFiles: string[];
    typeTreeHash: string | null;
    missingPackageEntrypoints: MissingEntrypoint[];
    packageJson: PackageJsonFields;
}

export function sha256(filePath: string): string {
    const content = readFileSync(filePath);
    return createHash('sha256').update(content).digest('hex');
}

export function walkDir(dir: string, base: string = dir): string[] {
    const results: string[] = [];
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

// ESM interop marker emitted by bundlers; not part of the public surface.
const INTEROP_EXPORT_NAMES = new Set(['__esModule']);

function resolveExportsWithChecker(indexPath: string, allowJs: boolean): string[] {
    const program = ts.createProgram({
        rootNames: [indexPath],
        options: {
            allowJs,
            module: ts.ModuleKind.ESNext,
            moduleResolution: ts.ModuleResolutionKind.Bundler,
            skipLibCheck: true,
            target: ts.ScriptTarget.ESNext,
        },
    });
    const sourceFile = program.getSourceFile(indexPath);

    if (!sourceFile) {
        throw new Error(`Could not load entrypoint: ${indexPath}`);
    }

    const checker = program.getTypeChecker();
    const moduleSymbol = checker.getSymbolAtLocation(sourceFile);
    const exports = new Set<string>();

    // The type checker understands every ES export form (re-exports, aliases, inline
    // const/function/class declarations, defaults), unlike a statement-level AST walk.
    if (moduleSymbol) {
        for (const exportSymbol of checker.getExportsOfModule(moduleSymbol)) {
            const name = exportSymbol.getName();
            if (!INTEROP_EXPORT_NAMES.has(name)) {
                exports.add(name);
            }
        }
    }

    // The checker expands `export *` into the re-exported names. Surface a wildcard marker
    // anyway so wildcard barrels fail the allowlist instead of hiding behind known names.
    if (sourceFile.statements.some(statement => ts.isExportDeclaration(statement) && !statement.exportClause)) {
        exports.add('*');
    }

    return [...exports].sort();
}

export function extractExports(indexPath: string): string[] {
    return resolveExportsWithChecker(indexPath, true);
}

export function extractDeclarationExports(indexPath: string): string[] {
    return resolveExportsWithChecker(indexPath, false);
}

function isExportsObject(expression: ts.Expression): boolean {
    return ts.isIdentifier(expression) && expression.text === 'exports';
}

function isModuleExportsObject(expression: ts.Expression): boolean {
    return (
        ts.isPropertyAccessExpression(expression) &&
        ts.isIdentifier(expression.expression) &&
        expression.expression.text === 'module' &&
        expression.name.text === 'exports'
    );
}

function getAssignedPropertyName(target: ts.Expression): string | null {
    if (ts.isPropertyAccessExpression(target)) {
        return target.name.text;
    }

    if (ts.isElementAccessExpression(target)) {
        const argument = target.argumentExpression;
        return ts.isStringLiteral(argument) || ts.isNumericLiteral(argument) ? argument.text : null;
    }

    return null;
}

function recordExportName(exports: Set<string>, name: string | null): void {
    if (name && !INTEROP_EXPORT_NAMES.has(name)) {
        exports.add(name);
    }
}

/**
 * The TypeScript checker cannot reliably enumerate CommonJS exports: it returns no module
 * symbol for bundler-emitted `.js` entry files and ignores `module.exports = { ... }`
 * reassignments. Walk the AST instead and collect every assignment shape bundlers emit.
 */
export function extractCjsExportsFromContent(content: string): string[] {
    const exports = new Set<string>();
    const sourceFile = ts.createSourceFile('index.cjs', content, ts.ScriptTarget.Latest, false, ts.ScriptKind.JS);

    const collectObjectLiteralExports = (value: ts.Expression): void => {
        if (!ts.isObjectLiteralExpression(value)) return;

        for (const property of value.properties) {
            if (ts.isPropertyAssignment(property) && !ts.isComputedPropertyName(property.name)) {
                recordExportName(exports, property.name.text);
            } else if (ts.isShorthandPropertyAssignment(property)) {
                recordExportName(exports, property.name.text);
            } else if (ts.isMethodDeclaration(property) && !ts.isComputedPropertyName(property.name)) {
                recordExportName(exports, property.name.text);
            }
        }
    };

    const visit = (node: ts.Node) => {
        if (ts.isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.EqualsToken) {
            const { left, right } = node;

            // exports.Foo = ... / module.exports.Foo = ... / exports["Foo"] = ...
            if (
                (ts.isPropertyAccessExpression(left) || ts.isElementAccessExpression(left)) &&
                (isExportsObject(left.expression) || isModuleExportsObject(left.expression))
            ) {
                recordExportName(exports, getAssignedPropertyName(left));
            }

            // module.exports = { Foo, Bar: baz, ... }
            if (isModuleExportsObject(left)) {
                collectObjectLiteralExports(right);
            }
        }

        // Object.defineProperty(exports, 'Foo', ...)
        if (ts.isCallExpression(node) && ts.isPropertyAccessExpression(node.expression)) {
            const target = node.arguments[0];
            const name = node.arguments[1];

            if (
                ts.isIdentifier(node.expression.expression) &&
                node.expression.expression.text === 'Object' &&
                node.expression.name.text === 'defineProperty' &&
                target &&
                (isExportsObject(target) || isModuleExportsObject(target)) &&
                name &&
                ts.isStringLiteral(name)
            ) {
                recordExportName(exports, name.text);
            }
        }

        ts.forEachChild(node, visit);
    };

    visit(sourceFile);
    return [...exports].sort();
}

export function extractCjsExports(indexPath: string): string[] {
    return extractCjsExportsFromContent(readFileSync(indexPath, 'utf-8'));
}

export function getPackageJsonFields(root: string): PackageJsonFields {
    const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf-8'));

    return {
        main: pkg.main ?? null,
        module: pkg.module ?? null,
        types: pkg.types ?? null,
        style: pkg.style ?? null,
        exports: pkg.exports ?? null,
    };
}

function collectPackageEntrypoints(value: unknown, field: string): MissingEntrypoint[] {
    if (typeof value === 'string') {
        return [{ field, path: value }];
    }

    if (Array.isArray(value)) {
        return value.flatMap((entry: unknown, index: number) => collectPackageEntrypoints(entry, `${field}[${index}]`));
    }

    if (!value || typeof value !== 'object') {
        return [];
    }

    return Object.entries(value).flatMap(([key, entry]) => {
        const nextField = field === 'exports' ? `exports[${JSON.stringify(key)}]` : `${field}.${key}`;
        return collectPackageEntrypoints(entry, nextField);
    });
}

export function getMissingPackageEntrypoints(packageJson: PackageJsonFields, root: string): MissingEntrypoint[] {
    const entrypoints = PACKAGE_JSON_ENTRYPOINT_FIELDS.flatMap(field => collectPackageEntrypoints(packageJson[field] ?? null, field));

    return entrypoints.filter(({ path }) => !existsSync(resolve(root, path)));
}

function getTypeTreeHash(typesDir: string, typeFiles: string[]): string | null {
    if (typeFiles.length === 0) {
        return null;
    }

    const manifest = typeFiles.map(filePath => `${filePath}:${sha256(resolve(typesDir, filePath))}`);

    return createHash('sha256').update(manifest.join('\n')).digest('hex');
}

export function buildSnapshot(root: string): Snapshot {
    const dist = resolve(root, 'dist');
    const cssFile = resolve(dist, 'adyen-platform-experience-web.css');
    const typesDir = resolve(dist, 'types');
    const packageJson = getPackageJsonFields(root);
    const esIndex = packageJson.module ? resolve(root, packageJson.module) : resolve(dist, 'es/index.js');
    const cjsIndex = packageJson.main ? resolve(root, packageJson.main) : resolve(dist, 'cjs/index.js');
    const declarationIndex = packageJson.types ? resolve(root, packageJson.types) : resolve(dist, 'types/index.d.ts');
    const typeFiles = walkDir(typesDir).filter(filePath => filePath.endsWith('.d.ts'));

    return {
        jsExports: existsSync(esIndex) ? extractExports(esIndex) : [],
        cjsExports: existsSync(cjsIndex) ? extractCjsExports(cjsIndex) : [],
        declarationExports: existsSync(declarationIndex) ? extractDeclarationExports(declarationIndex) : [],
        esFileCount: walkDir(resolve(dist, 'es')).filter(filePath => filePath.endsWith('.js')).length,
        cssHash: existsSync(cssFile) ? sha256(cssFile) : null,
        typeFiles,
        typeTreeHash: getTypeTreeHash(typesDir, typeFiles),
        missingPackageEntrypoints: getMissingPackageEntrypoints(packageJson, root),
        packageJson,
    };
}

function compareExports(label: string, allowed: readonly string[], actual: readonly string[]): string[] {
    const unexpected = actual.filter(entry => !allowed.includes(entry));
    const missing = allowed.filter(entry => !actual.includes(entry));
    const violations: string[] = [];

    if (unexpected.length) violations.push(`  ${label} exports not allowlisted: ${unexpected.join(', ')}`);
    if (missing.length) violations.push(`  ${label} exports missing: ${missing.join(', ')}`);

    return violations;
}

export function getPublicExportViolations(snapshot: Snapshot): string[] {
    const unaliasedExternalPropExports = snapshot.declarationExports.filter(entry => entry.endsWith('ExternalProps'));

    return [
        ...compareExports('ES', ALLOWED_RUNTIME_EXPORTS, snapshot.jsExports),
        ...compareExports('CommonJS', ALLOWED_RUNTIME_EXPORTS, snapshot.cjsExports),
        ...compareExports('Declaration', ALLOWED_DECLARATION_EXPORTS, snapshot.declarationExports),
        ...(unaliasedExternalPropExports.length
            ? [`  Declaration exports contain unaliased ExternalProps types: ${unaliasedExternalPropExports.join(', ')}`]
            : []),
    ];
}

export function diff(baseline: Snapshot, current: Snapshot): string[] {
    const diffs: string[] = [];

    const addedExports = current.jsExports.filter(entry => !baseline.jsExports.includes(entry));
    const removedExports = baseline.jsExports.filter(entry => !current.jsExports.includes(entry));

    if (addedExports.length) diffs.push(`  JS exports added: ${addedExports.join(', ')}`);
    if (removedExports.length) diffs.push(`  JS exports removed: ${removedExports.join(', ')}`);

    const addedCjsExports = current.cjsExports.filter(entry => !baseline.cjsExports.includes(entry));
    const removedCjsExports = baseline.cjsExports.filter(entry => !current.cjsExports.includes(entry));

    if (addedCjsExports.length) diffs.push(`  CommonJS exports added: ${addedCjsExports.join(', ')}`);
    if (removedCjsExports.length) diffs.push(`  CommonJS exports removed: ${removedCjsExports.join(', ')}`);

    const addedDeclarationExports = current.declarationExports.filter(entry => !baseline.declarationExports.includes(entry));
    const removedDeclarationExports = baseline.declarationExports.filter(entry => !current.declarationExports.includes(entry));

    if (addedDeclarationExports.length) diffs.push(`  Declaration exports added: ${addedDeclarationExports.join(', ')}`);
    if (removedDeclarationExports.length) diffs.push(`  Declaration exports removed: ${removedDeclarationExports.join(', ')}`);

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
