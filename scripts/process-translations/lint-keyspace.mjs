import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { grammarViolations, keyspaceViolations } from './key-grammar.mjs';

// Lints the translation keyspace against the key grammar. Two kinds of rule
// run here. The per-key rules are shared with check-key-references.mjs, which
// applies them to Bento route targets, so catalogs and the reserved keyspace
// cannot drift apart. The keyspace-wide rules need a whole catalog to see: a
// key that is also the base path of other keys, and a leaf whose camel suffix
// is doing a segment's job. Runs in CI as `translations:grammar`.

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDirectory, '../..');
// Optional argument: lint a mirrored domains tree instead of the live one,
// e.g. a staged copy of the catalogs to check them before they land.
const domainsDirectory = process.argv[2] ? path.resolve(process.argv[2]) : path.join(projectRoot, 'packages/domains');
const englishLocale = 'en-US';

const REPORT_LIMIT = 30;

// CLI tool output; one sanctioned console call site per stream.
const log = (...args) => console.log(...args); // NOSONAR: CLI report output
const logError = (...args) => console.error(...args); // NOSONAR: CLI report output

const readJson = async filePath => JSON.parse(await readFile(filePath, 'utf8'));

const check = (violations, domain, key, rule, message) => {
    violations.push(`${domain}: [${rule}] ${key} ${message}`);
};

// Grammar rules for one catalog key, delegating to the shared rules on the
// domain-relative form: catalog keys carry their owning domain as the first
// segment, which the shared rules count as one of the six allowed. The
// absolute key goes along too, because the enum-mirror registry is keyed by
// it.
const checkKey = (violations, domain, key) => {
    const relativeKey = key.startsWith(`${domain}.`) ? key.slice(domain.length + 1) : key;
    for (const { rule, message } of grammarViolations(relativeKey, key)) {
        check(violations, domain, key, rule, message);
    }
};

const lintDomainCatalog = async (violations, entry) => {
    const catalogPath = path.join(domainsDirectory, entry.name, 'vue/translations', `${englishLocale}.json`);
    let catalog;
    try {
        catalog = await readJson(catalogPath);
    } catch {
        return false;
    }
    const keys = Object.keys(catalog);
    for (const key of keys) checkKey(violations, entry.name, key);
    // Keyspace-wide rules run per domain: a domain owns its own key tree, and
    // the catalogs are merged without ever nesting one domain inside another.
    for (const { key, rule, message } of keyspaceViolations(keys)) {
        check(violations, entry.name, key, rule, message);
    }
    return true;
};

const main = async () => {
    const domainEntries = (await readdir(domainsDirectory, { withFileTypes: true })).filter(entry => entry.isDirectory());
    const violations = [];
    let checkedDomains = 0;
    for (const entry of domainEntries) {
        if (await lintDomainCatalog(violations, entry)) checkedDomains += 1;
    }

    if (violations.length === 0) {
        log(`keyspace lint passed: no grammar violations across ${checkedDomains} domain catalogs.`);
        return;
    }
    logError(`${violations.length} keyspace grammar violations across ${checkedDomains} domain catalogs:`);
    for (const violation of violations.slice(0, REPORT_LIMIT)) logError(`  ${violation}`);
    if (violations.length > REPORT_LIMIT) logError(`  … ${violations.length - REPORT_LIMIT} more`);
    process.exitCode = 1;
};

await main();
