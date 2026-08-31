import type { DomainComponentInstance } from '@integration-components/domain-integration';
import TransactionsOverview from '../TransactionsOverview/components/TransactionsOverview/TransactionsOverview.vue';
import { createTransactionsInstance } from './createTransactionsInstance';
import type { TransactionsDependencies, TransactionsOverviewDomainProps } from './types';

export const createTransactionsOverview = (
    props: TransactionsOverviewDomainProps,
    dependencies: TransactionsDependencies
): DomainComponentInstance<Partial<TransactionsOverviewDomainProps>, Element | string> =>
    createTransactionsInstance('Transactions overview', TransactionsOverview, props, dependencies, dependencies.callbacks);
