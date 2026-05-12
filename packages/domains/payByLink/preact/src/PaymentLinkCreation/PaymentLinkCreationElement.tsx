import { _UIComponentProps, ExternalComponentType } from '@integration-components/types';
import { UIElement } from '@integration-components/core/preact';
import { PaymentLinkCreationComponentProps } from './types';
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
