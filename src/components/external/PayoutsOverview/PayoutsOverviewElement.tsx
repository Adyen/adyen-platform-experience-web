import { _UIComponentProps, PayoutsOverviewComponentProps } from '../../types';
import Payouts from './components/PayoutsOverviewContainer/PayoutsOverviewContainer';
import UIElement from '../UIElement/UIElement';

export class PayoutsElement extends UIElement<PayoutsOverviewComponentProps> {
    public static type = 'payouts';

    constructor(props: _UIComponentProps<PayoutsOverviewComponentProps>) {
        super(props);
        this.elementRef = (props && props.elementRef) || this;
        this.componentToRender = this.componentToRender.bind(this);
    }

    public componentToRender = () => {
        return (
            <Payouts
                {...this.props}
                balanceAccountId={this.props.core.options.balanceAccountId}
                ref={(ref: UIElement<PayoutsOverviewComponentProps>) => {
                    this.componentRef = ref;
                }}
                elementRef={this.elementRef}
            />
        );
    };
}

export default PayoutsElement;
