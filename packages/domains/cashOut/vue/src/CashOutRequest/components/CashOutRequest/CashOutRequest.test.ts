/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { createApp, nextTick, ref, toValue } from 'vue';
import { useCoreContext } from '@integration-components/core/vue';
import { useLandedPageEvent, type ComponentShellState } from '@integration-components/composables-vue';
import type { ICashOutEligibility } from '@integration-components/types';
import { useCashOutState } from '../../../shared/composables/useCashOutState';
import type { CashOutRequestComponentProps } from '../../types';
import CashOutRequest from './CashOutRequest.vue';

const { addEvent } = vi.hoisted(() => ({ addEvent: vi.fn() }));

const TITLE = 'cashOut.request.title';
const SKELETON = 'skeleton';

const ELIGIBILITY = {
    isCashoutAvailable: true,
    availableForCashOutBalance: { value: 22000, currency: 'USD' },
    unavailableReasons: [],
} as unknown as ICashOutEligibility;

const formProps: {
    current?: Record<string, unknown>;
    analytics?: { getProperties: () => Record<string, unknown>; getSecondsSinceStart: () => number | undefined };
} = {};
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
    useEventDispatcherContext: () => ({ addEvent }),
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
        useLandedPageEvent: vi.fn(),
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
    const { useCashOutAnalytics } = await import('../../../shared/composables/useCashOutAnalytics');
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
                formProps.analytics = useCashOutAnalytics();
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
            props: {
                status: { type: String, required: true },
                currency: { type: String, default: undefined },
                onTryAgain: { type: Function, default: undefined },
            },
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
        loadingError: ref<unknown>(),
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
        const CASH_OUT = { id: 'CO1', amount: { value: 10000, currency: 'EUR' } };
        const reportResult = (result: unknown) => (formProps.current?.onResult as (result: unknown) => void)(result);

        test('should show the success screen instead of the title and form, and pass on the cashOut', async () => {
            const onSubmit = vi.fn();
            mockCashOutState('ready');
            const { target, unmount } = renderCashOutRequest({ onSubmit });

            reportResult({ status: 'success', cashOut: CASH_OUT });
            await nextTick();

            expect(target.textContent).toBe('result success');
            // Its currency tells when the money usually arrives.
            expect(resultProps.current).toMatchObject({ status: 'success', currency: 'EUR' });
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
        const { unmount } = renderCashOutRequest({ initialBalanceAccountId: 'BA2', eligibility: ELIGIBILITY, isLoadingEligibility: true });

        const [options] = vi.mocked(useCashOutState).mock.calls[0]!;
        expect(toValue(options?.initialBalanceAccountId)).toBe('BA2');
        expect(toValue(options?.eligibility)).toBe(ELIGIBILITY);
        // So it is waited for while the component that gave it loads it again
        expect(toValue(options?.isLoadingEligibility)).toBe(true);

        unmount();
    });

    test('should pass the reference and the description of the cashOut on to the form', () => {
        mockCashOutState('ready');
        const { unmount } = renderCashOutRequest({ referenceForBeneficiary: 'REF123', transferDescription: 'Weekly cashOut' });

        expect(formProps.current).toMatchObject({ referenceForBeneficiary: 'REF123', transferDescription: 'Weekly cashOut' });

        unmount();
    });

    // What is available changed since it was shown, so the form is shown again with what is available by then
    describe('Balance changed', () => {
        test('should show the form again once tried again, loading what is available again, and tell the component showing it', async () => {
            const state = mockCashOutState('ready');
            const onTryAgain = vi.fn();
            const { target, unmount } = renderCashOutRequest({ onTryAgain });
            (formProps.current?.onResult as (result: unknown) => void)({ status: 'balanceChanged' });
            await nextTick();
            expect(target.textContent).toContain('result balanceChanged');

            (resultProps.current?.onTryAgain as () => void)();
            await nextTick();

            expect(target.textContent).not.toContain('result');
            expect(target.textContent).toContain('form');
            expect(state.refresh).toHaveBeenCalledTimes(1);
            expect(onTryAgain).toHaveBeenCalledTimes(1);
            expect(addEvent).toHaveBeenCalledWith('Clicked button', {
                category: 'CashOut request component',
                subCategory: 'Request',
                label: 'Try again',
                step: 'result',
            });

            unmount();
        });
    });

    describe('Analytics', () => {
        const REQUEST = { category: 'CashOut request component', subCategory: 'Request' };
        const landedPageEvent = () => {
            const [properties, enabled] = vi.mocked(useLandedPageEvent).mock.calls[0]!;
            return { properties: toValue(properties), enabled: toValue(enabled) };
        };

        test('should tell the landing of the standalone request once the eligibility is known', () => {
            mockCashOutState('ready');
            const { unmount } = renderCashOutRequest();

            expect(landedPageEvent()).toEqual({
                properties: { ...REQUEST, isAvailable: true, unavailableReason: undefined, currency: 'USD', balanceAccountCount: '0' },
                enabled: true,
            });

            unmount();
        });

        // In the modal, the request is part of the overview, which tells its own landing
        test('should not tell a landing in the modal of the overview, and tell its events as the overview', () => {
            mockCashOutState('ready');
            const { unmount } = renderCashOutRequest({ inModal: true });

            expect(landedPageEvent().enabled).toBe(false);
            expect(formProps.analytics?.getProperties()).toEqual({ category: 'CashOut overview component', subCategory: 'Request' });

            unmount();
        });

        test('should start timing the request once its form is first shown', async () => {
            vi.useFakeTimers();
            const state = mockCashOutState('loading');
            const { unmount } = renderCashOutRequest();
            await vi.advanceTimersByTimeAsync(30_000);

            state.shellState.value = 'ready';
            state.eligibility.value = ELIGIBILITY;
            await nextTick();
            await vi.advanceTimersByTimeAsync(12_000);

            expect(formProps.analytics?.getProperties()).toEqual(REQUEST);
            expect(formProps.analytics?.getSecondsSinceStart()).toBe(12);
            vi.useRealTimers();

            unmount();
        });

        test('should tell the fees failed to load, with their error', async () => {
            mockCashOutState('ready');
            const { unmount } = renderCashOutRequest();

            (formProps.current?.onFeesError as (error: unknown) => void)({ type: 'HTTP_ERROR', errorCode: '00_500' });
            await nextTick();

            expect(addEvent).toHaveBeenCalledWith('Encountered error', { ...REQUEST, returnType: 'backend', returnValue: '00_500', request: 'fees' });

            unmount();
        });

        test('should tell which request kept the standalone request from loading, but leave it to the overview in its modal', async () => {
            for (const inModal of [false, true]) {
                addEvent.mockClear();
                const state = mockCashOutState('loading');
                const { unmount } = renderCashOutRequest({ inModal });

                state.loadingError.value = { request: 'balanceAccounts', error: { type: 'NETWORK_ERROR' } };
                await nextTick();

                expect(addEvent.mock.calls).toEqual(
                    inModal
                        ? []
                        : [['Encountered error', { ...REQUEST, returnType: 'backend', returnValue: 'NETWORK_ERROR', request: 'balanceAccounts' }]]
                );

                unmount();
            }
        });
    });
});
