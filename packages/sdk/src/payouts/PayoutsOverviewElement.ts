import type { CoreInstance } from '@integration-components/core/vue';
import type { PayoutsOverviewDomainProps } from '@integration-components/payouts/vue/definitions';
import type { ExternalComponentType } from '@integration-components/types';
import { DomainComponent } from '../internal/DomainComponent';
import { bindPayoutsOverview } from './bindPayoutsOverview';

export interface PayoutsOverviewExternalProps extends PayoutsOverviewDomainProps {
    core: CoreInstance;
}

export class PayoutsOverviewElement extends DomainComponent<PayoutsOverviewDomainProps> {
    public static readonly type: ExternalComponentType = 'payouts';

    constructor({ core, ...props }: PayoutsOverviewExternalProps) {
        const integration = bindPayoutsOverview(core);
        super(core, props, PayoutsOverviewElement.type, 'Payouts overview', nextProps => integration.create(nextProps));
    }
}

export default PayoutsOverviewElement;
