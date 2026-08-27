import type { App } from 'vue';
import BentoVue from '@adyen/bento-vue3';
import { UIElement } from '@integration-components/core/vue';
import TransactionsOverviewContainer from './components/TransactionsOverviewContainer/TransactionsOverviewContainer.vue';
import type { ExternalComponentType } from '@integration-components/types';
import type { TransactionsOverviewExternalProps } from './types';

export class TransactionsOverviewElement extends UIElement<TransactionsOverviewExternalProps> {
    public static readonly type: ExternalComponentType = 'transactions' as const;

    constructor(props: TransactionsOverviewExternalProps) {
        super(TransactionsOverviewContainer, props, 'transactions');
    }

    protected configureApp(app: App): void {
        app.use(BentoVue, { withToast: true, withDesignTokensCSSInjection: false });
    }
}

export default TransactionsOverviewElement;
