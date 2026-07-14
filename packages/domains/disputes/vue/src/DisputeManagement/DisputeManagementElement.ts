import { UIElement } from '@integration-components/core/vue';
import DisputeDetailsContainer from './components/DisputeDetailsContainer.vue';
import type { DisputeManagementExternalProps } from './types';

export class DisputeManagementElement extends UIElement<DisputeManagementExternalProps> {
    public static type = 'disputesManagement' as const;

    constructor(props: DisputeManagementExternalProps) {
        super(DisputeDetailsContainer, props, 'disputesManagement');
    }
}

export default DisputeManagementElement;
