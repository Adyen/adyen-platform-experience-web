import { computed, createApp, shallowReactive } from 'vue';
import { expect, test } from 'vitest';
import type { GlobalAppearance, WithDataGridAppearance } from '@integration-components/types';
import { CORE_CONTEXT_KEY } from './Context/constants';
import { createCoreContextValue } from './Context/createCoreContextValue';
import type { CoreProviderProps } from './Context/types';
import { hasDataGridAppearance, resolveAppearance, useCondensedDataGrid } from './customization';

type DataGridComponentAppearance = GlobalAppearance & WithDataGridAppearance;

test.each([
    [{ titles: 'hidden' }, undefined, { titles: 'hidden' }],
    [undefined, { titles: 'hidden' }, { titles: 'hidden' }],
    [{ container: 'hidden' }, undefined, { container: 'hidden' }],
    [{ container: 'hidden' }, { container: 'visible' }, { container: 'visible' }],
] as const)('resolves global and component appearance', (globalAppearance, componentAppearance, expectedAppearance) => {
    expect(resolveAppearance(globalAppearance, componentAppearance)).toEqual(expectedAppearance);
});

test('combines global and component appearance', () => {
    expect(resolveAppearance({ container: 'hidden' }, { titles: 'hidden' })).toEqual({
        container: 'hidden',
        titles: 'hidden',
    });
});

test('component appearance overrides global appearance', () => {
    expect(resolveAppearance({ container: 'hidden', titles: 'visible' }, { container: 'visible', titles: 'hidden' })).toEqual({
        container: 'visible',
        titles: 'hidden',
    });
});

test('resolves component data grid appearance', () => {
    expect(resolveAppearance<DataGridComponentAppearance>({ titles: 'hidden' }, { dataGrid: { density: 'condensed' } })).toEqual({
        titles: 'hidden',
        dataGrid: { density: 'condensed' },
    });
});

test('inherits the global container alongside component extensions', () => {
    expect(resolveAppearance<DataGridComponentAppearance>({ container: 'hidden' }, { dataGrid: { density: 'condensed' } })).toEqual({
        container: 'hidden',
        dataGrid: { density: 'condensed' },
    });
});

test('passes any component appearance extension through as-is', () => {
    type FutureExtensionAppearance = GlobalAppearance & { filters?: { layout?: 'inline' | 'stacked' } };

    expect(resolveAppearance<FutureExtensionAppearance>({ titles: 'hidden' }, { filters: { layout: 'stacked' } })).toEqual({
        titles: 'hidden',
        filters: { layout: 'stacked' },
    });
    expect(resolveAppearance<DataGridComponentAppearance>(undefined, { dataGrid: {} })).toEqual({ dataGrid: {} });
});

test('skips undefined component appearance extensions', () => {
    expect(resolveAppearance<DataGridComponentAppearance>(undefined, { dataGrid: undefined })).toBeUndefined();
});

test('never copies extensions from the global appearance', () => {
    // Simulates an untyped integration passing a component-only field through Core.
    const globalWithExtension: DataGridComponentAppearance = { titles: 'hidden', dataGrid: { density: 'condensed' } };

    expect(resolveAppearance(globalWithExtension, undefined)).toEqual({ titles: 'hidden' });
});

test('falls back to global appearance when a component field is explicitly undefined', () => {
    expect(resolveAppearance({ titles: 'hidden', container: 'hidden' }, { titles: undefined, container: 'visible' })).toEqual({
        titles: 'hidden',
        container: 'visible',
    });
});

test('returns no appearance without global or component options', () => {
    expect(resolveAppearance(undefined, undefined)).toBeUndefined();
});

test('exposes reactive appearance through the core context value', () => {
    const props = shallowReactive<CoreProviderProps>({ translationDomain: 'transactions' });
    const coreContext = createCoreContextValue(props);
    const containerHidden = computed(() => coreContext.appearance?.container === 'hidden');
    const titlesHidden = computed(() => coreContext.appearance?.titles === 'hidden');

    expect(containerHidden.value).toBe(false);
    expect(titlesHidden.value).toBe(false);

    props.appearance = { container: 'hidden', titles: 'hidden' };

    expect(containerHidden.value).toBe(true);
    expect(titlesHidden.value).toBe(true);
});

test.each<[DataGridComponentAppearance | undefined, boolean]>([
    [undefined, false],
    [{ titles: 'hidden' }, false],
    [{ dataGrid: undefined }, false],
    [Object.create({ dataGrid: { density: 'condensed' } }), false],
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

    props.appearance = { titles: 'hidden' };
    expect(condensed.value).toBe(false);

    const undefinedDataGridAppearance: DataGridComponentAppearance = { dataGrid: undefined };
    props.appearance = undefinedDataGridAppearance;
    expect(condensed.value).toBe(false);
});
