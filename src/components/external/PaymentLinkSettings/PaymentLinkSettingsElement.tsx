import { _UIComponentProps, PaymentLinkSettingsComponentProps, ExternalComponentType } from '../../types';
import UIElement from '../UIElement/UIElement';
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
