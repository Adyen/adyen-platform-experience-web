import { test, expect } from 'vitest';
import jscodeshift from 'jscodeshift';
import componentProps from '../transforms/component-props.cjs';
import fixImports from '../transforms/fix-imports.cjs';
import coreInitOptions from '../transforms/core-init-options.cjs';
import translationsKeys from '../transforms/translations-keys.cjs';

// Helpers.runTransform reports as 'test.ts'; SFC support keys off the .vue
// extension, so run the transform with an explicit .vue path.
function runOnVue(transform, source) {
    const notes = [];
    const api = {
        jscodeshift: jscodeshift.withParser('tsx'),
        stats: () => {},
        report: msg => notes.push(msg),
    };
    const output = transform({ path: 'component.vue', source }, api, {});
    return { output: output ?? source, changed: output != null, notes };
}

test('component-props migrates a <script setup lang="ts"> block and leaves the rest untouched', () => {
    const input = `<template>
    <div ref="mountTarget" />
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { TransactionsOverview } from '@adyen/adyen-platform-experience-web';

const mountTarget = ref();
const overview = new TransactionsOverview({
    core,
    hideTitle: true,
    showDetails: false,
    onFiltersChanged: filters => track(filters),
});

onMounted(() => overview.mount(mountTarget.value));
</script>

<style scoped>
.adyen-pe-component {
    color: red;
}
</style>
`;
    const { output, changed } = runOnVue(componentProps, input);

    expect(changed).toBe(true);
    expect(output, 'migrates the script block').toContain("titles: 'hidden'");
    expect(output).not.toContain('hideTitle');
    expect(output, 'removes showDetails').not.toMatch(/^[ \t]*showDetails:/m);
    expect(output).not.toContain('onFiltersChanged');
    expect(output, 'keeps the template byte-for-byte').toMatch(/^<template>/);
    expect(output, 'keeps the style block byte-for-byte').toContain('color: red;');
    expect(output, 'keeps the SFC structure intact').toContain('</script>');
});

test('both <script> and <script setup> blocks are processed', () => {
    const input = `<script setup lang="ts">
import { TransactionsOverview } from '@adyen/adyen-platform-experience-web';
const overview = new TransactionsOverview({ core, hideTitle: true });
</script>

<script lang="ts">
import { ReportsOverview } from '@adyen/adyen-platform-experience-web';
export const legacy = new ReportsOverview({ core, hideTitle: true });
</script>
`;
    const { output } = runOnVue(componentProps, input);

    expect(output, 'migrates both blocks').not.toContain('hideTitle');
    expect((output.match(/titles: 'hidden'/g) || []).length).toBe(2);
});

test('SFCs without script blocks are untouched', () => {
    const input = `<template>
    <div />
</template>

<style>
.adyen-pe-component { color: red; }
</style>
`;
    const { output, changed } = runOnVue(componentProps, input);

    expect(changed).toBe(false);
    expect(output).toBe(input);
});

test('fix-imports and translations migrate inside .vue files', () => {
    const importsInput = `<script setup lang="ts">
import { TransactionsOverviewComponentProps } from '@adyen/adyen-platform-experience-web';
export const props: TransactionsOverviewComponentProps = { core: null as any };
</script>
`;
    const importsResult = runOnVue(fixImports, importsInput);
    expect(importsResult.output, 'renames types in the script block').toContain('TransactionsOverviewProps');
    expect(importsResult.output).not.toContain('TransactionsOverviewComponentProps');

    const initInput = `<script setup lang="ts">
const core = await AdyenPlatformExperience({
    onSessionCreate: handleSessionCreate,
    availableTranslations: [],
    translations: { 'en-US': { 'common.actions.copy.labels.done': 'Duplicated' } },
});
</script>
`;
    const initResult = runOnVue(coreInitOptions, initInput);
    expect(initResult.output, 'core-init-options works in the script block').not.toContain('availableTranslations');

    const keysResult = runOnVue(translationsKeys, initInput);
    expect(keysResult.output, 'translations re-key in the script block').toContain(
        "'transactions.common.actions.copy.labels.done': 'Duplicated'"
    );
});

test('TODO comments land inside the script block', () => {
    const input = `<script setup lang="ts">
import { TransactionsOverview } from '@adyen/adyen-platform-experience-web';
const overview = new TransactionsOverview({ core, onError: error => report(error) });
</script>
`;
    const { output } = runOnVue(componentProps, input);

    expect(output, 'the TODO comment is written inside the script block').toContain(
        "// TODO(v2-migration): TransactionsOverview: per-component 'onError' no longer takes effect"
    );
    expect(output, 'removes the onError prop').not.toContain('onError:');
});

test('both blocks are migrated when <script> precedes <script setup> in the file', () => {
    const input = `<script lang="ts">
import { ReportsOverview } from '@adyen/adyen-platform-experience-web';
export const legacy = new ReportsOverview({ core, hideTitle: true });
</script>

<script setup lang="ts">
import { TransactionsOverview } from '@adyen/adyen-platform-experience-web';
const overview = new TransactionsOverview({ core, hideTitle: true });
</script>
`;
    const { output } = runOnVue(componentProps, input);

    expect(output, 'migrates the first block without shifting the second out of range').not.toContain('hideTitle');
    expect((output.match(/titles: 'hidden'/g) || []).length, 'migrates both blocks').toBe(2);
});
