import { _UIComponentProps, PayByLinkCreationComponentProps, ExternalComponentType } from '../../../types';
import UIElement from '../../UIElement/UIElement';
import PayByLinkCreationContainer from './components/PayByLinkCreationContainer';

export class PayByLinkCreationElement extends UIElement<PayByLinkCreationComponentProps> {
    public static type: ExternalComponentType = 'payByLinkCreation';

    constructor(props: _UIComponentProps<PayByLinkCreationComponentProps>) {
        super(props);
        this.componentToRender = this.componentToRender.bind(this);
    }

    public componentToRender = () => {
        return <PayByLinkCreationContainer {...this.props} />;
    };
}

export default PayByLinkCreationElement;
