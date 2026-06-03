import { _UIComponentProps, ExternalComponentType } from '@integration-components/types';
import { UIElement } from '@integration-components/core/preact';
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
}

export default CapitalOfferElement;
