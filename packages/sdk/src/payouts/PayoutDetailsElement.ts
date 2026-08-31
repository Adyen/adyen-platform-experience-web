import type { CoreInstance } from '@integration-components/core/vue';
import type { PayoutDetailsDomainProps } from '@integration-components/payouts/vue/definitions';
import type { ExternalComponentType } from '@integration-components/types';
import { DomainComponent } from '../internal/DomainComponent';
import { bindPayoutDetails } from './bindPayoutsOverview';

export interface PayoutDetailsExternalProps extends PayoutDetailsDomainProps {
    core: CoreInstance;
}

export class PayoutDetailsElement extends DomainComponent<PayoutDetailsDomainProps> {
    public static readonly type: ExternalComponentType = 'payoutDetails';

    constructor({ core, ...props }: PayoutDetailsExternalProps) {
        const integration = bindPayoutDetails(core);
        super(core, props, PayoutDetailsElement.type, 'Payout details', nextProps => integration.create(nextProps));
    }
}

export default PayoutDetailsElement;
