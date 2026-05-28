import { _UIComponentProps, ExternalComponentType } from '@integration-components/types';
import { UIElement } from '@integration-components/core/preact';
import { PaymentLinksOverviewComponentProps } from './types';
import PaymentLinksOverviewContainer from './components/PaymentLinksOverviewContainer';

export class PaymentLinksOverviewElement extends UIElement<PaymentLinksOverviewComponentProps> {
    public static type: ExternalComponentType = 'paymentLinksOverview';

    constructor(props: _UIComponentProps<PaymentLinksOverviewComponentProps>) {
        super(props);
        this.componentToRender = this.componentToRender.bind(this);
    }

    public componentToRender = () => {
        return <PaymentLinksOverviewContainer {...this.props} />;
    };
}

export default PaymentLinksOverviewElement;
