import { _UIComponentProps, ExternalComponentType } from '../../../types';
import UIElement from '../../../base/UIElement/UIElement';
import { PaymentLinkDetails } from './components/PaymentLinkDetails/PaymentLinkDetails';
import { PaymentLinkDetailsProps } from './types';

export class PaymentLinkDetailsElement extends UIElement<PaymentLinkDetailsProps> {
    public static type: ExternalComponentType = 'paymentLinkDetails';

    constructor(props: _UIComponentProps<PaymentLinkDetailsProps>) {
        super(props);
        this.componentToRender = this.componentToRender.bind(this);
    }

    public componentToRender = () => {
        return <PaymentLinkDetails {...this.props} />;
    };
}

export default PaymentLinkDetailsElement;
