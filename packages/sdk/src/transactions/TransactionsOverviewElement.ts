import type { CoreInstance } from '@integration-components/core/vue';
import type { TransactionsOverviewDomainProps } from '@integration-components/transactions/vue/definitions';
import type { ExternalComponentType } from '@integration-components/types';
import { DomainComponent } from '../internal/DomainComponent';
import { bindTransactionsOverview } from './bindTransactionsOverview';

export interface TransactionsOverviewExternalProps extends TransactionsOverviewDomainProps {
    core: CoreInstance;
}

export class TransactionsOverviewElement extends DomainComponent<TransactionsOverviewDomainProps> {
    public static readonly type: ExternalComponentType = 'transactions';

    constructor({ core, ...props }: TransactionsOverviewExternalProps) {
        const integration = bindTransactionsOverview(core);
        super(core, props, TransactionsOverviewElement.type, 'Transactions overview', nextProps => integration.create(nextProps));
    }
}

export default TransactionsOverviewElement;
