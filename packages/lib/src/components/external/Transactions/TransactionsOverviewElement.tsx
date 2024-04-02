import UIElement from '../UIElement';
import Transactions from './components/TransactionsOverviewContainer';
import { TransactionsComponentProps } from './types';
import { _UIComponentProps } from '../../types';

export class TransactionsElement extends UIElement<TransactionsComponentProps> {
    public static type = 'transactions';

    constructor(props: _UIComponentProps<TransactionsComponentProps>) {
        super(props);
        this.elementRef = (props && props.elementRef) || this;
        this.componentToRender = this.componentToRender.bind(this);
    }

    public componentToRender = () => {
        return (
            <Transactions
                {...this.props}
                balanceAccountId={this.props.core.options.balanceAccountId}
                ref={(ref: UIElement<TransactionsComponentProps>) => {
                    this.componentRef = ref;
                }}
                elementRef={this.elementRef}
            />
        );
    };
}

export default TransactionsElement;
