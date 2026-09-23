/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { createApp } from 'vue';
import { useCoreContext } from '@integration-components/core/vue';
import PayoutsOverview from './PayoutsOverview.vue';

vi.mock('@adyen/bento-vue3', () => ({
    BentoTypography: {
        name: 'BentoTypography',
        props: ['variant'],
        template: '<div class="bento-typography"><slot /></div>',
    },
    BentoModal: { name: 'BentoModal', template: '<div />' },
}));

vi.mock('./PayoutsFilters.vue', () => ({
    default: { name: 'PayoutsFilters', template: '<div />' },
}));

vi.mock('./PayoutsTable.vue', () => ({
    default: { name: 'PayoutsTable', template: '<div />' },
}));

vi.mock('../../PayoutDetails/components/PayoutDetailsContainer.vue', () => ({
    default: { name: 'PayoutDetailsContainer', template: '<div />' },
}));

vi.mock('../composables/usePayoutsList', () => ({
    usePayoutsList: () => ({
        records: { value: [] },
        error: { value: undefined },
        fetching: { value: false },
        hasNext: { value: false },
        hasPrevious: { value: false },
        limit: { value: 10 },
        limitOptions: { value: [10, 20] },
        page: { value: 0 },
        updateLimit: vi.fn(),
        goToNextPage: vi.fn(),
        goToPreviousPage: vi.fn(),
    }),
}));

vi.mock('@integration-components/core/vue', () => ({
    useCoreContext: vi.fn(),
    ModalContextProvider: { name: 'ModalContextProvider', template: '<div><slot /></div>' },
}));

describe('PayoutsOverview', () => {
    const i18n = {
        get: vi.fn((key: string) => key),
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    test('renders title when titles appearance is visible or default', () => {
        vi.mocked(useCoreContext).mockReturnValue({
            i18n,
            appearance: { titles: 'visible' },
        } as unknown as ReturnType<typeof useCoreContext>);

        const target = document.createElement('div');
        const app = createApp(PayoutsOverview, {
            balanceAccounts: [],
            isLoadingBalanceAccount: false,
        });
        app.mount(target);

        expect(target.querySelector('.bento-typography')?.textContent).toBe('payouts.overview.title');

        app.unmount();
    });

    test('hides title when titles appearance is hidden', () => {
        vi.mocked(useCoreContext).mockReturnValue({
            i18n,
            appearance: { titles: 'hidden' },
        } as unknown as ReturnType<typeof useCoreContext>);

        const target = document.createElement('div');
        const app = createApp(PayoutsOverview, {
            balanceAccounts: [],
            isLoadingBalanceAccount: false,
        });
        app.mount(target);

        expect(target.querySelector('.bento-typography')).toBeNull();

        app.unmount();
    });
});
