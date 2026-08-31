import type { CoreInstance } from '@integration-components/core/vue';
import { bindDomainComponent } from '@integration-components/domain-integration';
import { TransactionDetailsDefinition, TransactionsOverviewDefinition } from '@integration-components/transactions/vue/definitions';
import { createTransactionsDependencies } from './createTransactionsDependencies';

export const bindTransactionsOverview = (core: CoreInstance) =>
    bindDomainComponent(TransactionsOverviewDefinition, ({ signal }) => createTransactionsDependencies(core, 'transactions', signal));

export const bindTransactionDetails = (core: CoreInstance) =>
    bindDomainComponent(TransactionDetailsDefinition, ({ signal }) => createTransactionsDependencies(core, 'transactionDetails', signal));
