import { UIElement } from '@integration-components/core/vue';
import TransactionDetailsContainer from './components/TransactionDetailsContainer.vue';
import type { TransactionDetailsExternalProps } from './types';

export class TransactionDetailsElement extends UIElement<TransactionDetailsExternalProps> {
    public static readonly type = 'transactionDetails' as const;

    constructor(props: TransactionDetailsExternalProps) {
        super(TransactionDetailsContainer, props, 'transactionDetails');
    }
}

export default TransactionDetailsElement;
