import { computed, shallowReactive } from 'vue';
import { expect, test } from 'vitest';
import { createCoreContextValue } from './Context/createCoreContextValue';
import type { CoreProviderProps } from './Context/types';
import { resolveAppearance } from './customization';

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

test('returns no appearance without global or component options', () => {
    expect(resolveAppearance(undefined, undefined)).toBeUndefined();
});

test('exposes reactive appearance through the core context value', () => {
    const props = shallowReactive<CoreProviderProps>({});
    const coreContext = createCoreContextValue(props);
    const illustrationsHidden = computed(() => coreContext.appearance?.illustrations === 'hidden');
    const titlesHidden = computed(() => coreContext.appearance?.titles === 'hidden');

    expect(illustrationsHidden.value).toBe(false);
    expect(titlesHidden.value).toBe(false);

    props.appearance = { illustrations: 'hidden', titles: 'hidden' };

    expect(illustrationsHidden.value).toBe(true);
    expect(titlesHidden.value).toBe(true);
});
