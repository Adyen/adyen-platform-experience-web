import { UIElement } from '@integration-components/core/vue';
import DisputeDetailsContainer from './components/DisputeDetailsContainer.vue';
import type { ExternalComponentType } from '@integration-components/types';
import type { DisputeManagementExternalProps } from './types';

export class DisputeManagementElement extends UIElement<DisputeManagementExternalProps> {
    public static readonly type: ExternalComponentType = 'disputesManagement' as const;

    constructor(props: DisputeManagementExternalProps) {
        super(DisputeDetailsContainer, props, 'disputesManagement');
    }
}

export default DisputeManagementElement;
