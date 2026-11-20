import { UIElement } from '@integration-components/core/vue';
import CapitalOverview from './components/CapitalOverview/CapitalOverview.vue';
import type { CapitalOverviewExternalProps } from './types';
import { getExternalCapitalState, type ExternalCapitalState } from '@integration-components/capital/domain';

export class CapitalOverviewElement extends UIElement<CapitalOverviewExternalProps> {
    public static readonly type = 'capitalOverview' as const;

    constructor(props: CapitalOverviewExternalProps) {
        super(CapitalOverview, props, 'capitalOverview');
    }

    public async getState(): Promise<ExternalCapitalState> {
        const { session, getCdnConfig } = this.core;
        return await getExternalCapitalState(session, getCdnConfig);
    }
}
