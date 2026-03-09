import { UIElement } from '../UIElement';
import TransactionsOverviewWrapper from './TransactionsOverviewWrapper.vue';
import type { TransactionsOverviewExternalProps } from './types';

/**
 * Imperative wrapper for TransactionsOverview, mirroring the Preact BaseElement.mount() pattern.
 *
 * Usage:
 *   const core = await AdyenPlatformExperienceVue({ ... });
 *   const transactionsOverview = new TransactionsOverviewElement({ core, balanceAccountId: 'BA...' });
 *   transactionsOverview.mount('#transactions-container');
 *   transactionsOverview.update({ balanceAccountId: 'BA_NEW...' });
 *   transactionsOverview.unmount();
 */
export class TransactionsOverviewElement extends UIElement<TransactionsOverviewExternalProps> {
    constructor(props: TransactionsOverviewExternalProps) {
        super(TransactionsOverviewWrapper, props);
    }
}

export default TransactionsOverviewElement;
