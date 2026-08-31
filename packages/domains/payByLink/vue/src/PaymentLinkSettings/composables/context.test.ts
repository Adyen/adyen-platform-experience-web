import { computed, effectScope, ref } from 'vue';
import { describe, expect, test, vi } from 'vitest';
import { providePaymentLinkSettings } from './context';

vi.mock('@integration-components/composables-vue', () => ({
    containerQueries: { down: { xs: 'xs' } },
    useResponsiveContainer: () => ref(false),
}));

vi.mock('./useSettingsPermission', () => ({
    useSettingsPermission: () => ({ termsAndConditionsEnabled: ref(true), themeEnabled: ref(true) }),
}));

vi.mock('./useStores', () => ({
    useStores: () => ({
        allStores: computed(() => []),
        error: ref(undefined),
        filteredStores: computed(() => []),
        isFetching: ref(false),
        selectedStore: ref(undefined),
        setSelectedStore: vi.fn(),
    }),
}));

vi.mock('./useStoreTheme', () => ({
    useStoreTheme: () => ({ error: ref(undefined), isFetching: ref(false), theme: ref(undefined) }),
}));

vi.mock('./useStoreTermsAndConditions', () => ({
    useStoreTermsAndConditions: () => ({ data: ref(undefined), error: ref(undefined), isFetching: ref(false) }),
}));

vi.mock('./useSaveAction', () => ({
    useSaveAction: () => ({ onSave: vi.fn() }),
}));

describe('providePaymentLinkSettings', () => {
    test('keeps injected menu labels reactive', () => {
        const menuItems = ref([
            { label: 'Theme', value: 'theme' as const },
            { label: 'Terms and Conditions', value: 'termsAndConditions' as const },
        ]);
        const scope = effectScope();
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        const context = scope.run(() =>
            providePaymentLinkSettings({
                selectedMenuItems: computed(() => menuItems.value),
            })
        )!;

        expect(context.menuItems.value.map(item => item.label)).toEqual(['Theme', 'Terms and Conditions']);

        menuItems.value = [
            { label: 'Thème', value: 'theme' },
            { label: 'Conditions générales', value: 'termsAndConditions' },
        ];

        expect(context.menuItems.value.map(item => item.label)).toEqual(['Thème', 'Conditions générales']);
        scope.stop();
        warn.mockRestore();
    });
});
