import { defineDomainComponent } from '@integration-components/domain-integration';
import { createTransactionsOverview } from './createTransactionsOverview';
import type { TransactionsDependencies, TransactionsOverviewDomainProps } from './types';

export const TransactionsOverviewDefinition = defineDomainComponent<
    TransactionsOverviewDomainProps,
    TransactionsDependencies,
    Partial<TransactionsOverviewDomainProps>,
    Element | string
>()({
    create: ({ dependencies, props }) => createTransactionsOverview(props, dependencies),
});
