import { UIElement } from '@integration-components/core/vue';
import TransactionsOverviewContainer from './components/TransactionsOverviewContainer/TransactionsOverviewContainer.vue';
import type { ExternalComponentType } from '@integration-components/types';
import type { TransactionsOverviewExternalProps } from './types';

export class TransactionsOverviewElement extends UIElement<TransactionsOverviewExternalProps> {
    public static readonly type: ExternalComponentType = 'transactions' as const;

    constructor(props: TransactionsOverviewExternalProps) {
        super(TransactionsOverviewContainer, props, 'transactions');
    }
}

export default TransactionsOverviewElement;
