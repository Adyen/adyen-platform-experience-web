import type { _UIComponentProps, DataOverviewComponentProps } from '../../types';
import Transactions from './components/TransactionsOverviewContainer/TransactionsOverviewContainer';
import UIElement from '../UIElement';

export class TransactionsElement extends UIElement<DataOverviewComponentProps> {
    public static type = 'transactions';

    constructor(props: _UIComponentProps<DataOverviewComponentProps>) {
        super(props);
        this.elementRef = (props && props.elementRef) || this;
        this.componentToRender = this.componentToRender.bind(this);
    }

    public componentToRender = () => {
        return (
            <Transactions
                {...this.props}
                balanceAccountId={this.props.core.options.balanceAccountId}
                ref={(ref: UIElement<DataOverviewComponentProps>) => {
                    this.componentRef = ref;
                }}
                elementRef={this.elementRef}
            ></Transactions>
        );
    };
}

export default TransactionsElement;
