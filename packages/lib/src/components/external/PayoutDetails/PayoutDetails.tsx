import { PayoutDetailsWithIdProps } from '../../internal/DataOverviewDetails/types';
import { _UIComponentProps } from '../../types';
import UIElement from '../UIElement';
import DataOverviewDetails from '../../internal/DataOverviewDetails/DataOverviewDetails';

export class PayoutElement extends UIElement<PayoutDetailsWithIdProps> {
    public static type = 'payoutDetails';

    constructor(props: _UIComponentProps<PayoutDetailsWithIdProps>) {
        super(props);
        this.elementRef = (props && props.elementRef) || this;
        this.componentToRender = this.componentToRender.bind(this);
    }

    public componentToRender = () => {
        return <DataOverviewDetails {...this.props} type={'payout'} />;
    };
}

export default PayoutElement;
