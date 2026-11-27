/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { createApp, h, ref } from 'vue';
import { useCoreContext } from '@integration-components/core/vue';
import type { ICashOutTransferInstrument } from '@integration-components/types';
import TransferInstrumentSelector from './TransferInstrumentSelector.vue';

const { addEvent } = vi.hoisted(() => ({ addEvent: vi.fn() }));

const transferInstrumentOf = (id: string) =>
    ({
        description: `Account ${id}`,
        eligible: true,
        ineligibilityReasons: [],
        transferInstrumentId: id,
    }) as ICashOutTransferInstrument;

const TRANSFER_INSTRUMENTS = [transferInstrumentOf('TI1'), transferInstrumentOf('TI2')];

const transferInstrumentsOf = (count: number) => Array.from({ length: count }, (_, index) => transferInstrumentOf(`TI${index + 1}`));

const dropdown: { emitChange?: (value: unknown) => void } = {};

vi.mock('@adyen/bento-vue3', async () => {
    const { defineComponent, h } = await import('vue');

    return {
        BentoDropdown: defineComponent({
            props: { dynamicFiltering: Boolean },
            emits: ['update:model-value'],
            setup(props, { emit }) {
                dropdown.emitChange = value => emit('update:model-value', value);
                // An input, like Bento's, which holds what is typed to search
                return () => h('input', { role: 'combobox', 'data-searchable': String(props.dynamicFiltering) });
            },
        }),
    };
});

vi.mock('@integration-components/core/vue', () => ({
    useEventDispatcherContext: () => ({ addEvent }),
    useCoreContext: vi.fn(),
}));

const renderSelector = (transferInstruments = TRANSFER_INSTRUMENTS) => {
    const selected = ref<string | undefined>('TI1');
    const target = document.createElement('div');
    const app = createApp({
        setup: () => () =>
            h(TransferInstrumentSelector, {
                currency: 'EUR',
                transferInstruments,
                modelValue: selected.value,
                'onUpdate:modelValue': (value: string | undefined) => (selected.value = value),
            }),
    });
    app.mount(target);
    const combobox = () => target.querySelector('[role="combobox"]');
    return { combobox, selected, unmount: () => app.unmount() };
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

    // From 10 accounts, so one can be found among many; the ones that can't receive the cashOut count too, as they are listed
    test.each([
        [9, 'false'],
        [10, 'true'],
        [25, 'true'],
    ])('with %i accounts, should let them be searched: %s', (count, searchable) => {
        const { combobox, unmount } = renderSelector(transferInstrumentsOf(count));

        expect(combobox()?.getAttribute('data-searchable')).toBe(searchable);

        unmount();
    });

    test('should count the accounts that cannot receive the cashOut, as they are listed', () => {
        const transferInstruments = transferInstrumentsOf(10).map((transferInstrument, index) =>
            index < 5 ? { ...transferInstrument, eligible: false } : transferInstrument
        );
        const { combobox, unmount } = renderSelector(transferInstruments);

        expect(combobox()?.getAttribute('data-searchable')).toBe('true');

        unmount();
    });

    describe('Analytics', () => {
        const CHANGED = { category: 'CashOut request component', subCategory: 'Request' };

        test('should tell another bank account was selected, with how many are listed', () => {
            const { unmount } = renderSelector();

            dropdown.emitChange?.('TI2');

            expect(addEvent).toHaveBeenCalledWith('Changed bank account', { ...CHANGED, usedSearch: false, bankAccountCount: '2-9' });

            unmount();
        });

        test('should not tell the selected bank account selected again', () => {
            const { unmount } = renderSelector();

            dropdown.emitChange?.('TI1');

            expect(addEvent).not.toHaveBeenCalled();

            unmount();
        });

        test('should tell a bank account selected from a search', () => {
            const { combobox, unmount } = renderSelector(transferInstrumentsOf(10));
            (combobox() as HTMLInputElement).value = 'Account TI7';

            dropdown.emitChange?.('TI7');

            expect(addEvent).toHaveBeenCalledWith('Changed bank account', { ...CHANGED, usedSearch: true, bankAccountCount: '10+' });

            unmount();
        });
    });
});
