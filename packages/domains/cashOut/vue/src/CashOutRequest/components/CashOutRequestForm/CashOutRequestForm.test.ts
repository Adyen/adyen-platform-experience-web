/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { createApp, nextTick, ref, toValue, type PropType } from 'vue';
import { useCoreContext } from '@integration-components/core/vue';
import type { ICashOutEligibility, ICashOutFees, ICashOutResponse, ICashOutTransferInstrument } from '@integration-components/types';
import { useCashOutFees } from '../../composables/useCashOutFees';
import { useInstructCashOut } from '../../composables/useInstructCashOut';
import CashOutRequestForm from './CashOutRequestForm.vue';

const CASH_OUT = 'cashOut.request.actions.cashOut.labels.default';
const CANCEL = 'cashOut.common.actions.cancel.labels.default';
const SUMMARY_TITLE = 'cashOut.request.summary.title';

const transferInstrumentOf = (id: string, ineligibilityReason?: string) =>
    ({
        description: `Account ${id}`,
        eligible: !ineligibilityReason,
        ineligibilityReasons: ineligibilityReason ? [ineligibilityReason] : [],
        transferInstrumentId: id,
        type: 'bank',
    }) as ICashOutTransferInstrument;

const eligibilityOf = (transferInstruments: ICashOutTransferInstrument[], unavailableReason?: string) =>
    ({
        availableBalance: { value: 30000, currency: 'USD' },
        availableForCashOutBalance: { value: 22000, currency: 'USD' },
        isCashoutAvailable: !unavailableReason,
        transferInstruments,
        unavailableReasons: unavailableReason ? [unavailableReason] : [],
    }) as ICashOutEligibility;

const SINGLE_TRANSFER_INSTRUMENT = eligibilityOf([transferInstrumentOf('TI1')]);
const MULTIPLE_TRANSFER_INSTRUMENTS = eligibilityOf([
    transferInstrumentOf('TI1'),
    transferInstrumentOf('TI2'),
    transferInstrumentOf('TI3', 'noInstantTransferRoute'),
]);
const UNAVAILABLE = eligibilityOf([], 'dailyLimitReached');

const feesOf = (fee: number): ICashOutFees => ({
    amount: { value: 22000, currency: 'USD' },
    fee: { value: fee, currency: 'USD' },
    payoutAmount: { value: 22000 - fee, currency: 'USD' },
});

type DropdownItem = { label: string; value: string; description?: string };

const amountField: { setAmount?: (value: number | undefined) => void; disabled?: boolean } = {};

vi.mock('@adyen/bento-vue3', async () => {
    const { defineComponent, h } = await import('vue');
    const stub = (_: unknown, { slots }: { slots: Record<string, (() => unknown) | undefined> }) =>
        h('div', Object.values(slots).map(slot => slot?.()) as never);

    return {
        BentoAlert: stub,
        BentoButton: stub,
        BentoButtonActions: defineComponent({
            props: { actions: { type: Array as PropType<{ title: string; disabled?: boolean; event?: () => void }[]>, required: true } },
            setup(props) {
                return () =>
                    h(
                        'div',
                        props.actions.map(action => h('button', { disabled: action.disabled, onClick: action.event }, action.title))
                    );
            },
        }),
        BentoDropdown: defineComponent({
            props: {
                disabled: Boolean,
                isOptionDisabled: { type: Function as PropType<(option: DropdownItem) => boolean>, required: true },
                items: { type: Array as PropType<DropdownItem[]>, required: true },
            },
            emits: ['update:model-value'],
            setup(props, { emit }) {
                const renderOption = (item: DropdownItem) =>
                    h(
                        'button',
                        { 'data-testid': 'option', disabled: props.isOptionDisabled(item), onClick: () => emit('update:model-value', item.value) },
                        [item.label, item.description].filter(Boolean).join(' ')
                    );
                return () => h('div', { 'data-testid': 'dropdown', 'data-disabled': String(props.disabled) }, props.items.map(renderOption));
            },
        }),
        BentoInfoIcon: () => h('span'),
        BentoLoadingSkeleton: stub,
        BentoLoadingSkeletonTypography: defineComponent({
            props: { textStyle: { type: String, default: 'body' } },
            setup: props => () => h('span', { 'data-text-style': props.textStyle }, 'loading'),
        }),
        BentoTypography: stub,
    };
});

vi.mock('@integration-components/core/vue', () => ({
    useCoreContext: vi.fn(),
}));

vi.mock('../../composables/useCashOutFees', () => ({
    useCashOutFees: vi.fn(),
}));

vi.mock('../../composables/useInstructCashOut', () => ({
    useInstructCashOut: vi.fn(),
}));

vi.mock('../CashOutAmountField/CashOutAmountField.vue', async () => {
    const { defineComponent, h } = await import('vue');

    return {
        default: defineComponent({
            props: { disabled: Boolean },
            emits: ['update:modelValue'],
            setup(props, { emit }) {
                amountField.setAmount = value => emit('update:modelValue', value);
                return () => {
                    amountField.disabled = props.disabled;
                    return h('div', 'amount field');
                };
            },
        }),
    };
});

const CASH_OUT_RESPONSE: ICashOutResponse = {
    id: 'CO1',
    balanceAccount: 'BA1',
    amount: { value: 22000, currency: 'USD' },
    fee: { value: 1101, currency: 'USD' },
    counterparty: { transferInstrumentId: 'TI1' },
};

const mockInstructCashOut = ({ canInstructCashOut = true } = {}) => {
    const state = {
        canInstructCashOut: ref(canInstructCashOut),
        instructCashOut: vi.fn(async (): Promise<ICashOutResponse | undefined> => CASH_OUT_RESPONSE),
        isInstructing: ref(false),
    };
    vi.mocked(useInstructCashOut).mockReturnValue(state as unknown as ReturnType<typeof useInstructCashOut>);
    return state;
};

const mockFees = () => {
    const state = { fees: ref<ICashOutFees>(), feesError: ref<Error>(), isFetchingFees: ref(false) };
    vi.mocked(useCashOutFees).mockReturnValue(state as unknown as ReturnType<typeof useCashOutFees>);
    return state;
};

type FormProps = {
    eligibility: ICashOutEligibility;
    referenceForBeneficiary?: string;
    transferDescription?: string;
    onCashOutResult?: (result: unknown) => void;
    onDismiss?: () => void;
    onContactSupport?: () => void;
    onFeesError?: (error: Error) => void;
};

const renderForm = ({ onCashOutResult = vi.fn(), onFeesError = vi.fn(), ...props }: FormProps) => {
    const target = document.createElement('div');
    const app = createApp(CashOutRequestForm, { balanceAccountId: 'BA1', onCashOutResult, onFeesError, ...props });
    app.mount(target);

    const findButton = (title: string) => [...target.querySelectorAll('button')].find(button => button.textContent === title);
    const findDetail = (label: string) =>
        [...target.querySelectorAll('dt')].find(term => term.textContent === label)?.nextElementSibling?.textContent ?? undefined;

    return { findButton, findDetail, target, unmount: () => app.unmount() };
};

const requestedFeesAmount = () => toValue(vi.mocked(useCashOutFees).mock.calls[0]![0].amount);

describe('CashOutRequestForm', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockInstructCashOut();
        vi.mocked(useCoreContext).mockReturnValue({
            i18n: {
                amount: (value: number, currency: string) => `${value} ${currency}`,
                get: (key: string, options?: { values?: Record<string, string> }) =>
                    options?.values ? `${key} ${Object.values(options.values).join(' ')}` : key,
            },
        } as unknown as ReturnType<typeof useCoreContext>);
    });

    describe('Amount and fees', () => {
        test('should start from the amount available to cash out and request its fees', () => {
            mockFees();
            const { findDetail, unmount } = renderForm({ eligibility: SINGLE_TRANSFER_INSTRUMENT });

            expect(findDetail('cashOut.common.availableForCashOut.label')).toContain('22000 USD USD');
            expect(toValue(vi.mocked(useCashOutFees).mock.calls[0]![0].balanceAccountId)).toBe('BA1');
            expect(requestedFeesAmount()).toEqual({ value: 22000, currency: 'USD' });

            unmount();
        });

        test('should show the fee and the amount received once the fees load', async () => {
            const fees = mockFees();
            fees.isFetchingFees.value = true;
            const { findDetail, target, unmount } = renderForm({ eligibility: SINGLE_TRANSFER_INSTRUMENT });

            expect(findDetail('cashOut.request.fields.fees.label')).toContain('loading');
            expect(target.textContent).not.toContain(SUMMARY_TITLE);

            fees.isFetchingFees.value = false;
            fees.fees.value = feesOf(1101);
            await nextTick();

            expect(findDetail('cashOut.request.fields.fees.label')).toContain('1101 USD USD');
            expect(target.textContent).toContain(`${SUMMARY_TITLE} 20899 USD USD`);

            unmount();
        });

        test('should keep the height of the fee and the amount received while they load', () => {
            const fees = mockFees();
            fees.isFetchingFees.value = true;
            const { target, unmount } = renderForm({ eligibility: SINGLE_TRANSFER_INSTRUMENT });

            const textStyleOf = (placeholder: Element | undefined) => placeholder?.getAttribute('data-text-style');
            const placeholders = [...target.querySelectorAll('[data-text-style]')];

            // The fee is body text, and Bento renders the alert title as wide body text.
            expect(textStyleOf(placeholders.find(placeholder => placeholder.closest('dl')))).toBe('body');
            expect(textStyleOf(placeholders.find(placeholder => !placeholder.closest('dl')))).toBe('body-wide');

            unmount();
        });

        test('should show a free fee', async () => {
            const fees = mockFees();
            fees.fees.value = feesOf(0);
            const { findDetail, unmount } = renderForm({ eligibility: SINGLE_TRANSFER_INSTRUMENT });

            expect(findDetail('cashOut.request.fields.fees.label')).toContain('cashOut.request.fields.fees.free');

            unmount();
        });

        test('should request the fees of the entered amount', async () => {
            mockFees();
            const { unmount } = renderForm({ eligibility: SINGLE_TRANSFER_INSTRUMENT });

            amountField.setAmount?.(1234);
            await nextTick();

            expect(requestedFeesAmount()).toEqual({ value: 1234, currency: 'USD' });

            unmount();
        });

        test('should not request fees nor show the summary for an invalid amount', async () => {
            const fees = mockFees();
            fees.fees.value = feesOf(1101);
            const { findButton, findDetail, target, unmount } = renderForm({ eligibility: SINGLE_TRANSFER_INSTRUMENT });

            amountField.setAmount?.(undefined);
            fees.fees.value = undefined;
            await nextTick();

            expect(requestedFeesAmount()).toBeUndefined();
            expect(findDetail('cashOut.request.fields.fees.label')).toContain('-');
            expect(target.textContent).not.toContain(SUMMARY_TITLE);
            expect(findButton(CASH_OUT)?.disabled).toBe(true);

            unmount();
        });

        test('should report when the fees fail to load', async () => {
            const fees = mockFees();
            const onFeesError = vi.fn();
            const error = new Error('error');
            const { unmount } = renderForm({ eligibility: SINGLE_TRANSFER_INSTRUMENT, onFeesError });

            fees.feesError.value = error;
            await nextTick();

            expect(onFeesError).toHaveBeenCalledWith(error);

            unmount();
        });
    });

    describe('Cash out', () => {
        test('should instruct the cashOut of the amount to the selected account and report the cashOut', async () => {
            const fees = mockFees();
            fees.fees.value = feesOf(1101);
            const instruct = mockInstructCashOut();
            const onCashOutResult = vi.fn();
            const { findButton, unmount } = renderForm({ eligibility: SINGLE_TRANSFER_INSTRUMENT, onCashOutResult });

            findButton(CASH_OUT)?.click();
            await vi.waitFor(() => expect(onCashOutResult).toHaveBeenCalled());

            expect(instruct.instructCashOut).toHaveBeenCalledWith({
                balanceAccountId: 'BA1',
                amount: { value: 22000, currency: 'USD' },
                transferInstrumentId: 'TI1',
            });
            expect(onCashOutResult).toHaveBeenCalledWith({ status: 'success', cashOut: CASH_OUT_RESPONSE });

            unmount();
        });

        test('should send the reference and the description given by the integration', async () => {
            const fees = mockFees();
            fees.fees.value = feesOf(1101);
            const instruct = mockInstructCashOut();
            const onCashOutResult = vi.fn();
            const { findButton, unmount } = renderForm({
                eligibility: SINGLE_TRANSFER_INSTRUMENT,
                onCashOutResult,
                referenceForBeneficiary: 'REF123',
                transferDescription: 'Weekly cashOut',
            });

            findButton(CASH_OUT)?.click();
            await vi.waitFor(() => expect(onCashOutResult).toHaveBeenCalled());

            expect(instruct.instructCashOut).toHaveBeenCalledWith(
                expect.objectContaining({ referenceForBeneficiary: 'REF123', transferDescription: 'Weekly cashOut' })
            );

            unmount();
        });

        test('should report an error when the cashOut fails', async () => {
            const fees = mockFees();
            fees.fees.value = feesOf(1101);
            const instruct = mockInstructCashOut();
            instruct.instructCashOut.mockResolvedValue(undefined);
            const onCashOutResult = vi.fn();
            const { findButton, unmount } = renderForm({ eligibility: SINGLE_TRANSFER_INSTRUMENT, onCashOutResult });

            findButton(CASH_OUT)?.click();
            await vi.waitFor(() => expect(onCashOutResult).toHaveBeenCalled());

            expect(onCashOutResult).toHaveBeenCalledWith({ status: 'error' });

            unmount();
        });

        test('should not let the form change or be sent again while the cashOut is instructed', async () => {
            const fees = mockFees();
            fees.fees.value = feesOf(1101);
            const instruct = mockInstructCashOut();
            const { findButton, unmount } = renderForm({ eligibility: SINGLE_TRANSFER_INSTRUMENT, onDismiss: vi.fn() });

            instruct.isInstructing.value = true;
            await nextTick();

            expect(findButton(CASH_OUT)?.disabled).toBe(true);
            expect(findButton(CANCEL)?.disabled).toBe(true);
            expect(amountField.disabled).toBe(true);

            unmount();
        });

        test('should not offer to cash out without the instruct cashOut endpoint', () => {
            const fees = mockFees();
            fees.fees.value = feesOf(1101);
            mockInstructCashOut({ canInstructCashOut: false });
            const { findButton, unmount } = renderForm({ eligibility: SINGLE_TRANSFER_INSTRUMENT, onDismiss: vi.fn() });

            expect(findButton(CASH_OUT)).toBeUndefined();
            expect(findButton(CANCEL)).toBeDefined();

            unmount();
        });
    });

    describe('Account', () => {
        test('should show the only eligible account as a detail', () => {
            const fees = mockFees();
            fees.fees.value = feesOf(1101);
            const { findButton, findDetail, target, unmount } = renderForm({ eligibility: SINGLE_TRANSFER_INSTRUMENT });

            expect(findDetail('cashOut.request.fields.account.label')).toContain('Account TI1');
            expect(target.querySelector('[data-testid="dropdown"]')).toBeNull();
            expect(findButton(CASH_OUT)?.disabled).toBe(false);

            unmount();
        });

        test('should ask to select an account when several are eligible', async () => {
            const fees = mockFees();
            fees.fees.value = feesOf(1101);
            const { findButton, findDetail, target, unmount } = renderForm({ eligibility: MULTIPLE_TRANSFER_INSTRUMENTS });

            expect(findDetail('cashOut.request.fields.account.label')).toBeUndefined();
            expect(findButton(CASH_OUT)?.disabled).toBe(true);

            target.querySelector<HTMLButtonElement>('[data-testid="option"]')?.click();
            await nextTick();

            expect(findButton(CASH_OUT)?.disabled).toBe(false);

            unmount();
        });

        test('should show ineligible accounts as disabled options with the reason', () => {
            mockFees();
            const { target, unmount } = renderForm({ eligibility: MULTIPLE_TRANSFER_INSTRUMENTS });

            const options = [...target.querySelectorAll<HTMLButtonElement>('[data-testid="option"]')];

            expect(options.map(option => [option.textContent, option.disabled])).toEqual([
                ['Account TI1', false],
                ['Account TI2', false],
                ['Account TI3 cashOut.request.fields.transferInstrument.ineligibilityReasons.noInstantTransferRoute', true],
            ]);

            unmount();
        });

        test('should name the currency of the cashOut for an account that cannot receive it', () => {
            mockFees();
            const { target, unmount } = renderForm({
                eligibility: eligibilityOf([
                    transferInstrumentOf('TI1'),
                    transferInstrumentOf('TI2'),
                    transferInstrumentOf('TI3', 'transferInstrumentCurrencyMismatch'),
                ]),
            });

            const options = [...target.querySelectorAll<HTMLButtonElement>('[data-testid="option"]')];

            expect(options.at(-1)?.textContent).toBe(
                'Account TI3 cashOut.request.fields.transferInstrument.ineligibilityReasons.transferInstrumentCurrencyMismatch USD'
            );

            unmount();
        });

        test('should show no reason for an account the account holder is not allowed to send cashOuts to', () => {
            mockFees();
            const { target, unmount } = renderForm({
                eligibility: eligibilityOf([
                    transferInstrumentOf('TI1'),
                    transferInstrumentOf('TI2'),
                    transferInstrumentOf('TI3', 'sendToTransferInstrumentNotAllowed'),
                ]),
            });

            const options = [...target.querySelectorAll<HTMLButtonElement>('[data-testid="option"]')];

            expect(options.map(option => [option.textContent, option.disabled])).toEqual([
                ['Account TI1', false],
                ['Account TI2', false],
                ['Account TI3', true],
            ]);

            unmount();
        });

        test('should list eligible accounts first, keeping the order of the API within each group', () => {
            mockFees();
            const { target, unmount } = renderForm({
                eligibility: eligibilityOf([
                    transferInstrumentOf('TI1', 'noInstantTransferRoute'),
                    transferInstrumentOf('TI2'),
                    transferInstrumentOf('TI3', 'transferInstrumentCurrencyMismatch'),
                    transferInstrumentOf('TI4'),
                ]),
            });

            const options = [...target.querySelectorAll<HTMLButtonElement>('[data-testid="option"]')];

            expect(options.map(option => option.textContent?.split(' ').slice(0, 2).join(' '))).toEqual([
                'Account TI2',
                'Account TI4',
                'Account TI1',
                'Account TI3',
            ]);

            unmount();
        });
    });

    describe('Unavailable', () => {
        test('should explain why cashOut is unavailable and disable the form', () => {
            mockFees();
            const { findButton, findDetail, target, unmount } = renderForm({ eligibility: UNAVAILABLE });

            expect(target.textContent).toContain('cashOut.common.unavailableReasons.dailyLimitReached');
            expect(target.textContent).not.toContain(SUMMARY_TITLE);
            expect(amountField.disabled).toBe(true);
            expect(target.querySelector('[data-testid="dropdown"]')?.getAttribute('data-disabled')).toBe('true');
            expect(findDetail('cashOut.request.fields.fees.label')).toContain('-');
            expect(requestedFeesAmount()).toBeUndefined();
            expect(findButton(CASH_OUT)?.disabled).toBe(true);

            unmount();
        });
    });

    describe('Cancel', () => {
        test('should call onDismiss when the cancel button is clicked', () => {
            mockFees();
            const onDismiss = vi.fn();
            const { findButton, unmount } = renderForm({ eligibility: SINGLE_TRANSFER_INSTRUMENT, onDismiss });

            findButton(CANCEL)?.click();

            expect(onDismiss).toHaveBeenCalledTimes(1);

            unmount();
        });

        test('should not show the cancel button without an onDismiss callback', () => {
            mockFees();
            const { findButton, unmount } = renderForm({ eligibility: SINGLE_TRANSFER_INSTRUMENT });

            expect(findButton(CANCEL)).toBeUndefined();

            unmount();
        });
    });
});
