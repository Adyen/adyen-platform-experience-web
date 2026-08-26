import { UIElement } from '@integration-components/core/vue';
import CapitalOverviewContainer from './components/CapitalOverviewContainer/CapitalOverviewContainer.vue';
import type { CapitalOverviewExternalProps } from './types';
import { ExternalComponentType } from '@integration-components/types';
import { getExternalCapitalState } from '@integration-components/capital/domain';
import { CapitalComponentState } from '../../../domain/src/CapitalOverview/types';

export class CapitalOverviewElement extends UIElement<CapitalOverviewExternalProps> {
    public static readonly type: ExternalComponentType = 'capitalOverview';

    constructor(props: CapitalOverviewExternalProps) {
        super(CapitalOverviewContainer, props, 'capitalOverview');
        this.customClassNames = 'adyen-pe-capital-overview-component';
    }

    public async getState(): Promise<CapitalComponentState> {
        const { session, getCdnConfig } = this.core;
        return await getExternalCapitalState(session, getCdnConfig);
    }
}

export default CapitalOverviewElement;
