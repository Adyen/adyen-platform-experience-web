import { _UIComponentProps, ExternalComponentType, PayByLinkOverviewComponentProps } from '../../types';
import UIElement from '../UIElement/UIElement';
import PayByLinkOverviewContainer from './components/PayByLinkOverviewContainer';

export class PayByLinkOverviewElement extends UIElement<PayByLinkOverviewComponentProps> {
    public static type: ExternalComponentType = 'payByLinkOverview';

    constructor(props: _UIComponentProps<PayByLinkOverviewComponentProps>) {
        super(props);
        this.componentToRender = this.componentToRender.bind(this);
    }

    public componentToRender = () => {
        return <PayByLinkOverviewContainer {...this.props} />;
    };
}

export default PayByLinkOverviewElement;
