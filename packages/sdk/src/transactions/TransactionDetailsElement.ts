import type { CoreInstance } from '@integration-components/core/vue';
import type { TransactionDetailsDomainProps } from '@integration-components/transactions/vue/definitions';
import type { ExternalComponentType } from '@integration-components/types';
import { DomainComponent } from '../internal/DomainComponent';
import { bindTransactionDetails } from './bindTransactionsOverview';

export interface TransactionDetailsExternalProps extends TransactionDetailsDomainProps {
    core: CoreInstance;
}

export class TransactionDetailsElement extends DomainComponent<TransactionDetailsDomainProps> {
    public static readonly type: ExternalComponentType = 'transactionDetails';

    constructor({ core, ...props }: TransactionDetailsExternalProps) {
        const integration = bindTransactionDetails(core);
        super(core, props, TransactionDetailsElement.type, 'Transaction details', nextProps => integration.create(nextProps));
    }
}

export default TransactionDetailsElement;
