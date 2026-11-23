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
        // Like Bento's, its combobox tells whether the list is open through aria-expanded. When it can be searched, the combobox
        // is another element while the list is open: an input to type the search into.
        BentoDropdown: defineComponent({
            props: { disabled: Boolean, dynamicFiltering: Boolean },
            emits: ['update:model-value'],
            setup(props, { emit }) {
                const { ref } = vue;
                const expanded = ref(false);
                dropdown.emitChange = value => emit('update:model-value', value);
                dropdown.setExpanded = value => (expanded.value = value);
                return () =>
                    h(props.dynamicFiltering && expanded.value ? 'input' : 'div', {
                        key: props.dynamicFiltering && expanded.value ? 'search' : 'selection',
                        role: 'combobox',
                        'aria-expanded': String(expanded.value),
                        'aria-disabled': String(props.disabled),
                        'data-searchable': String(props.dynamicFiltering),
                    });
            },
        }),
    };
});

vi.mock('@integration-components/core/vue', () => ({
    useCoreContext: vi.fn(),
}));

const optionsOf = (count: number) => Array.from({ length: count }, (_, index) => ({ label: `Account ${index + 1}`, value: `BA${index + 1}` }));

const renderSelector = ({ disabled = false, options = OPTIONS } = {}) => {
    const selected = ref<string | undefined>('BA1');
    const onClose = vi.fn();
    const target = document.createElement('div');
    const app = createApp({
        setup: () => () =>
            h(BalanceAccountSelector, {
                options,
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

    test('should tell when the list of balance accounts closes, while they can be searched', async () => {
        const { onClose, unmount } = renderSelector({ options: optionsOf(10) });

        dropdown.setExpanded?.(true);
        await settle();
        expect(onClose).not.toHaveBeenCalled();

        dropdown.setExpanded?.(false);
        await settle();
        expect(onClose).toHaveBeenCalledOnce();

        // Opened and closed again, it tells it again
        dropdown.setExpanded?.(true);
        await settle();
        dropdown.setExpanded?.(false);
        await settle();
        expect(onClose).toHaveBeenCalledTimes(2);

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

    // From 10 balance accounts, so one can be found among many
    test.each([
        [9, 'false'],
        [10, 'true'],
        [25, 'true'],
    ])('with %i balance accounts, should let them be searched: %s', (count, searchable) => {
        const { combobox, unmount } = renderSelector({ options: optionsOf(count) });

        expect(combobox()?.getAttribute('data-searchable')).toBe(searchable);

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
