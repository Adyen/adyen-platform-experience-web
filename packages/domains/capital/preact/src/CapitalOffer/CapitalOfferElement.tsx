import { _UIComponentProps, ExternalComponentType } from '@integration-components/types';
import { UIElement } from '@integration-components/core/preact';
import { ExternalCapitalState, getExternalCapitalState } from '@integration-components/capital/domain';
import { CapitalOfferElementProps } from './types';
import { CapitalOffer } from './components/CapitalOffer/CapitalOffer';

export class CapitalOfferElement extends UIElement<CapitalOfferElementProps> {
    public static type: ExternalComponentType = 'capitalOffer';

    constructor(props: _UIComponentProps<CapitalOfferElementProps>) {
        super(props);
        this.componentToRender = this.componentToRender.bind(this);
        this.customClassNames = 'adyen-pe-capital-offer-component';
    }

    public componentToRender = () => {
        return <CapitalOffer {...this.props} />;
    };

    public async getState(): Promise<ExternalCapitalState> {
        const { session, getCdnConfig } = this.props.core;
        return await getExternalCapitalState(session, getCdnConfig);
    }
}

export default CapitalOfferElement;
