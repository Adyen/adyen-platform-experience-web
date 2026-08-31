import { defineDomainComponent } from '@integration-components/domain-integration';
import { createTransactionDetails } from './createTransactionDetails';
import type { TransactionDetailsDomainProps, TransactionsDependencies } from './types';

export const TransactionDetailsDefinition = defineDomainComponent<
    TransactionDetailsDomainProps,
    TransactionsDependencies,
    Partial<TransactionDetailsDomainProps>,
    Element | string
>()({
    create: ({ dependencies, props }) => createTransactionDetails(props, dependencies, 'standalone'),
});
