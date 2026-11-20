/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { createApp, nextTick, ref, toValue } from 'vue';
import { useCoreContext } from '@integration-components/core/vue';
import type { ComponentShellState } from '@integration-components/composables-vue';
import type { ICashOutEligibility } from '@integration-components/types';
import { useCashOutState } from '../../../shared/composables/useCashOutState';
import type { CashOutRequestComponentProps } from '../../types';
import CashOutRequest from './CashOutRequest.vue';

const TITLE = 'cashOut.request.title';
const SKELETON = 'skeleton';

const ELIGIBILITY = {
    isCashoutAvailable: true,
    availableForCashOutBalance: { value: 22000, currency: 'USD' },
    unavailableReasons: [],
} as unknown as ICashOutEligibility;

const formProps: { current?: Record<string, unknown> } = {};
const headerProps: { current?: Record<string, unknown> } = {};
const resultProps: { current?: Record<string, unknown> } = {};

vi.mock('@adyen/bento-vue3', async () => {
    const { h } = await import('vue');
    const stub = (props: { title?: string }, { slots }: { slots: Record<string, (() => unknown) | undefined> }) =>
        h('div', [props.title, ...Object.values(slots).map(slot => slot?.())] as never);

    return {
        BentoDropdown: stub,
    };
});

vi.mock('../../../shared/CashOutHeader/CashOutHeader.vue', async () => {
    const { defineComponent, h } = await import('vue');
    return {
        default: defineComponent({
            props: {
                titleKey: { type: String, required: true },
                hideTitle: Boolean,
                isRefreshing: Boolean,
                disableBalanceAccountSelector: Boolean,
                onRefresh: { type: Function, default: undefined },
                onBalanceAccountSelectorClose: { type: Function, default: undefined },
            },
            setup(props) {
                return () => {
                    headerProps.current = { ...props };
                    return props.hideTitle ? h('div') : h('h2', props.titleKey);
                };
            },
        }),
    };
});

vi.mock('@integration-components/core/vue', () => ({
    useCoreContext: vi.fn(),
}));

vi.mock('@integration-components/composables-vue', async () => {
    const { h } = await import('vue');

    return {
        ComponentShell: (props: { state: string }, { slots }: { slots: { default?: () => unknown; loading?: () => unknown } }) => {
            if (props.state === 'loading') return h('div', ['loading', slots.loading?.()] as never);
            if (props.state === 'error') return h('div', 'error');
            return h('div', ['ready', slots.default?.()] as never);
        },
    };
});

vi.mock('../../../shared/composables/useCashOutState', () => ({
    getCashOutErrorInfo: vi.fn(() => ({})),
    useCashOutState: vi.fn(),
}));

vi.mock('../CashOutRequestSkeleton/CashOutRequestSkeleton.vue', async () => {
    const { h } = await import('vue');
    return { default: () => h('div', 'skeleton') };
});

vi.mock('../CashOutRequestForm/CashOutRequestForm.vue', async () => {
    const { defineComponent, h } = await import('vue');
    return {
        default: defineComponent({
            props: {
                accountKey: { type: String, required: true },
                eligibility: { type: Object, required: true },
                onResult: { type: Function, required: true },
                referenceForBeneficiary: { type: String, default: undefined },
                transferDescription: { type: String, default: undefined },
                onContactSupport: { type: Function, default: undefined },
                onFeesError: { type: Function, required: true },
                onInstructingChange: { type: Function, default: undefined },
            },
            setup(props) {
                return () => {
                    formProps.current = { ...props };
                    return h('div', 'form');
                };
            },
        }),
    };
});

vi.mock('../CashOutRequestResult/CashOutRequestResult.vue', async () => {
    const { defineComponent, h } = await import('vue');
    return {
        default: defineComponent({
            props: { status: { type: String, required: true } },
            setup(props) {
                return () => {
                    resultProps.current = { ...props };
                    return h('div', `result ${props.status}`);
                };
            },
        }),
    };
});

const mockCashOutState = (shellState: ComponentShellState) => {
    const state = {
        balanceAccountOptions: ref([]),
        eligibility: ref(shellState === 'ready' ? ELIGIBILITY : undefined),
        errorInfo: ref({}),
        selectedBalanceAccountId: ref('BA1'),
        selectedAccountKey: ref('BalanceAccount.BA1'),
        shellState: ref(shellState),
        isFetchingEligibility: ref(false),
        lastUpdated: ref(Date.now()),
        refresh: vi.fn(),
        refreshAvailableAmounts: vi.fn(),
    };
    vi.mocked(useCashOutState).mockReturnValue(state as unknown as ReturnType<typeof useCashOutState>);
    return state;
};

const renderCashOutRequest = (props: Partial<CashOutRequestComponentProps> = {}) => {
    const target = document.createElement('div');
    const app = createApp(CashOutRequest, props);
    app.mount(target);
    return { target, unmount: () => app.unmount() };
};

describe('CashOutRequest', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        formProps.current = undefined;
        headerProps.current = undefined;
        resultProps.current = undefined;
        vi.mocked(useCoreContext).mockReturnValue({
            i18n: { get: (key: string) => key },
        } as unknown as ReturnType<typeof useCoreContext>);
    });

    // Loading another eligibility would replace the form while its cashOut is sent, so the refresh does nothing until it is sent.
    describe('Refresh while the cashOut is sent', () => {
        test('should do nothing when refreshed until the cashOut is sent', async () => {
            const state = mockCashOutState('ready');
            const { unmount } = renderCashOutRequest();
            const setInstructing = formProps.current?.onInstructingChange as (isInstructing: boolean) => void;

            setInstructing(true);
            await nextTick();
            (headerProps.current?.onRefresh as () => void)();
            expect(state.refresh).not.toHaveBeenCalled();
            expect(headerProps.current?.isRefreshing).toBe(false);

            setInstructing(false);
            await nextTick();
            (headerProps.current?.onRefresh as () => void)();
            expect(state.refresh).toHaveBeenCalledOnce();

            unmount();
        });

        // Switching balance account would replace the form, cancelling the cashOut in the browser while the server may still make it
        test('should not let another balance account be selected until the cashOut is sent', async () => {
            mockCashOutState('ready');
            const { unmount } = renderCashOutRequest();
            const setInstructing = formProps.current?.onInstructingChange as (isInstructing: boolean) => void;

            expect(headerProps.current?.disableBalanceAccountSelector).toBe(false);
            setInstructing(true);
            await nextTick();
            expect(headerProps.current?.disableBalanceAccountSelector).toBe(true);

            setInstructing(false);
            await nextTick();
            expect(headerProps.current?.disableBalanceAccountSelector).toBe(false);

            unmount();
        });

        test('should not load what the balance accounts can cash out until the cashOut is sent', async () => {
            const state = mockCashOutState('ready');
            const { unmount } = renderCashOutRequest();
            const setInstructing = formProps.current?.onInstructingChange as (isInstructing: boolean) => void;

            setInstructing(true);
            await nextTick();
            (headerProps.current?.onBalanceAccountSelectorClose as () => void)();
            expect(state.refreshAvailableAmounts).not.toHaveBeenCalled();

            setInstructing(false);
            await nextTick();
            (headerProps.current?.onBalanceAccountSelectorClose as () => void)();
            expect(state.refreshAvailableAmounts).toHaveBeenCalledOnce();

            unmount();
        });

        // So the modal it is shown in can't be closed meanwhile
        test('should tell the component showing it while the cashOut is sent', async () => {
            mockCashOutState('ready');
            const onInstructingChange = vi.fn();
            const { unmount } = renderCashOutRequest({ onInstructingChange });
            const setInstructing = formProps.current?.onInstructingChange as (isInstructing: boolean) => void;

            setInstructing(true);
            setInstructing(false);

            expect(onInstructingChange.mock.calls).toEqual([[true], [false]]);

            unmount();
        });
    });

    describe('Title', () => {
        test('should show the title', () => {
            mockCashOutState('ready');
            const { target, unmount } = renderCashOutRequest();

            expect(target.textContent).toContain(TITLE);

            unmount();
        });

        test('should not show the title when hideTitle is set', () => {
            mockCashOutState('ready');
            const { target, unmount } = renderCashOutRequest({ hideTitle: true });

            expect(target.textContent).not.toContain(TITLE);

            unmount();
        });
    });

    describe('Loading', () => {
        test('should show the skeleton while eligibility loads', () => {
            mockCashOutState('loading');
            const { target, unmount } = renderCashOutRequest();

            expect(target.textContent).toContain('loading');
            expect(target.textContent).toContain(SKELETON);
            expect(formProps.current).toBeUndefined();

            unmount();
        });

        test('should show an error when the data fails to load', () => {
            mockCashOutState('error');
            const { target, unmount } = renderCashOutRequest();

            expect(target.textContent).toContain('error');
            expect(target.textContent).not.toContain(SKELETON);

            unmount();
        });
    });

    describe('Form', () => {
        test('should show the form of the selected balance account once eligibility loads', () => {
            const onContactSupport = vi.fn();
            mockCashOutState('ready');
            const { target, unmount } = renderCashOutRequest({ onContactSupport });

            expect(target.textContent).toContain('form');
            expect(formProps.current).toMatchObject({
                accountKey: 'BalanceAccount.BA1',
                eligibility: ELIGIBILITY,
                onContactSupport,
            });

            unmount();
        });

        test('should show an error when the fees fail to load', async () => {
            mockCashOutState('ready');
            const { target, unmount } = renderCashOutRequest();

            (formProps.current?.onFeesError as (error: Error) => void)(new Error('error'));
            await nextTick();

            expect(target.textContent).toContain('error');
            expect(target.textContent).not.toContain('form');

            unmount();
        });

        test('should show the form of another balance account selected after the fees fail to load', async () => {
            const { selectedBalanceAccountId, selectedAccountKey } = mockCashOutState('ready');
            const { target, unmount } = renderCashOutRequest();

            (formProps.current?.onFeesError as (error: Error) => void)(new Error('error'));
            await nextTick();

            selectedBalanceAccountId.value = 'BA2';
            selectedAccountKey.value = 'BalanceAccount.BA2';
            await nextTick();

            expect(target.textContent).not.toContain('error');
            expect(target.textContent).toContain('form');
            expect(formProps.current).toMatchObject({ accountKey: 'BalanceAccount.BA2' });

            unmount();
        });
    });

    describe('Result', () => {
        const CASH_OUT = { id: 'CO1' };
        const reportResult = (result: unknown) => (formProps.current?.onResult as (result: unknown) => void)(result);

        test('should show the success screen instead of the title and form, and pass on the cashOut', async () => {
            const onSubmit = vi.fn();
            mockCashOutState('ready');
            const { target, unmount } = renderCashOutRequest({ onSubmit });

            reportResult({ status: 'success', cashOut: CASH_OUT });
            await nextTick();

            expect(target.textContent).toBe('result success');
            expect(resultProps.current).toMatchObject({ status: 'success' });
            expect(onSubmit).toHaveBeenCalledWith(CASH_OUT);

            unmount();
        });

        test('should tell the component that shows it once the result screen is shown', async () => {
            const onResultShown = vi.fn();
            mockCashOutState('ready');
            const { unmount } = renderCashOutRequest({ onResultShown });

            reportResult({ status: 'error' });
            await nextTick();

            expect(onResultShown).toHaveBeenCalledTimes(1);
            expect(onResultShown).toHaveBeenCalledWith();

            unmount();
        });

        test('should show the error screen instead of the title and form', async () => {
            const onSubmit = vi.fn();
            mockCashOutState('ready');
            const { target, unmount } = renderCashOutRequest({ onSubmit });

            reportResult({ status: 'error' });
            await nextTick();

            expect(target.textContent).toBe('result error');
            expect(onSubmit).not.toHaveBeenCalled();

            unmount();
        });
    });

    test('should start from the given balance account and its eligibility', () => {
        mockCashOutState('ready');
        const { unmount } = renderCashOutRequest({ initialBalanceAccountId: 'BA2', eligibility: ELIGIBILITY });

        const [options] = vi.mocked(useCashOutState).mock.calls[0]!;
        expect(toValue(options?.initialBalanceAccountId)).toBe('BA2');
        expect(toValue(options?.eligibility)).toBe(ELIGIBILITY);

        unmount();
    });

    test('should pass the reference and the description of the cashOut on to the form', () => {
        mockCashOutState('ready');
        const { unmount } = renderCashOutRequest({ referenceForBeneficiary: 'REF123', transferDescription: 'Weekly cashOut' });

        expect(formProps.current).toMatchObject({ referenceForBeneficiary: 'REF123', transferDescription: 'Weekly cashOut' });

        unmount();
    });
});
