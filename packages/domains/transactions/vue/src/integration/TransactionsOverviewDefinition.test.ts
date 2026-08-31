import { describe, expect, expectTypeOf, test, vi } from 'vitest';
import type { DomainComponentCreateInput, DomainComponentInstance } from '@integration-components/domain-integration';
import { createTransactionsOverview } from './createTransactionsOverview';
import { TransactionsOverviewDefinition } from './TransactionsOverviewDefinition';
import type { TransactionsDependencies, TransactionsOverviewDomainProps } from './types';

vi.mock('./createTransactionsOverview', () => ({
    createTransactionsOverview: vi.fn(),
}));

describe('TransactionsOverviewDefinition', () => {
    test('creates the domain instance without SDK UIElement props', async () => {
        const dependencies = {} as TransactionsDependencies;
        const props: TransactionsOverviewDomainProps = {};
        const instance: DomainComponentInstance<Partial<TransactionsOverviewDomainProps>, Element | string> = {
            mount: vi.fn(),
            unmount: vi.fn(),
            update: vi.fn(),
        };

        vi.mocked(createTransactionsOverview).mockReturnValue(instance);

        expectTypeOf(TransactionsOverviewDefinition.create)
            .parameter(0)
            .toEqualTypeOf<DomainComponentCreateInput<TransactionsOverviewDomainProps, TransactionsDependencies>>();

        await expect(Promise.resolve(TransactionsOverviewDefinition.create({ dependencies, props }))).resolves.toBe(instance);
        expect(createTransactionsOverview).toHaveBeenCalledWith(props, dependencies);
    });
});
