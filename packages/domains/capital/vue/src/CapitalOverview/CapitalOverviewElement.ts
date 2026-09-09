import { UIElement } from '@integration-components/core/vue';
import CapitalOverviewContainer from './components/CapitalOverviewContainer/CapitalOverviewContainer.vue';
import type { CapitalOverviewExternalProps } from './types';
import { ExternalComponentType } from '@integration-components/types';
import { ExternalCapitalState, getExternalCapitalState } from '@integration-components/capital/domain';

export class CapitalOverviewElement extends UIElement<CapitalOverviewExternalProps> {
    public static readonly type: ExternalComponentType = 'capitalOverview';

    constructor(props: CapitalOverviewExternalProps) {
        super(CapitalOverviewContainer, props, 'capitalOverview');
    }

    public async getState(): Promise<ExternalCapitalState> {
        const { session, getCdnConfig } = this.core;
        return await getExternalCapitalState(session, getCdnConfig);
    }
}

export default CapitalOverviewElement;
