import { PayoutDetailsWithIdProps } from '../../internal/DataOverviewDetails/types';
import { _UIComponentProps, ExternalComponentType } from '../../types';
import UIElement from '../UIElement/UIElement';
import DataOverviewDetails from '../../internal/DataOverviewDetails/DataOverviewDetails';

export class PayoutElement extends UIElement<PayoutDetailsWithIdProps> {
    public static type: ExternalComponentType = 'payoutDetails';

    constructor(props: _UIComponentProps<PayoutDetailsWithIdProps>) {
        super(props);
        this.componentToRender = this.componentToRender.bind(this);
    }

    public componentToRender = () => {
        return (
            <DataOverviewDetails {...this.props} type={'payout'} ref={(ref: UIElement<PayoutDetailsWithIdProps>) => void (this.componentRef = ref)} />
        );
    };
}

export default PayoutElement;
