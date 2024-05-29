import { _UIComponentProps } from '../../types';
import { DetailsComponentProps } from '../TransactionDetails';
import UIElement from '../UIElement';
import DataOverviewDetails from '../../internal/DataOverviewDetails/DataOverviewDetails';

export class PayoutElement extends UIElement<DetailsComponentProps> {
    public static type = 'payoutDetails';

    constructor(props: _UIComponentProps<DetailsComponentProps>) {
        super(props);
        this.elementRef = (props && props.elementRef) || this;
        this.componentToRender = this.componentToRender.bind(this);
    }

    public componentToRender = () => {
        return <DataOverviewDetails {...this.props} type={'payout'} />;
    };
}

export default PayoutElement;
