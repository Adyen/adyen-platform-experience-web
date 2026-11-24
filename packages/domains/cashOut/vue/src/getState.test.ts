import { beforeEach, describe, expect, test, vi } from 'vitest';
import type { ExternalCashOutState } from '@integration-components/cashOut/domain';
import { CashOutOverviewElement } from './CashOutOverview/CashOutOverviewElement';
import { CashOutRequestElement } from './CashOutRequest/CashOutRequestElement';

const getExternalCashOutState = vi.hoisted(() => vi.fn());

vi.mock('@integration-components/cashOut/domain', () => ({ getExternalCashOutState }));

// Only what getState() reads from the element: the core it was created with
vi.mock('@integration-components/core/vue', () => ({
    UIElement: class {
        public core: unknown;
        constructor(_component: unknown, props: { core: unknown }) {
            this.core = props.core;
        }
    },
}));

vi.mock('./CashOutOverview/components/CashOutOverview/CashOutOverview.vue', () => ({ default: {} }));
vi.mock('./CashOutRequest/components/CashOutRequestContainer.vue', () => ({ default: {} }));

describe.each([
    ['CashOutOverviewElement', CashOutOverviewElement],
    ['CashOutRequestElement', CashOutRequestElement],
])('%s.getState()', (_name, elementClass) => {
    beforeEach(() => {
        getExternalCashOutState.mockReset();
    });

    test('tells the CashOut state of the session of its core', async () => {
        const session = { context: {} };
        const state: ExternalCashOutState = { isAvailable: true, restrictions: ['riskRestricted'] };
        getExternalCashOutState.mockResolvedValue(state);

        const element = new elementClass({ core: { session } } as unknown as ConstructorParameters<typeof elementClass>[0]);

        await expect(element.getState()).resolves.toBe(state);
        expect(getExternalCashOutState).toHaveBeenCalledExactlyOnceWith(session);
    });
});
