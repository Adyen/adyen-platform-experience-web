import { _UIComponentProps, ExternalComponentType, PaymentLinkOverviewComponentProps } from '../../types';
import UIElement from '../UIElement/UIElement';
import PaymentLinkOverviewContainer from './components/PaymentLinkOverviewContainer';

export class PaymentLinkOverviewElement extends UIElement<PaymentLinkOverviewComponentProps> {
    public static type: ExternalComponentType = 'paymentLinksOverview';

    constructor(props: _UIComponentProps<PaymentLinkOverviewComponentProps>) {
        super(props);
        this.componentToRender = this.componentToRender.bind(this);
    }

    public componentToRender = () => {
        return <PaymentLinkOverviewContainer {...this.props} />;
    };
}

export default PaymentLinkOverviewElement;
