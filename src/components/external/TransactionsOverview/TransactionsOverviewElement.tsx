import { _UIComponentProps, TransactionOverviewComponentProps } from '../../types';
import Transactions from './components/TransactionsOverviewContainer/TransactionsOverviewContainer';
import UIElement from '../UIElement/UIElement';

export class TransactionsElement extends UIElement<TransactionOverviewComponentProps> {
    public static type = 'transactions';

    constructor(props: _UIComponentProps<TransactionOverviewComponentProps>) {
        super(props);
        this.elementRef = (props && props.elementRef) || this;
        this.componentToRender = this.componentToRender.bind(this);
    }

    public componentToRender = () => {
        return (
            <Transactions
                {...this.props}
                balanceAccountId={this.props.core.options.balanceAccountId}
                ref={(ref: UIElement<TransactionOverviewComponentProps>) => {
                    this.componentRef = ref;
                }}
                elementRef={this.elementRef}
            ></Transactions>
        );
    };
}

export default TransactionsElement;
