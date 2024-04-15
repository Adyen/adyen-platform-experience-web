import { DataOverviewComponentProps, OverviewComponentProps } from '@src/components';
import OverviewContainer from '@src/components/external/TransactionsOverview/components/TransactionsOverviewContainer/OverviewContainer';
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
            <OverviewContainer
                {...this.props}
                balanceAccountId={this.props.core.options.balanceAccountId}
                ref={(ref: UIElement<DataOverviewComponentProps>) => {
                    this.componentRef = ref;
                }}
                type={'payouts'}
                elementRef={this.elementRef}
            />
        );
    };
}

export default PayoutsElement;
