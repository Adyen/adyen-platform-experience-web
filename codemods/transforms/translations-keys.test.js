import { test, expect } from 'vitest';
import { runTransform } from '../helpers.js';
import transform from './translations-keys.cjs';

test('re-keys known common.* overrides to every owning domain', () => {
    const input = `
const core = await AdyenPlatformExperience({
    locale: 'en-US',
    onSessionCreate: handleSessionCreate,
    translations: {
        'en-US': {
            'common.actions.copy.labels.done': 'Duplicated',
            'transactions.overview.title': 'My transactions',
        },
    },
});
`;
    const { output, changed } = runTransform(transform, input);

    expect(changed).toBe(true);
    for (const domain of ['capital', 'disputes', 'payByLink', 'payouts', 'reports', 'transactions']) {
        expect(output, `adds the ${domain} key`).toContain(`'${domain}.common.actions.copy.labels.done': 'Duplicated'`);
    }
    expect(output, 'removes the V1 key').not.toContain("'common.actions.copy.labels.done'");
    expect(output, 'keeps keys that already resolve in V2').toContain("'transactions.overview.title': 'My transactions'");
});

test('re-keys filter bar strings to the domain override namespace with a TODO', () => {
    // bento.dataGrid.filterBar routes through `<domain>.common.filters.label`
    // overrides in the five domains that render data grids; capital renders none.
    const input = `
export const enUS = {
    'common.filters.label': 'Filters',
};
`;
    const { output, notes } = runTransform(transform, input);

    for (const domain of ['disputes', 'payByLink', 'payouts', 'reports', 'transactions']) {
        expect(output, `adds the ${domain} key`).toContain(`'${domain}.common.filters.label': 'Filters'`);
    }
    expect(output, 'does not add capital (no data grids)').not.toContain("'capital.common.filters.label'");
    expect(output, 'removes the V1 key').not.toContain("'common.filters.label': 'Filters'");
    expect(output, 'notes the override-namespace targets').toContain('TODO(v2-migration)');
    expect(notes.some(note => note.includes("re-keyed 'common.filters.label'"))).toBe(true);
});

test('re-keys Bento pagination through the component-specific domain keys', () => {
    // bento.dataGrid.pagination is component-routed: disputes uses its a11y
    // label, the other overview domains use `<domain>.overview.pagination.label`.
    const input = `
export const enUS = {
    'common.pagination.label': 'Pagination',
};
`;
    const { output } = runTransform(transform, input);

    expect(output).toContain("'disputes.overview.common.pagination.a11y.label': 'Pagination'");
    expect(output).toContain("'transactions.overview.pagination.label': 'Pagination'");
    expect(output).toContain("'payByLink.overview.pagination.label': 'Pagination'");
    expect(output, 'removes the V1 key').not.toContain("'common.pagination.label': 'Pagination'");
});

test('fans timeline strings out only to the domains that render timelines', () => {
    const input = `
export const enUS = {
    'common.timeline.timelineItem.showMoreItems': 'Show %{items} more',
};
`;
    const { output } = runTransform(transform, input);

    expect(output).toContain("'payByLink.common.timeline.timelineItem.showMoreItems': 'Show %{items} more'");
    expect(output).toContain("'transactions.common.timeline.timelineItem.showMoreItems': 'Show %{items} more'");
    expect(output, 'skips domains without timelines').not.toContain("'capital.common.timeline");
    expect(output, 'skips domains without timelines').not.toContain("'disputes.common.timeline");
});

test('re-keys renamed domain keys in place', () => {
    const input = `
export const nlNL = {
    'payByLink.common.fields.optional.label': 'optioneel',
};
`;
    const { output, notes } = runTransform(transform, input);

    expect(output).toContain("'payByLink.creation.fields.optional.label': 'optioneel'");
    expect(output).not.toContain("'payByLink.common.fields.optional.label'");
    expect(output, 'typed catalog target needs no TODO').not.toContain('TODO(v2-migration)');
    expect(notes.some(note => note.includes("re-keyed 'payByLink.common.fields.optional.label'"))).toBe(true);
});

test('re-keys deprecated V1 spellings through the swap chains', () => {
    const input = `
export const enUS = {
    'capital.businessFinancing': 'Financiering',
};
`;
    const { output } = runTransform(transform, input);

    expect(output).toContain("'capital.common.title': 'Financiering'");
    expect(output).not.toContain("'capital.businessFinancing'");
});

test('carries plural family suffixes to the re-keyed targets', () => {
    const input = `
export const enUS = {
    'common.actions.copy.labels.done__plural': 'Gekopieerd %{count} keer',
};
`;
    const { output } = runTransform(transform, input);

    expect(output).toContain("'transactions.common.actions.copy.labels.done__plural': 'Gekopieerd %{count} keer'");
    expect(output).toContain("'capital.common.actions.copy.labels.done__plural': 'Gekopieerd %{count} keer'");
    expect(output).not.toContain("'common.actions.copy.labels.done__plural':");
});

test('flags V1 keys that no longer exist in V2', () => {
    // V2 replaced the amount-range filter with Bento's number filter and
    // dropped the amount range strings entirely.
    const input = `
export const enUS = {
    'common.filters.types.amount.range.max': 'Up to %{amount}',
};
`;
    const { output, notes } = runTransform(transform, input);

    expect(output, 'keeps the key for manual review').toContain("'common.filters.types.amount.range.max': 'Up to %{amount}'");
    expect(output, 'flags it').toContain('TODO(v2-migration)');
    expect(notes.some(note => note.includes('common.filters.types.amount.range.max'))).toBe(true);
});

test('non-translation objects and custom keys are untouched', () => {
    const input = `
export const myLoyaltyTier = {
    'myLoyaltyTier': 'Loyalty tier',
    'transactions.overview.title': 'My transactions',
    loading: 'Loading',
};

export const unrelated = {
    common: 'not-a-translation-key',
};
`;
    const { output, changed } = runTransform(transform, input);

    expect(changed).toBe(false);
    expect(output).toBe(input);
});

test('handles core.update translations too', () => {
    const input = `
await core.update({
    locale: 'de-DE',
    translations: {
        'de-DE': {
            'common.errors.contactSupport': 'Support kontaktieren',
        },
    },
});
`;
    const { output } = runTransform(transform, input);

    expect(output).toContain("'transactions.common.errors.contactSupport': 'Support kontaktieren'");
    expect(output).toContain("'capital.common.errors.contactSupport': 'Support kontaktieren'");
    expect(output).not.toContain("'common.errors.contactSupport':");
});

test('double-quoted files keep their quote style for new keys', () => {
    const input = `
export const enUS = {
    "some.existing.key": "Existing value",
    "common.actions.copy.labels.done": "Duplicated",
};
`;
    const { output } = runTransform(transform, input);

    expect(output).toContain('"transactions.common.actions.copy.labels.done": "Duplicated"');
    expect(output).toContain('"capital.common.actions.copy.labels.done": "Duplicated"');
    expect(output).not.toContain("'transactions.common.actions");
});
