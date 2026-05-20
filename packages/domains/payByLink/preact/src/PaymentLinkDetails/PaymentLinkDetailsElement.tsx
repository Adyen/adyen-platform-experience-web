import { _UIComponentProps, ExternalComponentType } from '@integration-components/types';
import { UIElement } from '@integration-components/core/preact';
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
