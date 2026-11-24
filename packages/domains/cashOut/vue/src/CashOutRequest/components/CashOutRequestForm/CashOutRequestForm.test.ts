/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { createApp, h, nextTick, ref, toValue, type PropType } from 'vue';
import { useCoreContext } from '@integration-components/core/vue';
import type { ICashOutEligibility, ICashOutFees, ICashOutResponse, ICashOutTransferInstrument } from '@integration-components/types';
import { useCashOutFees } from '../../composables/useCashOutFees';
import { useInstructCashOut } from '../../composables/useInstructCashOut';
import { provideCashOutAnalytics } from '../../../shared/composables/useCashOutAnalytics';
import CashOutRequestForm from './CashOutRequestForm.vue';

const { addEvent } = vi.hoisted(() => ({ addEvent: vi.fn() }));

const CASH_OUT = 'cashOut.request.actions.cashOut.labels.default';
const SUMMARY_TITLE = 'cashOut.request.summary.title';
const AVAILABLE_FOR_CASH_OUT = 'cashOut.request.availableForCashOut';
const AMOUNT_BELOW_FEE = 'cashOut.request.errors.amountBelowFee';

const transferInstrumentOf = (id: string, ineligibilityReason?: string) =>
    ({
        description: `Account ${id}`,
        eligible: !ineligibilityReason,
        ineligibilityReasons: ineligibilityReason ? [ineligibilityReason] : [],
        transferInstrumentId: id,
    }) as ICashOutTransferInstrument;

const eligibilityOf = (transferInstruments: ICashOutTransferInstrument[], unavailableReason?: string) =>
    ({
        availableForCashOutBalance: { value: 22000, currency: 'USD' },
        feeStructure: { fixedAmount: { value: 50, currency: 'USD' }, variableBasisPoints: 150 },
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
const SINGLE_ELIGIBLE_TRANSFER_INSTRUMENT = eligibilityOf([
    transferInstrumentOf('TI1'),
    transferInstrumentOf('TI2', 'noInstantTransferRoute'),
    transferInstrumentOf('TI3', 'transferInstrumentCurrencyMismatch'),
]);
const UNAVAILABLE = eligibilityOf([], 'dailyLimitReached');

const feesOf = (fee: number): ICashOutFees => ({
    amount: { value: 22000, currency: 'USD' },
    fee: { value: fee, currency: 'USD' },
    payoutAmount: { value: 22000 - fee, currency: 'USD' },
});

type DropdownItem = { label: string; value: string; description?: string };

const amountField: { setAmount?: (value: number | undefined) => void; disabled?: boolean; value?: number } = {};

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
        BentoInfoIcon: defineComponent({
            props: { tooltipText: { type: String, required: true } },
            setup: props => () => h('span', { 'data-tooltip': props.tooltipText }),
        }),
        BentoLoadingSkeleton: stub,
        BentoLoadingSkeletonTypography: defineComponent({
            props: { textStyle: { type: String, default: 'body' } },
            setup: props => () => h('span', { 'data-text-style': props.textStyle }, 'loading'),
        }),
        BentoTypography: stub,
    };
});

vi.mock('@integration-components/core/vue', () => ({
    useEventDispatcherContext: () => ({ addEvent }),
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
            props: { disabled: Boolean, modelValue: { type: Number, default: undefined } },
            emits: ['update:modelValue'],
            setup(props, { emit }) {
                amountField.setAmount = value => emit('update:modelValue', value);
                return () => {
                    amountField.disabled = props.disabled;
                    amountField.value = props.modelValue;
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
        instructError: ref<unknown>(),
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
    onResult?: (result: unknown) => void;
    onContactSupport?: () => void;
    onFeesError?: (error: Error) => void;
    onInstructingChange?: (isInstructing: boolean) => void;
};

const renderForm = ({ onResult = vi.fn(), onFeesError = vi.fn(), ...props }: FormProps) => {
    const target = document.createElement('div');
    const app = createApp(CashOutRequestForm, { accountKey: 'BalanceAccount.BA1', onResult, onFeesError, ...props });
    app.mount(target);

    const findButton = (title: string) => [...target.querySelectorAll('button')].find(button => button.textContent === title);
    const findTerm = (label: string) => [...target.querySelectorAll('dt')].find(term => term.textContent === label);
    const findDetail = (label: string) => findTerm(label)?.nextElementSibling?.textContent ?? undefined;
    const findTooltip = (label: string) => findTerm(label)?.querySelector('[data-tooltip]')?.getAttribute('data-tooltip') ?? undefined;
    const findAvailableForCashOut = () =>
        [...target.querySelectorAll('*')].find(element => !element.children.length && element.textContent?.startsWith(AVAILABLE_FOR_CASH_OUT));
    const findAvailableForCashOutTooltip = () =>
        findAvailableForCashOut()?.parentElement?.querySelector('[data-tooltip]')?.getAttribute('data-tooltip') ?? undefined;

    return { findAvailableForCashOut, findAvailableForCashOutTooltip, findButton, findDetail, findTooltip, target, unmount: () => app.unmount() };
};

// Like the component the form is in, whose eligibility tells another amount available once the available amounts are loaded again
const renderFormWithEligibility = (initial: ICashOutEligibility) => {
    const eligibility = ref(initial);
    const target = document.createElement('div');
    const app = createApp({
        setup: () => () =>
            h(CashOutRequestForm, { accountKey: 'BalanceAccount.BA1', onResult: vi.fn(), onFeesError: vi.fn(), eligibility: eligibility.value }),
    });
    app.mount(target);
    const setAvailable = async (value: number) => {
        eligibility.value = { ...eligibility.value, availableForCashOutBalance: { value, currency: 'USD' } };
        await nextTick();
    };
    return { setAvailable, unmount: () => app.unmount() };
};

const requestedFeesAmount = () => toValue(vi.mocked(useCashOutFees).mock.calls[0]![0].amount);

describe('CashOutRequestForm', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockInstructCashOut();
        vi.mocked(useCoreContext).mockReturnValue({
            i18n: {
                amount: (value: number, currency: string) => `${value} ${currency}`,
                locale: 'en-US',
                // The count, which picks the plural form, shows only when it's given.
                get: (key: string, options?: { values?: Record<string, string>; count?: number }) =>
                    [key, ...Object.values(options?.values ?? {}), ...(options?.count === undefined ? [] : [`count=${options.count}`])].join(' '),
            },
        } as unknown as ReturnType<typeof useCoreContext>);
    });

    describe('Amount and fees', () => {
        test('should start from the amount available to cash out and request its fees', () => {
            mockFees();
            const { findAvailableForCashOut, findDetail, unmount } = renderForm({ eligibility: SINGLE_TRANSFER_INSTRUMENT });

            expect(findAvailableForCashOut()?.textContent).toBe(`${AVAILABLE_FOR_CASH_OUT} 22000 USD`);
            expect(findDetail('cashOut.common.availableForCashOut.label')).toBeUndefined();
            expect(amountField.value).toBe(22000);
            expect(toValue(vi.mocked(useCashOutFees).mock.calls[0]![0].accountKey)).toBe('BalanceAccount.BA1');
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

            expect(findDetail('cashOut.request.fields.fees.label')).toBe('1101 USD');
            expect(target.textContent).toContain(`${SUMMARY_TITLE} 20899 USD`);
            expect(target.textContent).not.toContain('USD USD');

            unmount();
        });

        // Per currency, from the arrival times of the CDN; the bundled ones give USD 5 minutes, and a currency without its own 30.
        test.each([
            ['USD', 5],
            ['SEK', 30],
        ])('should tell when money in %s usually arrives', async (currency, minutes) => {
            const fees = mockFees();
            fees.fees.value = feesOf(1101);
            const eligibility = { ...SINGLE_TRANSFER_INSTRUMENT, availableForCashOutBalance: { value: 22000, currency } } as ICashOutEligibility;
            const { target, unmount } = renderForm({ eligibility });
            await nextTick();

            expect(target.textContent).toContain(
                `cashOut.request.summary.description cashOut.common.arrivalTime.withinMinutes ${minutes} count=${minutes}`
            );

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

        test('should not allow cashing out an amount the fee takes all of', async () => {
            const fees = mockFees();
            fees.fees.value = feesOf(1101);
            const { findButton, target, unmount } = renderForm({ eligibility: SINGLE_TRANSFER_INSTRUMENT });

            expect(findButton(CASH_OUT)?.disabled).toBe(false);

            fees.fees.value = feesOf(22000);
            await nextTick();

            expect(target.textContent).toContain(AMOUNT_BELOW_FEE);
            expect(target.textContent).not.toContain(SUMMARY_TITLE);
            expect(findButton(CASH_OUT)?.disabled).toBe(true);

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

        // The amount filled in is what was available, so it follows what is available, unlike an amount the user entered
        test('should fill in what is available to cash out once it changes, when the amount is still what was available', async () => {
            mockFees();
            const { setAvailable, unmount } = renderFormWithEligibility(SINGLE_TRANSFER_INSTRUMENT);
            expect(amountField.value).toBe(22000);

            await setAvailable(15000);

            expect(amountField.value).toBe(15000);

            unmount();
        });

        test('should keep the amount the user entered once what is available to cash out changes', async () => {
            mockFees();
            const { setAvailable, unmount } = renderFormWithEligibility(SINGLE_TRANSFER_INSTRUMENT);
            amountField.setAmount?.(10000);
            await nextTick();

            await setAvailable(15000);

            expect(amountField.value).toBe(10000);

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
            expect(findDetail('cashOut.request.fields.fees.label')).toBe('--');
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

    describe('Tooltips', () => {
        const FEES = 'cashOut.request.fields.fees.label';
        const withFeeStructure = (fixedAmount: number, variableBasisPoints: number) =>
            ({
                ...SINGLE_TRANSFER_INSTRUMENT,
                feeStructure: { fixedAmount: { value: fixedAmount, currency: 'USD' }, variableBasisPoints },
            }) as ICashOutEligibility;

        test.each([
            ['a fixed amount plus a percentage', withFeeStructure(50, 150), 'cashOut.request.fields.fees.tooltips.fixedAndVariable 50 USD 1.5%'],
            ['only a percentage', withFeeStructure(0, 150), 'cashOut.request.fields.fees.tooltips.variable 1.5%'],
            ['only a fixed amount', withFeeStructure(50, 0), 'cashOut.request.fields.fees.tooltips.fixed 50 USD'],
            ['no fee', withFeeStructure(0, 0), 'cashOut.request.fields.fees.tooltips.free'],
        ])('should explain a fee of %s', (_, eligibility, tooltip) => {
            mockFees();
            const { findTooltip, unmount } = renderForm({ eligibility });

            expect(findTooltip(FEES)).toBe(tooltip);

            unmount();
        });

        test('should mention the daily limit of the balance account in what is available to cash out', () => {
            mockFees();
            const eligibility = { ...SINGLE_TRANSFER_INSTRUMENT, dailyLimit: { value: 2_500_000, currency: 'USD' } } as ICashOutEligibility;
            const { findAvailableForCashOutTooltip, unmount } = renderForm({ eligibility });

            expect(findAvailableForCashOutTooltip()).toBe('cashOut.common.availableForCashOut.tooltips.withDailyLimit 2500000 USD');

            unmount();
        });

        test('should explain what is available to cash out without a limit when the balance account has none', () => {
            mockFees();
            const { findAvailableForCashOutTooltip, unmount } = renderForm({ eligibility: SINGLE_TRANSFER_INSTRUMENT });

            expect(findAvailableForCashOutTooltip()).toBe('cashOut.common.availableForCashOut.tooltips.default');

            unmount();
        });
    });

    describe('Cash out', () => {
        // So the component it is in can keep the user from loading another eligibility while the cashOut is sent.
        test('should tell when the cashOut starts and stops being sent', async () => {
            mockFees().fees.value = feesOf(1101);
            const instruct = mockInstructCashOut();
            const onInstructingChange = vi.fn();
            const { unmount } = renderForm({ eligibility: SINGLE_TRANSFER_INSTRUMENT, onInstructingChange });

            instruct.isInstructing.value = true;
            await nextTick();
            expect(onInstructingChange).toHaveBeenLastCalledWith(true);

            instruct.isInstructing.value = false;
            await nextTick();
            expect(onInstructingChange).toHaveBeenLastCalledWith(false);

            unmount();
        });

        // With the fee shown for the amount, so the API rejects the cashOut when the fee configuration changed since.
        test('should instruct the cashOut of the amount, with the fee shown for it, to the selected account and report the cashOut', async () => {
            const fees = mockFees();
            fees.fees.value = feesOf(1101);
            const instruct = mockInstructCashOut();
            const onResult = vi.fn();
            const { findButton, unmount } = renderForm({ eligibility: SINGLE_TRANSFER_INSTRUMENT, onResult });

            findButton(CASH_OUT)?.click();
            await vi.waitFor(() => expect(onResult).toHaveBeenCalled());

            expect(instruct.instructCashOut).toHaveBeenCalledWith({
                accountKey: 'BalanceAccount.BA1',
                amount: { value: 22000, currency: 'USD' },
                expectedFee: 1101,
                transferInstrumentId: 'TI1',
            });
            expect(onResult).toHaveBeenCalledWith({ status: 'success', cashOut: CASH_OUT_RESPONSE });

            unmount();
        });

        test('should instruct the cashOut with a free fee as its expected fee', async () => {
            const fees = mockFees();
            fees.fees.value = feesOf(0);
            const instruct = mockInstructCashOut();
            const onResult = vi.fn();
            const { findButton, unmount } = renderForm({ eligibility: SINGLE_TRANSFER_INSTRUMENT, onResult });

            findButton(CASH_OUT)?.click();
            await vi.waitFor(() => expect(onResult).toHaveBeenCalled());

            expect(instruct.instructCashOut).toHaveBeenCalledWith(expect.objectContaining({ expectedFee: 0 }));

            unmount();
        });

        test('should send the reference and the description given by the integration', async () => {
            const fees = mockFees();
            fees.fees.value = feesOf(1101);
            const instruct = mockInstructCashOut();
            const onResult = vi.fn();
            const { findButton, unmount } = renderForm({
                eligibility: SINGLE_TRANSFER_INSTRUMENT,
                onResult,
                referenceForBeneficiary: 'REF123',
                transferDescription: 'Weekly cashOut',
            });

            findButton(CASH_OUT)?.click();
            await vi.waitFor(() => expect(onResult).toHaveBeenCalled());

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
            const onResult = vi.fn();
            const { findButton, unmount } = renderForm({ eligibility: SINGLE_TRANSFER_INSTRUMENT, onResult });

            findButton(CASH_OUT)?.click();
            await vi.waitFor(() => expect(onResult).toHaveBeenCalled());

            expect(onResult).toHaveBeenCalledWith({ status: 'error' });

            unmount();
        });

        test('should not let the form change or be sent again while the cashOut is instructed', async () => {
            const fees = mockFees();
            fees.fees.value = feesOf(1101);
            const instruct = mockInstructCashOut();
            const { findButton, unmount } = renderForm({ eligibility: SINGLE_TRANSFER_INSTRUMENT });

            instruct.isInstructing.value = true;
            await nextTick();

            expect(findButton(CASH_OUT)?.disabled).toBe(true);
            expect(amountField.disabled).toBe(true);

            unmount();
        });

        test('should not offer to cash out without the instruct cashOut endpoint', () => {
            const fees = mockFees();
            fees.fees.value = feesOf(1101);
            mockInstructCashOut({ canInstructCashOut: false });
            const { target, unmount } = renderForm({ eligibility: SINGLE_TRANSFER_INSTRUMENT });

            expect(target.querySelector('button')).toBeNull();

            unmount();
        });
    });

    describe('Account', () => {
        test('should show the only account as a detail', () => {
            const fees = mockFees();
            fees.fees.value = feesOf(1101);
            const { findButton, findDetail, target, unmount } = renderForm({ eligibility: SINGLE_TRANSFER_INSTRUMENT });

            expect(findDetail('cashOut.request.fields.transferInstrument.label')).toContain('Account TI1');
            expect(target.querySelector('[data-testid="dropdown"]')).toBeNull();
            expect(findButton(CASH_OUT)?.disabled).toBe(false);

            unmount();
        });

        test('should list the ineligible accounts next to the only eligible one, which is selected', () => {
            const fees = mockFees();
            fees.fees.value = feesOf(1101);
            const { findButton, findDetail, target, unmount } = renderForm({ eligibility: SINGLE_ELIGIBLE_TRANSFER_INSTRUMENT });

            const options = [...target.querySelectorAll<HTMLButtonElement>('[data-testid="option"]')];

            expect(findDetail('cashOut.request.fields.transferInstrument.label')).toBeUndefined();
            expect(options.map(option => [option.textContent, option.disabled])).toEqual([
                ['Account TI1', false],
                ['Account TI2 cashOut.request.fields.transferInstrument.ineligibilityReasons.noInstantTransferRoute', true],
                ['Account TI3 cashOut.request.fields.transferInstrument.ineligibilityReasons.transferInstrumentCurrencyMismatch USD', true],
            ]);
            expect(findButton(CASH_OUT)?.disabled).toBe(false);

            unmount();
        });

        test('should ask to select an account when several are eligible', async () => {
            const fees = mockFees();
            fees.fees.value = feesOf(1101);
            const { findButton, findDetail, target, unmount } = renderForm({ eligibility: MULTIPLE_TRANSFER_INSTRUMENTS });

            expect(findDetail('cashOut.request.fields.transferInstrument.label')).toBeUndefined();
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
            // What is available stays in the field, disabled, but its fees aren't requested.
            expect(amountField.value).toBe(22000);
            expect(amountField.disabled).toBe(true);
            expect(target.querySelector('[data-testid="dropdown"]')?.getAttribute('data-disabled')).toBe('true');
            expect(findDetail('cashOut.request.fields.fees.label')).toBe('--');
            expect(requestedFeesAmount()).toBeUndefined();
            expect(findButton(CASH_OUT)?.disabled).toBe(true);

            unmount();
        });
    });

    describe('Unavailable with a single eligible bank account', () => {
        test.each([
            ['the only bank account', [transferInstrumentOf('TI1')]],
            [
                'the only eligible one of several bank accounts',
                [
                    transferInstrumentOf('TI2', 'noInstantTransferRoute'),
                    transferInstrumentOf('TI1'),
                    transferInstrumentOf('TI3', 'transferInstrumentCurrencyMismatch'),
                ],
            ],
        ])('should show %s as a detail instead of the dropdown', (_, transferInstruments) => {
            mockFees();
            const { findDetail, target, unmount } = renderForm({ eligibility: eligibilityOf(transferInstruments, 'zeroBalance') });

            expect(findDetail('cashOut.request.fields.transferInstrument.label')).toBe('Account TI1');
            expect(target.querySelector('[data-testid="dropdown"]')).toBeNull();

            unmount();
        });

        test.each([
            ['a single ineligible bank account', [transferInstrumentOf('TI1', 'noInstantTransferRoute')]],
            ['several eligible bank accounts', [transferInstrumentOf('TI1'), transferInstrumentOf('TI2')]],
        ])('should keep the disabled dropdown for %s', (_, transferInstruments) => {
            mockFees();
            const { findDetail, target, unmount } = renderForm({ eligibility: eligibilityOf(transferInstruments, 'zeroBalance') });

            expect(findDetail('cashOut.request.fields.transferInstrument.label')).toBeUndefined();
            expect(target.querySelector('[data-testid="dropdown"]')?.getAttribute('data-disabled')).toBe('true');

            unmount();
        });
    });

    describe('Actions', () => {
        test('should only offer to cash out, without a cancel button', () => {
            mockFees();
            const { target, unmount } = renderForm({ eligibility: SINGLE_TRANSFER_INSTRUMENT });

            expect([...target.querySelectorAll('button')].map(button => button.textContent)).toEqual([CASH_OUT]);

            unmount();
        });
    });

    describe('Analytics', () => {
        const REQUEST = { category: 'CashOut request component', subCategory: 'Request' } as const;

        // Like the request the form is in, which started some time ago
        const renderFormStartedAgo = (seconds: number) => {
            const target = document.createElement('div');
            const app = createApp({
                setup() {
                    provideCashOutAnalytics({ ...REQUEST, startedAt: Date.now() - seconds * 1000 });
                    return () =>
                        h(CashOutRequestForm, {
                            accountKey: 'BalanceAccount.BA1',
                            eligibility: SINGLE_TRANSFER_INSTRUMENT,
                            onResult,
                            onFeesError: vi.fn(),
                        });
                },
            });
            const onResult = vi.fn();
            app.mount(target);
            const findButton = (title: string) => [...target.querySelectorAll('button')].find(button => button.textContent === title);
            return { findButton, onResult, unmount: () => app.unmount() };
        };

        test('should tell the cashOut was sent, then completed, with how much of what is available and how long it took', async () => {
            mockFees().fees.value = feesOf(1101);
            mockInstructCashOut();
            const { findButton, onResult, unmount } = renderFormStartedAgo(90);

            findButton(CASH_OUT)?.click();
            await vi.waitFor(() => expect(onResult).toHaveBeenCalled());

            expect(addEvent.mock.calls).toEqual([
                ['Clicked button', { ...REQUEST, label: 'Cash out now', isWholeAmount: true, amountShare: '75-100%', isFeeFree: false }],
                ['Completed cashOut', { ...REQUEST, isWholeAmount: true, amountShare: '75-100%', currency: 'USD', secondsToCashOut: 90 }],
            ]);

            unmount();
        });

        test('should tell part of what is available cashed out for free, without an amount', async () => {
            mockFees().fees.value = feesOf(0);
            mockInstructCashOut();
            const onResult = vi.fn();
            const { findButton, unmount } = renderForm({ eligibility: SINGLE_TRANSFER_INSTRUMENT, onResult });
            amountField.setAmount?.(5000);
            await nextTick();

            findButton(CASH_OUT)?.click();
            await vi.waitFor(() => expect(onResult).toHaveBeenCalled());

            expect(addEvent).toHaveBeenCalledWith('Clicked button', {
                ...REQUEST,
                label: 'Cash out now',
                isWholeAmount: false,
                amountShare: '<25%',
                isFeeFree: true,
            });

            unmount();
        });

        test('should tell the cashOut failed, with its error', async () => {
            mockFees().fees.value = feesOf(1101);
            const instruct = mockInstructCashOut();
            instruct.instructCashOut.mockImplementation(async () => {
                instruct.instructError.value = { type: 'HTTP_ERROR', errorCode: '29_001', status: '422' };
                return undefined;
            });
            const onResult = vi.fn();
            const { findButton, unmount } = renderForm({ eligibility: SINGLE_TRANSFER_INSTRUMENT, onResult });

            findButton(CASH_OUT)?.click();
            await vi.waitFor(() => expect(onResult).toHaveBeenCalled());

            expect(addEvent).toHaveBeenLastCalledWith('Encountered error', {
                ...REQUEST,
                returnType: 'backend',
                returnValue: '29_001',
                request: 'instruct',
            });
            expect(addEvent).not.toHaveBeenCalledWith('Completed cashOut', expect.anything());

            unmount();
        });

        test('should tell the fee takes all of the amount', async () => {
            const fees = mockFees();
            fees.fees.value = feesOf(1101);
            const { unmount } = renderForm({ eligibility: SINGLE_TRANSFER_INSTRUMENT });

            fees.fees.value = feesOf(22000);
            await nextTick();

            expect(addEvent).toHaveBeenCalledWith('Encountered error', {
                ...REQUEST,
                returnType: 'validation',
                returnValue: 'amountBelowFee',
                field: 'amount',
            });

            unmount();
        });
    });
});
