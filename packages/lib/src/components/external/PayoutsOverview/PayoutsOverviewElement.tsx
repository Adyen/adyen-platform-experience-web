import { DataOverviewComponentProps } from '@src/components/shared/components/types';
import Payouts from '@src/components/external/PayoutsOverview/components/PayoutsOverviewContainer/PayoutsOverviewContainer';
import UIElement from '../UIElement';
import { _UIComponentProps } from '../../types';

export class PayoutsElement extends UIElement<DataOverviewComponentProps> {
    public static type = 'payouts';

    constructor(props: _UIComponentProps<DataOverviewComponentProps>) {
        super(props);
        this.elementRef = (props && props.elementRef) || this;
        this.componentToRender = this.componentToRender.bind(this);
    }

    public componentToRender = () => {
        return (
            <Payouts
                {...this.props}
                balanceAccountId={this.props.core.options.balanceAccountId}
                ref={(ref: UIElement<DataOverviewComponentProps>) => {
                    this.componentRef = ref;
                }}
                elementRef={this.elementRef}
            />
        );
    };
}

export default PayoutsElement;
