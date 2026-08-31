import type { DomainComponentInstance } from '@integration-components/domain-integration';
import TransactionDetails from '../TransactionDetails/components/TransactionDetailsContainer.vue';
import type { TransactionDetailsEventCallbacks } from '../events';
import { createTransactionsInstance } from './createTransactionsInstance';
import type { TransactionDetailsDomainProps, TransactionDetailsRenderMode, TransactionsDependencies } from './types';

export const createTransactionDetails = (
    props: TransactionDetailsDomainProps,
    dependencies: TransactionsDependencies,
    renderMode: TransactionDetailsRenderMode
): DomainComponentInstance<Partial<TransactionDetailsDomainProps>, Element | string> =>
    createTransactionsInstance('Transaction details', TransactionDetails, props, dependencies, {
        onContactSupportRequested: dependencies.callbacks?.onContactSupportRequested,
        onDetailsLoaded: dependencies.callbacks?.onDetailsLoaded,
        onNavigationRequested: dependencies.callbacks?.onNavigationRequested,
        onRefundCancelled: dependencies.callbacks?.onRefundCancelled,
        onRefundCompleted: dependencies.callbacks?.onRefundCompleted,
        onRefundViewOpened: dependencies.callbacks?.onRefundViewOpened,
        onValueCopied: dependencies.callbacks?.onValueCopied,
        renderMode,
    } satisfies TransactionDetailsEventCallbacks & { renderMode: TransactionDetailsRenderMode });
