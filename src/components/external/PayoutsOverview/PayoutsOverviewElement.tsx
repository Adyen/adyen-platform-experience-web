import { _UIComponentProps, ExternalComponentType, PayoutsOverviewComponentProps } from '../../types';
import Payouts from './components/PayoutsOverviewContainer/PayoutsOverviewContainer';
import UIElement from '../UIElement/UIElement';

export class PayoutsElement extends UIElement<PayoutsOverviewComponentProps> {
    public static type: ExternalComponentType = 'payouts';

    constructor(props: _UIComponentProps<PayoutsOverviewComponentProps>) {
        super(props);
        this.componentToRender = this.componentToRender.bind(this);
    }

    public componentToRender = () => {
        return <Payouts {...this.props} />;
    };
}

export default PayoutsElement;
