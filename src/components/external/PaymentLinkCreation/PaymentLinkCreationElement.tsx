import { _UIComponentProps, PaymentLinkCreationComponentProps, ExternalComponentType } from '../../types';
import UIElement from '../UIElement/UIElement';
import PaymentLinkCreationContainer from './components/PaymentLinkCreationContainer/PaymentLinkCreationContainer';

export class PaymentLinkCreationElement extends UIElement<PaymentLinkCreationComponentProps> {
    public static type: ExternalComponentType = 'paymentLinkCreation';

    constructor(props: _UIComponentProps<PaymentLinkCreationComponentProps>) {
        super(props);
    }

    public componentToRender = () => {
        return <PaymentLinkCreationContainer {...this.props} />;
    };
}

export default PaymentLinkCreationElement;
