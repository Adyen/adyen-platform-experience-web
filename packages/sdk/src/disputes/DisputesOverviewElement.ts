import type { CoreInstance } from '@integration-components/core/vue';
import type { DisputesOverviewDomainProps } from '@integration-components/disputes/vue/definitions';
import type { ExternalComponentType } from '@integration-components/types';
import { DomainComponent } from '../internal/DomainComponent';
import { bindDisputesOverview } from './bindDisputesOverview';

export interface DisputesOverviewExternalProps extends DisputesOverviewDomainProps {
    core: CoreInstance;
}

export class DisputesOverviewElement extends DomainComponent<DisputesOverviewDomainProps> {
    public static readonly type: ExternalComponentType = 'disputes';

    constructor({ core, ...props }: DisputesOverviewExternalProps) {
        const integration = bindDisputesOverview(core);
        super(core, props, DisputesOverviewElement.type, 'Disputes overview', nextProps => integration.create(nextProps));
    }
}

export default DisputesOverviewElement;
