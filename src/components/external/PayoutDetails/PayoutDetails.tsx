import { _UIComponentProps, ExternalComponentType } from '../../types';
import UIElement from '../UIElement/UIElement';
import DataOverviewDetails from '../../internal/DataOverviewDetails/DataOverviewDetails';
import { PayoutDetailsProps } from './types';

export class PayoutElement extends UIElement<PayoutDetailsProps> {
    public static type: ExternalComponentType = 'payoutDetails';

    constructor(props: _UIComponentProps<PayoutDetailsProps>) {
        super(props);
        this.componentToRender = this.componentToRender.bind(this);
    }

    public componentToRender = () => {
        return <DataOverviewDetails {...this.props} type="payout" />;
    };
}

export default PayoutElement;
