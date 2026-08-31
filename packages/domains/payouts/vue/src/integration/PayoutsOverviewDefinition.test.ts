import { describe, expect, expectTypeOf, test, vi } from 'vitest';
import type { DomainComponentCreateInput, DomainComponentInstance } from '@integration-components/domain-integration';
import { createPayoutsOverview } from './createPayoutsOverview';
import { PayoutsOverviewDefinition } from './PayoutsOverviewDefinition';
import type { PayoutsDependencies, PayoutsOverviewDomainProps } from './types';

vi.mock('./createPayoutsOverview', () => ({
    createPayoutsOverview: vi.fn(),
}));

describe('PayoutsOverviewDefinition', () => {
    test('creates the domain instance without SDK UIElement props', async () => {
        const dependencies = {} as PayoutsDependencies;
        const props: PayoutsOverviewDomainProps = {};
        const instance: DomainComponentInstance<Partial<PayoutsOverviewDomainProps>, Element | string> = {
            mount: vi.fn(),
            unmount: vi.fn(),
            update: vi.fn(),
        };

        vi.mocked(createPayoutsOverview).mockReturnValue(instance);

        expectTypeOf(PayoutsOverviewDefinition.create)
            .parameter(0)
            .toEqualTypeOf<DomainComponentCreateInput<PayoutsOverviewDomainProps, PayoutsDependencies>>();

        await expect(Promise.resolve(PayoutsOverviewDefinition.create({ dependencies, props }))).resolves.toBe(instance);
        expect(createPayoutsOverview).toHaveBeenCalledWith(props, dependencies);
    });
});
