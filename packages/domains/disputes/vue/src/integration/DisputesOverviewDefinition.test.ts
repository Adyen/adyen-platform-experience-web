import { describe, expect, expectTypeOf, test, vi } from 'vitest';
import type { DomainComponentCreateInput, DomainComponentInstance } from '@integration-components/domain-integration';
import { createDisputesOverview } from './createDisputesOverview';
import { DisputesOverviewDefinition } from './DisputesOverviewDefinition';
import type { DisputesDependencies, DisputesOverviewDomainProps } from './types';

vi.mock('./createDisputesOverview', () => ({
    createDisputesOverview: vi.fn(),
}));

describe('DisputesOverviewDefinition', () => {
    test('creates the domain instance without SDK UIElement props', async () => {
        const dependencies = {} as DisputesDependencies;
        const props: DisputesOverviewDomainProps = {};
        const instance: DomainComponentInstance<Partial<DisputesOverviewDomainProps>, Element | string> = {
            mount: vi.fn(),
            unmount: vi.fn(),
            update: vi.fn(),
        };

        vi.mocked(createDisputesOverview).mockReturnValue(instance);

        expectTypeOf(DisputesOverviewDefinition.create)
            .parameter(0)
            .toEqualTypeOf<DomainComponentCreateInput<DisputesOverviewDomainProps, DisputesDependencies>>();

        await expect(Promise.resolve(DisputesOverviewDefinition.create({ dependencies, props }))).resolves.toBe(instance);
        expect(createDisputesOverview).toHaveBeenCalledWith(props, dependencies);
    });
});
