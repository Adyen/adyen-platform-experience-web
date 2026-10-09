import { test, expect, vi } from 'vitest';
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

// The CLI e2e tests spawn `node run.js`, which spawns the jscodeshift CLI
// once per transform — comfortably above vitest's 5s default test timeout.
vi.setConfig({ testTimeout: 30_000 });

const codemodsRoot = dirname(fileURLToPath(import.meta.url));

// A realistic V1 integration touching every transform in one file.
const V1_INTEGRATION = `import {
    TransactionsOverview,
    CapitalOffer,
    TransactionsOverviewComponentProps,
    httpGet,
    type ExternalCapitalState,
    type TransactionsFilters,
} from '@adyen/adyen-platform-experience-web';
import '@adyen/adyen-platform-experience-web/adyen-platform-experience-web.css';

const core = await AdyenPlatformExperience({
    environment: 'test',
    locale: 'en-US',
    availableTranslations: [en_US],
    onSessionCreate: handleSessionCreate,
    onError: handleError,
    translations: {
        'en-US': {
            'common.actions.copy.labels.done': 'Duplicated',
        },
    },
});

const props: TransactionsOverviewComponentProps = {
    core,
    hideTitle: true,
    showDetails: true,
    onFiltersChanged: filters => track(filters),
    onRecordSelection: ({ id }) => open(id),
};

const transactionsOverview = new TransactionsOverview(props);
transactionsOverview.mount('#transactions-overview');

const capitalOffer = new CapitalOffer({
    core,
    onFundsRequest: async (grant, renewsGrantId) => requestFunds(grant, renewsGrantId),
    onOfferSelect: offer => openOwnSummary(offer),
    externalCapitalState: cachedState as ExternalCapitalState,
    onOfferDismiss: () => closeOffer(),
});

capitalOffer.mount('#capital-offer');

export const filters: TransactionsFilters | undefined = undefined;
export const fetcher = httpGet;
`;

// A Vue SFC integration: script migrated, template/style untouched.
const V1_SFC = `<template>
    <div ref="mountTarget" />
</template>

<script setup lang="ts">
import { TransactionsOverviewComponentProps } from '@adyen/adyen-platform-experience-web';

const mountTarget = ref();

const props: TransactionsOverviewComponentProps = {
    core,
    hideTitle: true,
    onFiltersChanged: filters => track(filters),
};

const overview = new TransactionsOverview(props);
overview.mount(mountTarget.value);
</script>

<style scoped>
.adyen-pe-component {
    color: red;
}
</style>
`;

test('run.js migrates a full V1 integration end to end', () => {
    const dir = mkdtempSync(join(tmpdir(), 'adyen-codemods-'));
    try {
        writeFileSync(join(dir, 'integration.ts'), V1_INTEGRATION);
        writeFileSync(join(dir, 'Component.vue'), V1_SFC);

        const result = spawnSync(process.execPath, [join(codemodsRoot, 'run.js'), '--fix', dir], {
            encoding: 'utf8',
        });
        expect(result.status, `run.js failed:\n${result.stdout}\n${result.stderr}`).toBe(0);

        expect(result.stdout, 'announces write mode').toContain('Applying changes (--fix)');
        expect(result.stdout, 'counts leftover TODO markers').toContain('TODO(v2-migration) marker(s) found');

        const migrated = readFileSync(join(dir, 'integration.ts'), 'utf8');

        // core-init-options: availableTranslations gone, the rest kept.
        expect(migrated).not.toContain('availableTranslations');
        expect(migrated).toContain('onSessionCreate: handleSessionCreate');
        expect(migrated, 'keeps the core-level onError').toContain('onError: handleError');

        // fix-imports: renames applied, unused removed exports dropped,
        // referenced ones kept and flagged.
        expect(migrated, 'renames ComponentProps types').toContain('TransactionsOverviewProps');
        expect(migrated).not.toContain('TransactionsOverviewComponentProps');
        expect(migrated, 'renames ExternalCapitalState').toContain('type CapitalState');
        expect(migrated).not.toContain('ExternalCapitalState');
        expect(migrated, 'keeps referenced removed exports').toContain('httpGet,');
        expect(migrated).toContain("TODO(v2-migration): 'httpGet', 'TransactionsFilters' are no longer exported");

        // component-props: hideTitle converted, removed props gone, flow kept.
        expect(migrated, 'converts hideTitle to appearance').toContain("titles: 'hidden'");
        expect(migrated).not.toContain('hideTitle');
        expect(migrated).not.toContain('showDetails');
        expect(migrated).not.toContain('onFiltersChanged');
        expect(migrated).not.toContain('onOfferSelect');
        expect(migrated).not.toContain('externalCapitalState');
        expect(migrated, 'keeps the required Capital Offer callback').toContain('onFundsRequest');
        expect(migrated, 'keeps the kept Capital Offer callback').toContain('onOfferDismiss');
        expect(migrated, 'keeps onRecordSelection').toContain('onRecordSelection');

        // translations-keys: common.* re-scoped to the owning domains.
        expect(migrated).toContain("'transactions.common.actions.copy.labels.done': 'Duplicated'");
        expect(migrated).toContain("'capital.common.actions.copy.labels.done': 'Duplicated'");
        expect(migrated).not.toContain("'common.actions.copy.labels.done': 'Duplicated'");

        // run.js prints the per-file REP reports from every transform.
        expect(result.stdout).toContain('removed the deprecated availableTranslations option');
        expect(result.stdout).toContain("re-keyed 'common.actions.copy.labels.done'");
        expect(result.stdout).toContain('replaced hideTitle: true');

        // The .vue SFC is picked up by the default extensions and migrated
        // script-only, with template and style untouched.
        const sfc = readFileSync(join(dir, 'Component.vue'), 'utf8');
        expect(sfc, 'keeps the template').toMatch(/^<template>/);
        expect(sfc, 'keeps the style').toContain('color: red;');
        expect(sfc, 'keeps the SFC structure').toContain('</script>');
        expect(sfc, 'renames types inside the script block').toContain('TransactionsOverviewProps');
        expect(sfc, 'converts hideTitle inside the script block').toContain("titles: 'hidden'");
        expect(sfc).not.toContain('hideTitle');
        expect(sfc).not.toContain('onFiltersChanged');
    } finally {
        rmSync(dir, { recursive: true, force: true });
    }
});

test('run.js --dry leaves files untouched but still reports', () => {
    const dir = mkdtempSync(join(tmpdir(), 'adyen-codemods-'));
    try {
        const file = join(dir, 'integration.ts');
        writeFileSync(file, V1_INTEGRATION);

        const result = spawnSync(process.execPath, [join(codemodsRoot, 'run.js'), '--dry', dir], {
            encoding: 'utf8',
        });
        expect(result.status, `run.js --dry failed:\n${result.stdout}\n${result.stderr}`).toBe(0);
        expect(readFileSync(file, 'utf8'), 'leaves the file untouched').toBe(V1_INTEGRATION);
        expect(result.stdout, 'reports the dry run').toContain('Running in dry mode');
        expect(result.stdout, 'reports what would change').toContain('1 ok');
    } finally {
        rmSync(dir, { recursive: true, force: true });
    }
});

test('run.js --only runs a single transform', () => {
    const dir = mkdtempSync(join(tmpdir(), 'adyen-codemods-'));
    try {
        const file = join(dir, 'integration.ts');
        writeFileSync(file, V1_INTEGRATION);

        const result = spawnSync(process.execPath, [join(codemodsRoot, 'run.js'), '--fix', '--only=core-init-options', dir], {
            encoding: 'utf8',
        });
        expect(result.status, `run.js --only failed:\n${result.stdout}\n${result.stderr}`).toBe(0);

        const migrated = readFileSync(file, 'utf8');
        expect(migrated, 'ran the selected transform').not.toContain('availableTranslations');
        expect(migrated, 'left other transforms alone').toContain('hideTitle: true');
    } finally {
        rmSync(dir, { recursive: true, force: true });
    }
});

test('run.js checks by default and leaves files untouched', () => {
    const dir = mkdtempSync(join(tmpdir(), 'adyen-codemods-'));
    try {
        const file = join(dir, 'integration.ts');
        writeFileSync(file, V1_INTEGRATION);

        const result = spawnSync(process.execPath, [join(codemodsRoot, 'run.js'), dir], {
            encoding: 'utf8',
        });
        expect(result.status, `run.js failed:\n${result.stdout}\n${result.stderr}`).toBe(0);
        expect(readFileSync(file, 'utf8'), 'leaves the file untouched').toBe(V1_INTEGRATION);
        expect(result.stdout, 'announces check mode').toContain('Checking only');
        expect(result.stdout, 'points at --fix').toContain('Pass --fix to apply');
        expect(result.stdout, 'reports what would change in the summary').toContain('would change');
        expect(result.stdout, 'still reports per-file changes').toContain("re-keyed 'common.actions.copy.labels.done'");
    } finally {
        rmSync(dir, { recursive: true, force: true });
    }
});

test('run.js --fix wins over an explicit --dry', () => {
    const dir = mkdtempSync(join(tmpdir(), 'adyen-codemods-'));
    try {
        const file = join(dir, 'integration.ts');
        writeFileSync(file, V1_INTEGRATION);

        const result = spawnSync(process.execPath, [join(codemodsRoot, 'run.js'), '--fix', '--dry', dir], {
            encoding: 'utf8',
        });
        expect(result.status, `run.js failed:\n${result.stdout}\n${result.stderr}`).toBe(0);
        expect(result.stdout, 'warns about the conflicting flags').toContain('--fix wins');
        expect(readFileSync(file, 'utf8'), 'applies the changes').not.toContain('availableTranslations');
    } finally {
        rmSync(dir, { recursive: true, force: true });
    }
});

test('run.js defaults to ./src when no paths are given', () => {
    const dir = mkdtempSync(join(tmpdir(), 'adyen-codemods-'));
    try {
        mkdirSync(join(dir, 'src'));
        writeFileSync(join(dir, 'src', 'integration.ts'), V1_INTEGRATION);

        const result = spawnSync(process.execPath, [join(codemodsRoot, 'run.js'), '--fix'], {
            encoding: 'utf8',
            cwd: dir,
        });
        expect(result.status, `run.js failed:\n${result.stdout}\n${result.stderr}`).toBe(0);
        expect(result.stdout, 'announces the default path').toContain('defaulting to ./src');
        const migrated = readFileSync(join(dir, 'src', 'integration.ts'), 'utf8');
        expect(migrated, 'migrates the default path').not.toContain('availableTranslations');
    } finally {
        rmSync(dir, { recursive: true, force: true });
    }
});

test('run.js exits with guidance when no paths are given and ./src is missing', () => {
    const dir = mkdtempSync(join(tmpdir(), 'adyen-codemods-'));
    try {
        const result = spawnSync(process.execPath, [join(codemodsRoot, 'run.js')], {
            encoding: 'utf8',
            cwd: dir,
        });
        expect(result.status, 'exits non-zero').toBe(1);
        expect(result.stderr, 'explains the failure').toContain('No ./src directory found');
        expect(result.stderr, 'points at the next step').toContain('npx v2-migration --fix');
    } finally {
        rmSync(dir, { recursive: true, force: true });
    }
});
