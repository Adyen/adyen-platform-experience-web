/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { createApp, h, ref } from 'vue';
import { useCoreContext } from '@integration-components/core/vue';
import BalanceAccountSelector from './BalanceAccountSelector.vue';

const OPTIONS = [
    { label: 'Main', value: 'BA1' },
    { label: 'Secondary', value: 'BA2' },
];

const dropdown: { emitChange?: (value: unknown) => void } = {};

vi.mock('@adyen/bento-vue3', async () => {
    const { defineComponent, h } = await import('vue');

    return {
        BentoDropdown: defineComponent({
            emits: ['update:model-value'],
            setup(_, { emit }) {
                dropdown.emitChange = value => emit('update:model-value', value);
                return () => h('div');
            },
        }),
    };
});

vi.mock('@integration-components/core/vue', () => ({
    useCoreContext: vi.fn(),
}));

const renderSelector = () => {
    const selected = ref<string | undefined>('BA1');
    const target = document.createElement('div');
    const app = createApp({
        setup: () => () =>
            h(BalanceAccountSelector, {
                options: OPTIONS,
                modelValue: selected.value,
                'onUpdate:modelValue': (value: string | undefined) => (selected.value = value),
            }),
    });
    app.mount(target);
    return { selected, unmount: () => app.unmount() };
};

describe('BalanceAccountSelector', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(useCoreContext).mockReturnValue({ i18n: { get: (key: string) => key } } as unknown as ReturnType<typeof useCoreContext>);
    });

    test('should select the chosen balance account', () => {
        const { selected, unmount } = renderSelector();

        dropdown.emitChange?.('BA2');
        expect(selected.value).toBe('BA2');

        dropdown.emitChange?.({ value: 'BA1' });
        expect(selected.value).toBe('BA1');

        unmount();
    });

    test('should keep the selected balance account when the dropdown reports no value', () => {
        const { selected, unmount } = renderSelector();

        dropdown.emitChange?.(undefined);
        dropdown.emitChange?.(null);
        dropdown.emitChange?.({ value: null });

        expect(selected.value).toBe('BA1');

        unmount();
    });
});
