import { describe, expect, expectTypeOf, test, vi } from 'vitest';
import type { DomainComponentCreateInput, DomainComponentInstance } from '@integration-components/domain-integration';
import { createReportsOverview } from './createReportsOverview';
import { ReportsOverviewDefinition } from './ReportsOverviewDefinition';
import type { ReportsOverviewDependencies, ReportsOverviewDomainProps } from './types';

vi.mock('./createReportsOverview', () => ({
    createReportsOverview: vi.fn(),
}));

describe('ReportsOverviewDefinition', () => {
    test('creates the domain instance without SDK UIElement props', async () => {
        const dependencies = {} as ReportsOverviewDependencies;
        const props: ReportsOverviewDomainProps = { balanceAccountId: 'BA_1' };

        const instance: DomainComponentInstance<Partial<ReportsOverviewDomainProps>, Element | string> = {
            mount: vi.fn(),
            unmount: vi.fn(),
            update: vi.fn(),
        };

        vi.mocked(createReportsOverview).mockReturnValue(instance);

        expectTypeOf(ReportsOverviewDefinition.create)
            .parameter(0)
            .toEqualTypeOf<DomainComponentCreateInput<ReportsOverviewDomainProps, ReportsOverviewDependencies>>();

        await expect(Promise.resolve(ReportsOverviewDefinition.create({ dependencies, props }))).resolves.toBe(instance);
        expect(createReportsOverview).toHaveBeenCalledWith(props, dependencies);
    });
});
