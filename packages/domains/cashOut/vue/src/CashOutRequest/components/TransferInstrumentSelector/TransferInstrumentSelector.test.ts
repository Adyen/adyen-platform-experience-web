/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { createApp, h, ref } from 'vue';
import { useCoreContext } from '@integration-components/core/vue';
import type { ICashOutTransferInstrument } from '@integration-components/types';
import TransferInstrumentSelector from './TransferInstrumentSelector.vue';

const transferInstrumentOf = (id: string) =>
    ({
        description: `Account ${id}`,
        eligible: true,
        ineligibilityReasons: [],
        transferInstrumentId: id,
        type: 'bank',
    }) as ICashOutTransferInstrument;

const TRANSFER_INSTRUMENTS = [transferInstrumentOf('TI1'), transferInstrumentOf('TI2')];

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
    const selected = ref<string | undefined>('TI1');
    const target = document.createElement('div');
    const app = createApp({
        setup: () => () =>
            h(TransferInstrumentSelector, {
                currency: 'EUR',
                transferInstruments: TRANSFER_INSTRUMENTS,
                modelValue: selected.value,
                'onUpdate:modelValue': (value: string | undefined) => (selected.value = value),
            }),
    });
    app.mount(target);
    return { selected, unmount: () => app.unmount() };
};

describe('TransferInstrumentSelector', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(useCoreContext).mockReturnValue({ i18n: { get: (key: string) => key } } as unknown as ReturnType<typeof useCoreContext>);
    });

    test('should select the chosen account, whether the dropdown reports its value or its option', () => {
        const { selected, unmount } = renderSelector();

        dropdown.emitChange?.('TI2');
        expect(selected.value).toBe('TI2');

        dropdown.emitChange?.({ value: 'TI1' });
        expect(selected.value).toBe('TI1');

        unmount();
    });

    test('should keep the selected account when the dropdown reports no single value', () => {
        const { selected, unmount } = renderSelector();

        dropdown.emitChange?.(undefined);
        dropdown.emitChange?.(null);
        dropdown.emitChange?.({ value: null });
        dropdown.emitChange?.(['TI2']);

        expect(selected.value).toBe('TI1');

        unmount();
    });
});
