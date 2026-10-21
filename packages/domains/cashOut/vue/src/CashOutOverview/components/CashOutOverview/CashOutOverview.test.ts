/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { computed, createApp, nextTick, ref } from 'vue';
import { useCoreContext } from '@integration-components/core/vue';
import { useBalanceAccountFilterState, useBalanceAccounts, useShouldHideTitles } from '@integration-components/composables-vue';
import { useCashOutEligibility } from '../../composables/useCashOutEligibility';
import CashOutOverview from './CashOutOverview.vue';

const LABEL = 'cashOut.overview.availableForCashOut.label';
const AMOUNT = '22000 USD';
const REACH_OUT = 'cashOut.common.actions.contactSupport.labels.reachOut';

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
        useBalanceAccountFilterState: vi.fn(),
        useBalanceAccounts: vi.fn(),
        useShouldHideTitles: vi.fn(),
    };
});

vi.mock('../../composables/useCashOutEligibility', () => ({
    useCashOutEligibility: vi.fn(),
}));

const mockEligibility = ({
    eligibility,
    eligibilityError,
    isFetchingEligibility = false,
}: {
    eligibility?: unknown;
    eligibilityError?: Error;
    isFetchingEligibility?: boolean;
}) => {
    const state = { eligibility: ref(eligibility), eligibilityError: ref(eligibilityError), isFetchingEligibility: ref(isFetchingEligibility) };
    vi.mocked(useCashOutEligibility).mockReturnValue(state as unknown as ReturnType<typeof useCashOutEligibility>);
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
        vi.mocked(useBalanceAccounts).mockReturnValue({
            balanceAccounts: ref([{ id: 'BA1' }]),
            error: ref(undefined),
            isFetching: ref(false),
        } as unknown as ReturnType<typeof useBalanceAccounts>);
        vi.mocked(useBalanceAccountFilterState).mockReturnValue({
            balanceAccountOptions: ref([]),
            selectedBalanceAccountId: ref('BA1'),
        } as unknown as ReturnType<typeof useBalanceAccountFilterState>);
    });

    describe('Available for cash out label', () => {
        test('should not show the label while eligibility loads', () => {
            mockEligibility({ isFetchingEligibility: true });
            const { target, unmount } = renderCashOutOverview();

            expect(target.textContent).not.toContain(LABEL);

            unmount();
        });

        test('should not show the label when eligibility fails to load', () => {
            mockEligibility({ eligibilityError: new Error('error') });
            const { target, unmount } = renderCashOutOverview();

            expect(target.textContent).not.toContain(LABEL);

            unmount();
        });

        test('should show the label together with the amount once eligibility loads', async () => {
            const state = mockEligibility({ isFetchingEligibility: true });
            const { target, unmount } = renderCashOutOverview();

            state.isFetchingEligibility.value = false;
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
            mockEligibility({ eligibility: unavailableEligibility('cashOutNotConfigured') });
            const { target, unmount } = renderCashOutOverview({ onContactSupport });

            findReachOutButton(target)?.click();

            expect(onContactSupport).toHaveBeenCalledTimes(1);

            unmount();
        });

        test('should not show the reach out button without an onContactSupport callback', () => {
            mockEligibility({ eligibility: unavailableEligibility('cashOutNotConfigured') });
            const { target, unmount } = renderCashOutOverview();

            expect(target.textContent).not.toContain(REACH_OUT);

            unmount();
        });

        test('should not show the reach out button for a reason support cannot resolve', () => {
            mockEligibility({ eligibility: unavailableEligibility('dailyLimitReached') });
            const { target, unmount } = renderCashOutOverview({ onContactSupport: vi.fn() });

            expect(target.textContent).not.toContain(REACH_OUT);

            unmount();
        });
    });
});
