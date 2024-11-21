import { _UIComponentProps, ExternalComponentType } from '../../types';
import UIElement from '../UIElement/UIElement';
import { CapitalOfferProps } from './types';
import { CapitalOffer } from './components/CapitalOffer/CapitalOffer';

export class CapitalOfferElement extends UIElement<CapitalOfferProps> {
    public static type: ExternalComponentType = 'capitalOffer';

    constructor(props: _UIComponentProps<CapitalOfferProps>) {
        super(props);
        this.componentToRender = this.componentToRender.bind(this);
        this.maxWidth = 600;
    }

    public componentToRender = () => {
        return <CapitalOffer {...this.props} />;
    };
}

export default CapitalOfferElement;
