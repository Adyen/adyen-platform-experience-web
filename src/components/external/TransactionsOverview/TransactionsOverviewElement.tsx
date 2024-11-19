import { _UIComponentProps, ExternalComponentType, TransactionOverviewComponentProps } from '../../types';
import Transactions from './components/TransactionsOverviewContainer/TransactionsOverviewContainer';
import UIElement from '../UIElement/UIElement';

export class TransactionsElement extends UIElement<TransactionOverviewComponentProps> {
    public static type: ExternalComponentType = 'transactions';

    constructor(props: _UIComponentProps<TransactionOverviewComponentProps>) {
        super(props);
        this.componentToRender = this.componentToRender.bind(this);
    }

    public componentToRender = () => {
        return (
            <Transactions
                {...this.props}
                balanceAccountId={this.props.balanceAccountId}
                ref={(ref: UIElement<TransactionOverviewComponentProps>) => void (this.componentRef = ref)}
            ></Transactions>
        );
    };
}

export default TransactionsElement;
