import { computed, createApp, shallowReactive } from 'vue';
import { expect, test } from 'vitest';
import type { GlobalAppearance, WithDataGridAppearance } from '@integration-components/types';
import { CORE_CONTEXT_KEY } from './Context/constants';
import { createCoreContextValue } from './Context/createCoreContextValue';
import type { CoreProviderProps } from './Context/types';
import { hasDataGridAppearance, resolveAppearance, useCondensedDataGrid } from './customization';

type DataGridComponentAppearance = GlobalAppearance & WithDataGridAppearance;

test.each([
    [{ illustrations: 'hidden' }, undefined, { illustrations: 'hidden' }],
    [undefined, { illustrations: 'hidden' }, { illustrations: 'hidden' }],
    [{ titles: 'hidden' }, undefined, { titles: 'hidden' }],
    [undefined, { titles: 'hidden' }, { titles: 'hidden' }],
] as const)('resolves global and component appearance', (globalAppearance, componentAppearance, expectedAppearance) => {
    expect(resolveAppearance(globalAppearance, componentAppearance)).toEqual(expectedAppearance);
});

test('combines global and component appearance', () => {
    expect(resolveAppearance({ illustrations: 'hidden' }, { titles: 'hidden' })).toEqual({
        illustrations: 'hidden',
        titles: 'hidden',
    });
});

test('component appearance overrides global appearance', () => {
    expect(resolveAppearance({ illustrations: 'hidden', titles: 'visible' }, { illustrations: 'visible', titles: 'hidden' })).toEqual({
        illustrations: 'visible',
        titles: 'hidden',
    });
});

test('resolves component data grid appearance', () => {
    expect(resolveAppearance<WithDataGridAppearance>({ illustrations: 'hidden' }, { dataGrid: { density: 'condensed' } })).toEqual({
        illustrations: 'hidden',
        dataGrid: { density: 'condensed' },
    });
});

test('ignores empty data grid appearance', () => {
    expect(resolveAppearance<WithDataGridAppearance>(undefined, { dataGrid: {} })).toBeUndefined();
});

test('returns no appearance without global or component options', () => {
    expect(resolveAppearance(undefined, undefined)).toBeUndefined();
});

test('exposes reactive appearance through the core context value', () => {
    const props = shallowReactive<CoreProviderProps>({ translationDomain: 'transactions' });
    const coreContext = createCoreContextValue(props);
    const illustrationsHidden = computed(() => coreContext.appearance?.illustrations === 'hidden');
    const titlesHidden = computed(() => coreContext.appearance?.titles === 'hidden');

    expect(illustrationsHidden.value).toBe(false);
    expect(titlesHidden.value).toBe(false);

    props.appearance = { illustrations: 'hidden', titles: 'hidden' };

    expect(illustrationsHidden.value).toBe(true);
    expect(titlesHidden.value).toBe(true);
});

test.each<[DataGridComponentAppearance | undefined, boolean]>([
    [undefined, false],
    [{ illustrations: 'hidden' }, false],
    [{ dataGrid: {} }, true],
    [{ titles: 'hidden', dataGrid: { density: 'condensed' } }, true],
])('detects data grid appearance', (appearance, expected) => {
    expect(hasDataGridAppearance(appearance)).toBe(expected);
});

test('useCondensedDataGrid reflects the data grid density', () => {
    const props = shallowReactive<CoreProviderProps>({ translationDomain: 'transactions' });
    const coreContext = createCoreContextValue(props);
    const app = createApp({ render: () => null });
    app.provide(CORE_CONTEXT_KEY, coreContext);
    const condensed = app.runWithContext(() => useCondensedDataGrid());

    expect(condensed.value).toBe(false);

    const condensedAppearance: DataGridComponentAppearance = { dataGrid: { density: 'condensed' } };
    props.appearance = condensedAppearance;
    expect(condensed.value).toBe(true);

    const defaultAppearance: DataGridComponentAppearance = { dataGrid: { density: 'default' } };
    props.appearance = defaultAppearance;
    expect(condensed.value).toBe(false);

    props.appearance = { illustrations: 'hidden' };
    expect(condensed.value).toBe(false);
});
