import { _UIComponentProps, PayByLinkSettingsComponentProps, ExternalComponentType } from '../../../types';
import UIElement from '../../UIElement/UIElement';
import PayByLinkSettingsContainer from './components/PayByLinkSettingsContainer/PayByLinkSettingsContainer';

export class PayByLinkSettingsElement extends UIElement<PayByLinkSettingsComponentProps> {
    // TODO: CHANGE
    // TODO: CHANGE
    // TODO: CHANGE
    public static type: ExternalComponentType = 'capitalOverview';

    constructor(props: _UIComponentProps<PayByLinkSettingsComponentProps>) {
        super(props);
    }

    public componentToRender = () => {
        return <PayByLinkSettingsContainer {...this.props} />;
    };
}

export default PayByLinkSettingsElement;
