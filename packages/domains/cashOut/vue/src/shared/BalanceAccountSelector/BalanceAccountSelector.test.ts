/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { createApp, h, nextTick, ref } from 'vue';
import { useCoreContext } from '@integration-components/core/vue';
import BalanceAccountSelector from './BalanceAccountSelector.vue';

const OPTIONS = [
    { label: 'Main', value: 'BA1' },
    { label: 'Secondary', value: 'BA2' },
];

const dropdown: { emitChange?: (value: unknown) => void; setExpanded?: (expanded: boolean) => void } = {};

vi.mock('@adyen/bento-vue3', async () => {
    const vue = await import('vue');
    const { defineComponent, h } = vue;

    return {
        // Like Bento's, its combobox tells whether the list is open through aria-expanded.
        BentoDropdown: defineComponent({
            props: { disabled: Boolean },
            emits: ['update:model-value'],
            setup(props, { emit }) {
                const { ref } = vue;
                const expanded = ref(false);
                dropdown.emitChange = value => emit('update:model-value', value);
                dropdown.setExpanded = value => (expanded.value = value);
                return () => h('div', { role: 'combobox', 'aria-expanded': String(expanded.value), 'aria-disabled': String(props.disabled) });
            },
        }),
    };
});

vi.mock('@integration-components/core/vue', () => ({
    useCoreContext: vi.fn(),
}));

const renderSelector = ({ disabled = false } = {}) => {
    const selected = ref<string | undefined>('BA1');
    const onClose = vi.fn();
    const target = document.createElement('div');
    const app = createApp({
        setup: () => () =>
            h(BalanceAccountSelector, {
                options: OPTIONS,
                disabled,
                modelValue: selected.value,
                'onUpdate:modelValue': (value: string | undefined) => (selected.value = value),
                onClose,
            }),
    });
    app.mount(target);
    const combobox = () => target.querySelector('[role="combobox"]');
    return { combobox, onClose, selected, unmount: () => app.unmount() };
};

// The attribute is observed, which reports a change after the current task.
const settle = async () => {
    await nextTick();
    await new Promise(resolve => setTimeout(resolve));
};

describe('BalanceAccountSelector', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(useCoreContext).mockReturnValue({ i18n: { get: (key: string) => key } } as unknown as ReturnType<typeof useCoreContext>);
    });

    // Bento's dropdown tells when it opens but not when it closes, so the selector tells it, from the combobox.
    test('should tell when the list of balance accounts closes', async () => {
        const { onClose, unmount } = renderSelector();

        dropdown.setExpanded?.(true);
        await settle();
        expect(onClose).not.toHaveBeenCalled();

        dropdown.setExpanded?.(false);
        await settle();
        expect(onClose).toHaveBeenCalledOnce();

        unmount();
    });

    test('should not tell anything while the list stays closed', async () => {
        const { onClose, unmount } = renderSelector();

        dropdown.emitChange?.('BA2');
        await settle();

        expect(onClose).not.toHaveBeenCalled();

        unmount();
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

    test('should not let another balance account be selected while disabled', () => {
        const { combobox, selected, unmount } = renderSelector({ disabled: true });

        expect(combobox()?.getAttribute('aria-disabled')).toBe('true');
        dropdown.emitChange?.('BA2');
        expect(selected.value).toBe('BA1');

        unmount();
    });
});
