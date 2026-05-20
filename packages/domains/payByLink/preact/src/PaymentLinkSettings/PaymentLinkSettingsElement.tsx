import { _UIComponentProps, ExternalComponentType } from '@integration-components/types';
import { UIElement } from '@integration-components/core/preact';
import { PaymentLinkSettingsComponentProps } from './types';
import PaymentLinkSettingsContainer from './components/PaymentLinkSettingsContainer/PaymentLinkSettingsContainer';

export class PaymentLinkSettingsElement extends UIElement<PaymentLinkSettingsComponentProps> {
    public static type: ExternalComponentType = 'paymentLinkSettings';

    constructor(props: _UIComponentProps<PaymentLinkSettingsComponentProps>) {
        super(props);
    }

    public componentToRender = () => {
        return <PaymentLinkSettingsContainer {...this.props} />;
    };
}

export default PaymentLinkSettingsElement;
