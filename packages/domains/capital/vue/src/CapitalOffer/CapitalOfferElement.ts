import { UIElement } from '@integration-components/core/vue';
import { getExternalCapitalState, type ExternalCapitalState } from '@integration-components/capital/domain';
import type { ExternalComponentType } from '@integration-components/types';
import CapitalOffer from './components/CapitalOffer.vue';
import type { CapitalOfferExternalProps } from './types';

export class CapitalOfferElement extends UIElement<CapitalOfferExternalProps> {
    public static readonly type: ExternalComponentType = 'capitalOffer' as const;

    constructor(props: CapitalOfferExternalProps) {
        super(CapitalOffer, props, 'capitalOffer');
    }

    public async getState(): Promise<ExternalCapitalState> {
        return await getExternalCapitalState(this.core.session, this.core.getCdnConfig);
    }
}

export default CapitalOfferElement;
