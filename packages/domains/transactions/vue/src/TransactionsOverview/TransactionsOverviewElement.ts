import { UIElement } from '@integration-components/core/vue';
import TransactionsOverviewContainer from './components/TransactionsOverviewContainer/TransactionsOverviewContainer.vue';
import type { TransactionsOverviewExternalProps } from './types';

export class TransactionsOverviewElement extends UIElement<TransactionsOverviewExternalProps> {
    constructor(props: TransactionsOverviewExternalProps) {
        super(TransactionsOverviewContainer, props, 'TransactionsOverview');
    }
}

export default TransactionsOverviewElement;
