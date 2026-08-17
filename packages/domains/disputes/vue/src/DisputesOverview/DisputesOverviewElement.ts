import { UIElement } from '@integration-components/core/vue';
import DisputesOverviewContainer from './components/DisputesOverviewContainer.vue';
import type { ExternalComponentType } from '@integration-components/types';
import type { DisputesOverviewExternalProps } from './types';

export class DisputesOverviewElement extends UIElement<DisputesOverviewExternalProps> {
    public static readonly type: ExternalComponentType = 'disputes' as const;

    constructor(props: DisputesOverviewExternalProps) {
        super(DisputesOverviewContainer, props, 'disputes');
    }
}

export default DisputesOverviewElement;
