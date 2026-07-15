import { UIElement } from '@integration-components/core/vue';
import DisputesOverviewContainer from './components/DisputesOverviewContainer.vue';
import type { DisputesOverviewExternalProps } from './types';

export class DisputesOverviewElement extends UIElement<DisputesOverviewExternalProps> {
    public static type = 'disputes' as const;

    constructor(props: DisputesOverviewExternalProps) {
        super(DisputesOverviewContainer, props, 'DisputesOverview');
    }
}

export default DisputesOverviewElement;
