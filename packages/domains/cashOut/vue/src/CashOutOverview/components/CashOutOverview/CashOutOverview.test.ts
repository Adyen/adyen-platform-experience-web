/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { computed, createApp, nextTick, ref } from 'vue';
import { useCoreContext } from '@integration-components/core/vue';
import { useShouldHideTitles, type ComponentShellState } from '@integration-components/composables-vue';
import { useCashOutState } from '../../../shared/composables/useCashOutState';
import CashOutOverview from './CashOutOverview.vue';

const LABEL = 'cashOut.overview.availableForCashOut.label';
const AMOUNT = '22000 USD';
const REACH_OUT = 'cashOut.common.actions.contactSupport.labels.reachOut';
const START = 'cashOut.overview.actions.start';

const ELIGIBILITY = {
    isCashoutAvailable: true,
    availableForCashOutBalance: { value: 22000, currency: 'USD' },
    unavailableReasons: [],
};

const unavailableEligibility = (reason: string) => ({ ...ELIGIBILITY, isCashoutAvailable: false, unavailableReasons: [reason] });

vi.mock('@adyen/bento-vue3', async () => {
    const { h } = await import('vue');
    const stub = (_: unknown, { slots }: { slots: Record<string, (() => unknown) | undefined> }) =>
        h('div', Object.values(slots).map(slot => slot?.()) as never);

    return {
        BentoAlert: stub,
        BentoButton: stub,
        BentoDropdown: stub,
        BentoHeader: stub,
        BentoInfoIcon: stub,
        BentoLoadingSkeleton: stub,
        BentoLoadingSkeletonShape: stub,
        BentoLoadingSkeletonTypography: stub,
        BentoTypography: stub,
    };
});

vi.mock('@integration-components/core/vue', () => ({
    useCoreContext: vi.fn(),
}));

vi.mock('@integration-components/composables-vue', async () => {
    const { h } = await import('vue');

    return {
        ComponentShell: (props: { state: string }, { slots }: { slots: { default?: () => unknown; loading?: () => unknown } }) => {
            if (props.state === 'loading') return h('div', slots.loading?.() as never);
            if (props.state === 'error') return h('div', 'error');
            return h('div', slots.default?.() as never);
        },
        useShouldHideTitles: vi.fn(),
    };
});

vi.mock('../../../shared/composables/useCashOutState', () => ({
    useCashOutState: vi.fn(),
}));

vi.mock('../CashOutRequestModal/CashOutRequestModal.vue', async () => {
    const { defineComponent, h } = await import('vue');

    return {
        default: defineComponent({
            props: {
                balanceAccountId: { type: String, default: undefined },
                eligibility: { type: Object, default: undefined },
                isOpen: Boolean,
                onClose: { type: Function, default: undefined },
            },
            setup: props => () =>
                props.isOpen
                    ? h(
                          'div',
                          { 'data-testid': 'request-modal', onClick: props.onClose },
                          `${props.balanceAccountId} ${JSON.stringify(props.eligibility)}`
                      )
                    : null,
        }),
    };
});

const mockCashOutState = ({ eligibility, shellState = 'ready' }: { eligibility?: unknown; shellState?: ComponentShellState }) => {
    const state = { eligibility: ref(eligibility), shellState: ref(shellState) };
    vi.mocked(useCashOutState).mockReturnValue({
        ...state,
        balanceAccountOptions: ref([]),
        errorInfo: ref({}),
        selectedBalanceAccountId: ref('BA1'),
    } as unknown as ReturnType<typeof useCashOutState>);
    return state;
};

const renderCashOutOverview = (props: { onContactSupport?: () => void } = {}) => {
    const target = document.createElement('div');
    const app = createApp(CashOutOverview, props);
    app.mount(target);
    return { target, unmount: () => app.unmount() };
};

describe('CashOutOverview', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(useCoreContext).mockReturnValue({
            i18n: { get: (key: string) => key, amount: (value: number, currency: string) => `${value} ${currency}` },
        } as unknown as ReturnType<typeof useCoreContext>);
        vi.mocked(useShouldHideTitles).mockReturnValue(computed(() => false));
    });

    describe('Available for cash out label', () => {
        test('should not show the label while eligibility loads', () => {
            mockCashOutState({ shellState: 'loading' });
            const { target, unmount } = renderCashOutOverview();

            expect(target.textContent).not.toContain(LABEL);

            unmount();
        });

        test('should not show the label when eligibility fails to load', () => {
            mockCashOutState({ shellState: 'error' });
            const { target, unmount } = renderCashOutOverview();

            expect(target.textContent).not.toContain(LABEL);

            unmount();
        });

        test('should show the label together with the amount once eligibility loads', async () => {
            const state = mockCashOutState({ shellState: 'loading' });
            const { target, unmount } = renderCashOutOverview();

            state.shellState.value = 'ready';
            state.eligibility.value = ELIGIBILITY;
            await nextTick();

            expect(target.textContent).toContain(LABEL);
            expect(target.textContent).toContain(AMOUNT);

            unmount();
        });
    });

    describe('Unavailable reason contact support', () => {
        const findReachOutButton = (target: HTMLElement) => [...target.querySelectorAll('div')].find(element => element.textContent === REACH_OUT);

        test('should call onContactSupport when the reach out button is clicked for a reason support can resolve', () => {
            const onContactSupport = vi.fn();
            mockCashOutState({ eligibility: unavailableEligibility('cashOutNotConfigured') });
            const { target, unmount } = renderCashOutOverview({ onContactSupport });

            findReachOutButton(target)?.click();

            expect(onContactSupport).toHaveBeenCalledTimes(1);

            unmount();
        });

        test('should not show the reach out button without an onContactSupport callback', () => {
            mockCashOutState({ eligibility: unavailableEligibility('cashOutNotConfigured') });
            const { target, unmount } = renderCashOutOverview();

            expect(target.textContent).not.toContain(REACH_OUT);

            unmount();
        });

        test('should not show the reach out button for a reason support cannot resolve', () => {
            mockCashOutState({ eligibility: unavailableEligibility('dailyLimitReached') });
            const { target, unmount } = renderCashOutOverview({ onContactSupport: vi.fn() });

            expect(target.textContent).not.toContain(REACH_OUT);

            unmount();
        });
    });

    describe('Unavailable reason', () => {
        const NOT_ALLOWED = 'cashOut.overview.unavailableReasons.notAllowed';

        test('should explain a reason the component does not know with the generic message', () => {
            mockCashOutState({ eligibility: unavailableEligibility('reasonAddedLater') });
            const { target, unmount } = renderCashOutOverview();

            expect(target.textContent).toContain(NOT_ALLOWED);

            unmount();
        });

        test('should not show an alert for a zero balance', () => {
            mockCashOutState({ eligibility: unavailableEligibility('zeroBalance') });
            const { target, unmount } = renderCashOutOverview();

            expect(target.textContent).not.toContain('cashOut.overview.unavailableReasons.');

            unmount();
        });
    });

    describe('Cash out request modal', () => {
        const findStartButton = (target: HTMLElement) => [...target.querySelectorAll('div')].find(element => element.textContent === START);
        const findModal = (target: HTMLElement) => target.querySelector<HTMLElement>('[data-testid="request-modal"]');

        test('should not show the modal before the start button is clicked', () => {
            mockCashOutState({ eligibility: ELIGIBILITY });
            const { target, unmount } = renderCashOutOverview();

            expect(findModal(target)).toBeNull();

            unmount();
        });

        test('should open the modal with the selected balance account and its eligibility when the start button is clicked', async () => {
            mockCashOutState({ eligibility: ELIGIBILITY });
            const { target, unmount } = renderCashOutOverview();

            findStartButton(target)?.click();
            await nextTick();

            expect(findModal(target)?.textContent).toBe(`BA1 ${JSON.stringify(ELIGIBILITY)}`);

            unmount();
        });

        test('should close the modal', async () => {
            mockCashOutState({ eligibility: ELIGIBILITY });
            const { target, unmount } = renderCashOutOverview();

            findStartButton(target)?.click();
            await nextTick();
            findModal(target)?.click();
            await nextTick();

            expect(findModal(target)).toBeNull();

            unmount();
        });
    });
});
