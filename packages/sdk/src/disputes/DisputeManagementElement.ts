import type { CoreInstance } from '@integration-components/core/vue';
import type { DisputeManagementDomainProps } from '@integration-components/disputes/vue/definitions';
import type { ExternalComponentType } from '@integration-components/types';
import { DomainComponent } from '../internal/DomainComponent';
import { bindDisputeManagement } from './bindDisputesOverview';

export interface DisputeManagementExternalProps extends DisputeManagementDomainProps {
    core: CoreInstance;
}

export class DisputeManagementElement extends DomainComponent<DisputeManagementDomainProps> {
    public static readonly type: ExternalComponentType = 'disputesManagement';

    constructor({ core, ...props }: DisputeManagementExternalProps) {
        const integration = bindDisputeManagement(core);
        super(core, props, DisputeManagementElement.type, 'Dispute management', nextProps => integration.create(nextProps));
    }
}

export default DisputeManagementElement;
