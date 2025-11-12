import { _UIComponentProps, ExternalComponentType } from '../../types';
import UIElement from '../UIElement/UIElement';
import { CapitalOfferElementProps } from './types';
import { CapitalOffer } from './components/CapitalOffer/CapitalOffer';

import { FormSuccess } from '../PayByLink/PayByLinkCreation/components/FormSuccess';

export class CapitalOfferElement extends UIElement<CapitalOfferElementProps> {
    public static type: ExternalComponentType = 'capitalOffer';

    constructor(props: _UIComponentProps<CapitalOfferElementProps>) {
        super(props);
        this.componentToRender = this.componentToRender.bind(this);
        this.customClassNames = 'adyen-pe-capital-offer-component';
    }

    public componentToRender = () => {
        return <FormSuccess />;
    };
}

export default CapitalOfferElement;
