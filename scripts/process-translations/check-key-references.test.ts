/**
 * @vitest-environment node
 */
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { expect, test } from 'vitest';
import { createTranslationsProject, runProcessTranslationsScript } from './testing/testProject';

// The shared fixture catalogs only carry two-segment keys, which the key
// grammar reserves for non-keys, so these tests install their own.
const CATALOG = {
    'alpha.greeting.title': 'Hello',
    'alpha.list.amount': 'Amount',
    'alpha.list.status': 'Status',
    'alpha.statuses.paid': 'Paid',
    'alpha.statuses.pending': 'Pending',
    'alpha.statuses.pendingDescription': 'Waiting',
    'beta.greeting.title': 'Hi',
};

const createProjectRoot = (): string => {
    const root = mkdtempSync(join(tmpdir(), 'process-translations-'));
    createTranslationsProject(root);
    writeFileSync(join(root, 'packages/sdk/translations/en-US.json'), `${JSON.stringify(CATALOG, null, 4)}\n`);
    return root;
};

const writeSource = (root: string, relativePath: string, contents: string): void => {
    const filePath = join(root, relativePath);
    mkdirSync(dirname(filePath), { recursive: true });
    writeFileSync(filePath, contents);
};

const writeJson = (root: string, relativePath: string, contents: Record<string, string>): void => {
    writeSource(root, relativePath, `${JSON.stringify(contents, null, 4)}\n`);
};

const writeRouteTable = (root: string, table: string): void => {
    writeSource(root, 'packages/shared/core/src/vue/bentoTranslations.ts', `export ${table}\n`);
};

const writeComponentDomains = (root: string, switchBody: string): void => {
    writeSource(
        root,
        'packages/shared/core/src/vue/UIElement.ts',
        `const getTranslationDomain = (componentName) => {\n    switch (componentName) {\n${switchBody}        default:\n            throw new Error('unknown component');\n    }\n};\n`
    );
};

const runCheck = (root: string, args: string[] = []) => runProcessTranslationsScript('check-key-references.mjs', [`--root=${root}`, ...args]);

const withProject = (body: (root: string) => void): void => {
    const root = createProjectRoot();
    try {
        body(root);
    } finally {
        rmSync(root, { recursive: true, force: true });
    }
};

test('literal keys and prefixes that resolve to the catalog pass', () => {
    withProject(root => {
        writeSource(
            root,
            'packages/domains/alpha/vue/src/Greeting.ts',
            "i18n.get('alpha.greeting.title');\nconst key = `alpha.statuses.${status}`;\nconst prefix = 'alpha.list.';\n"
        );

        const result = runCheck(root);

        expect(result.stderr).toBe('');
        expect(result.status).toBe(0);
        expect(result.stdout).toContain('key reference check passed');
    });
});

test('a literal key that is in no catalog fails and names its call sites', () => {
    withProject(root => {
        writeSource(root, 'packages/domains/alpha/vue/src/Greeting.ts', "i18n.get('alpha.greeting.subtitle');\n");

        const result = runCheck(root);

        expect(result.status).toBe(1);
        expect(result.stderr).toContain('alpha.greeting.subtitle');
        expect(result.stderr).toContain('is in no catalog');
        expect(result.stderr).toContain('packages/domains/alpha/vue/src/Greeting.ts:1');
    });
});

test('an unknown key referenced only by tests is reported instead of failing', () => {
    withProject(root => {
        writeSource(root, 'packages/domains/alpha/vue/src/Greeting.test.ts', "expect(i18n.get('alpha.greeting.synthetic')).toBe('x');\n");

        const result = runCheck(root);

        expect(result.status).toBe(0);
        expect(result.stdout).toContain('referenced only by tests');
        expect(result.stdout).toContain('alpha.greeting.synthetic');
    });
});

test('a base path that heads a subtree is accepted as a reference', () => {
    withProject(root => {
        writeSource(root, 'packages/domains/alpha/vue/src/Greeting.ts', "getContent(config, i18n, 'alpha.statuses');\n");

        const result = runCheck(root);

        expect(result.stderr).toBe('');
        expect(result.status).toBe(0);
    });
});

test('a registered enum mirror base path is accepted as a reference', () => {
    withProject(root => {
        writeJson(root, 'packages/sdk/translations/en-US.json', { ...CATALOG, 'transactions.common.statuses.paid': 'Paid' });
        writeSource(root, 'packages/domains/alpha/vue/src/Greeting.ts', "getContent(config, i18n, 'transactions.common.statuses');\n");

        const result = runCheck(root);

        expect(result.stderr).toBe('');
        expect(result.status).toBe(0);
    });
});

test('a base path that is not a registered enum mirror fails', () => {
    withProject(root => {
        writeJson(root, 'packages/sdk/translations/en-US.json', { ...CATALOG, 'alpha.summary.address.title': 'Shipping address' });
        writeSource(root, 'packages/domains/alpha/vue/src/Greeting.ts', "i18n.get('alpha.summary.address');\n");

        const result = runCheck(root);

        expect(result.status).toBe(1);
        expect(result.stderr).toContain('alpha.summary.address');
        expect(result.stderr).toContain('names a base path rather than a key');
    });
});

test('a domain-relative call site resolves in at least one domain', () => {
    withProject(root => {
        writeSource(root, 'packages/domains/alpha/vue/src/Greeting.ts', "const key = getDomainTranslationKey(domain, 'greeting.title');\n");

        const result = runCheck(root);

        expect(result.stderr).toBe('');
        expect(result.status).toBe(0);
        expect(result.stdout).toContain('1 domain-relative call sites resolve');
    });
});

test('a domain-relative call site that no domain defines fails', () => {
    withProject(root => {
        writeSource(root, 'packages/domains/alpha/vue/src/Greeting.ts', "const key = getDomainTranslationKey(domain, 'greeting.subtitle');\n");

        const result = runCheck(root);

        expect(result.status).toBe(1);
        expect(result.stderr).toContain('greeting.subtitle');
        expect(result.stderr).toContain('is in no domain catalog');
        expect(result.stderr).toContain('packages/domains/alpha/vue/src/Greeting.ts:1');
    });
});

test('a domain route may stay dormant until a domain adopts the target', () => {
    withProject(root => {
        writeJson(root, 'packages/sdk/translations/en-US.json', { ...CATALOG, 'alpha.common.copy.label': 'Copy' });
        writeRouteTable(
            root,
            `const BENTO_DOMAIN_OVERRIDES = [\n    ['bento.copy.copy', 'common.copy.label'],\n    ['bento.alert.title', 'common.alerts.title'],\n] as const;`
        );

        const result = runCheck(root);

        expect(result.stderr).toBe('');
        expect(result.status).toBe(0);
        expect(result.stdout).toContain('1 route targets are live');
        expect(result.stdout).toContain('1 are dormant until a domain adopts them');
    });
});

test('a domain route outside the domain-common scope fails', () => {
    withProject(root => {
        writeRouteTable(root, `const BENTO_DOMAIN_OVERRIDES = [\n    ['bento.header.title', 'overview.filters.label'],\n] as const;`);

        const result = runCheck(root);

        expect(result.status).toBe(1);
        expect(result.stderr).toContain('overview.filters.label');
        expect(result.stderr).toContain('does not target the domain-common scope');
    });
});

test('a route target that violates the key grammar fails with its rule', () => {
    withProject(root => {
        writeRouteTable(
            root,
            `const BENTO_DOMAIN_OVERRIDES = [\n    ['bento.baseFilter.apply', 'common.action.apply.label'],\n    ['bento.calendarMonth.nextMonth', 'common.filters.types.date.calendar.navigation.nextMonth'],\n] as const;`
        );

        const result = runCheck(root);

        expect(result.status).toBe(1);
        expect(result.stderr).toContain('common.action.apply.label');
        expect(result.stderr).toContain('violates the group-plural rule of the key grammar');
        expect(result.stderr).toContain('violates the depth rule of the key grammar');
    });
});

test('a component route target that violates the key grammar fails', () => {
    withProject(root => {
        writeComponentDomains(root, `        case 'alphaOverview':\n            return 'alpha';\n`);
        writeJson(root, 'packages/sdk/translations/en-US.json', { ...CATALOG, 'alpha.overview.pagination.ariaLabel': 'Pagination' });
        writeRouteTable(
            root,
            `const BENTO_COMPONENT_DOMAIN_OVERRIDES = [\n    {\n        bentoKey: 'bento.dataGrid.pagination',\n        componentNames: ['alphaOverview'],\n        domainKey: 'overview.pagination.ariaLabel',\n    },\n] as const;`
        );

        const result = runCheck(root);

        expect(result.status).toBe(1);
        expect(result.stderr).toContain('overview.pagination.ariaLabel');
        expect(result.stderr).toContain('violates the a11y rule of the key grammar');
    });
});

test('a component route must exist in every routed component’s domain', () => {
    withProject(root => {
        writeComponentDomains(root, `        case 'alphaOverview':\n            return 'alpha';\n`);
        writeJson(root, 'packages/sdk/translations/en-US.json', { ...CATALOG, 'alpha.overview.pagination.label': 'Pagination' });
        writeRouteTable(
            root,
            `const BENTO_COMPONENT_DOMAIN_OVERRIDES = [\n    {\n        bentoKey: 'bento.dataGrid.pagination',\n        componentNames: ['alphaOverview'],\n        domainKey: 'overview.pagination.label',\n    },\n] as const;`
        );

        const passing = runCheck(root);
        expect(passing.stderr).toBe('');
        expect(passing.status).toBe(0);

        writeJson(root, 'packages/sdk/translations/en-US.json', CATALOG);
        const failing = runCheck(root);
        expect(failing.status).toBe(1);
        expect(failing.stderr).toContain('overview.pagination.label');
        expect(failing.stderr).toContain('is required by alphaOverview (alpha); the runtime throws when it is missing');
    });
});

test('a component route for a component without a translation domain fails', () => {
    withProject(root => {
        writeRouteTable(
            root,
            `const BENTO_COMPONENT_DOMAIN_OVERRIDES = [\n    {\n        bentoKey: 'bento.dataGrid.pagination',\n        componentNames: ['alphaOverview'],\n        domainKey: 'overview.pagination.label',\n    },\n] as const;`
        );

        const result = runCheck(root);

        expect(result.status).toBe(1);
        expect(result.stderr).toContain('routes alphaOverview, which has no translation domain in UIElement.getTranslationDomain');
    });
});

test('a domain switch without its terminator fails loudly instead of misparsing', () => {
    withProject(root => {
        writeJson(root, 'packages/sdk/translations/en-US.json', { ...CATALOG, 'alpha.overview.pagination.label': 'Pagination' });
        writeRouteTable(
            root,
            `const BENTO_COMPONENT_DOMAIN_OVERRIDES = [\n    {\n        bentoKey: 'bento.dataGrid.pagination',\n        componentNames: ['alphaOverview'],\n        domainKey: 'overview.pagination.label',\n    },\n] as const;`
        );
        // The switch is never closed, so slicing past its start would swallow the token
        // pattern from anywhere later in the file and register a phantom domain.
        writeSource(
            root,
            'packages/shared/core/src/vue/UIElement.ts',
            `const getTranslationDomain = (componentName) => {\n    switch (componentName) {\n        case 'alphaOverview':\n            return 'alpha';\n        default:\n            throw new Error('unknown component');\n    }\n`
        );

        const result = runCheck(root);

        expect(result.status).toBe(1);
        expect(result.stderr).toContain('routes alphaOverview, which has no translation domain in UIElement.getTranslationDomain');
    });
});

test('a UIElement without the domain switch fails loudly', () => {
    withProject(root => {
        writeRouteTable(
            root,
            `const BENTO_COMPONENT_DOMAIN_OVERRIDES = [\n    {\n        bentoKey: 'bento.dataGrid.pagination',\n        componentNames: ['alphaOverview'],\n        domainKey: 'overview.pagination.label',\n    },\n] as const;`
        );
        writeSource(root, 'packages/shared/core/src/vue/UIElement.ts', 'export const useTranslationDomain = () => null;\n');

        const result = runCheck(root);

        expect(result.status).toBe(1);
        expect(result.stderr).toContain('routes alphaOverview, which has no translation domain in UIElement.getTranslationDomain');
    });
});

test('an unrouted Bento mirror key is designed fallback copy, not dead copy', () => {
    withProject(root => {
        writeJson(root, 'packages/sdk/translations/en-US.json', { 'alpha.greeting.title': 'Hello' });
        writeJson(root, 'packages/sdk/translations/bento/en-US.json', { 'bento.header.title': 'Header', 'bento.orphan.title': 'Orphan' });
        writeSource(root, 'packages/domains/alpha/vue/src/Greeting.ts', "i18n.get('alpha.greeting.title');\n");
        writeRouteTable(root, `const BENTO_DOMAIN_OVERRIDES = [\n    ['bento.header.title', 'common.headers.title'],\n] as const;`);

        const result = runCheck(root);
        expect(result.status).toBe(0);
        expect(result.stdout).toContain('1 Bento mirror keys have no domain route');
        expect(result.stdout).toContain('bento.orphan.title');
        expect(result.stdout).not.toContain('not reachable from any reference');

        expect(runCheck(root, ['--strict']).status).toBe(0);
    });
});

test('a routing table that fails to parse fails loudly', () => {
    withProject(root => {
        writeSource(
            root,
            'packages/shared/core/src/vue/bentoTranslations.ts',
            'export const BENTO_DOMAIN_OVERRIDES = [\n    /* entries moved into a helper */\n] as const;\n'
        );

        const result = runCheck(root);

        expect(result.status).toBe(1);
        expect(result.stderr).toContain('BENTO_DOMAIN_OVERRIDES');
        expect(result.stderr).toContain('is declared but no entries were parsed');
    });
});

test('a prefix left behind by a rename fails', () => {
    withProject(root => {
        writeSource(root, 'packages/domains/alpha/vue/src/Greeting.ts', 'const key = `alpha.salutations.${variant}`;\n');

        const result = runCheck(root);

        expect(result.status).toBe(1);
        expect(result.stderr).toContain('alpha.salutations.');
        expect(result.stderr).toContain('matches no catalog key');
    });
});

test('a key factory prefix and suffix must frame one catalog key together', () => {
    withProject(root => {
        writeSource(
            root,
            'packages/domains/alpha/domain/src/translations.ts',
            "createKeyFactoryFromConfig({ prefix: 'alpha.statuses.', suffix: 'Description' });\n" +
                "createKeyFactoryFromConfig({ prefix: 'alpha.statuses.', suffix: '.description' });\n"
        );

        const result = runCheck(root);

        expect(result.status).toBe(1);
        expect(result.stderr).toContain('alpha.statuses.*.description');
        expect(result.stderr).not.toContain('alpha.statuses.*Description');
    });
});

test('a dynamic reference covers one segment per interpolation, not the subtree', () => {
    withProject(root => {
        writeJson(root, 'packages/sdk/translations/en-US.json', { ...CATALOG, 'alpha.list.fields.amount': 'Amount' });
        // The template interpolates a single column id, so it can never
        // produce `alpha.list.fields.amount` — that key stays unreachable
        // instead of being claimed by the prefix.
        writeSource(
            root,
            'packages/domains/alpha/vue/src/Greeting.ts',
            "i18n.get('alpha.greeting.title');\ni18n.get('alpha.statuses.pendingDescription');\nconst key = `alpha.list.${column}`;\nconst status = `alpha.statuses.${value}`;\nconst both = `beta.${scope}.title`;\n"
        );

        const result = runCheck(root);

        expect(result.status).toBe(0);
        expect(result.stdout).toContain('alpha.list.fields.amount');
        expect(result.stdout).toContain('1 catalog keys are not reachable');
    });
});

test('unreachable catalog keys are reported, and fail only under --strict', () => {
    withProject(root => {
        writeSource(root, 'packages/domains/alpha/vue/src/Greeting.ts', "i18n.get('alpha.greeting.title');\n");

        const reported = runCheck(root);
        expect(reported.status).toBe(0);
        expect(reported.stdout).toContain('not reachable from any reference');
        expect(reported.stdout).toContain('alpha.list.amount');

        expect(runCheck(root, ['--strict']).status).toBe(1);
    });
});

test('dotted strings outside the catalog namespaces are ignored', () => {
    withProject(root => {
        writeSource(
            root,
            'packages/domains/alpha/vue/src/Greeting.ts',
            "import styles from './x';\nconst mime = 'application.json.';\nconst f = 'alpha.csv';\n"
        );

        const result = runCheck(root);

        expect(result.stderr).toBe('');
    });
});
