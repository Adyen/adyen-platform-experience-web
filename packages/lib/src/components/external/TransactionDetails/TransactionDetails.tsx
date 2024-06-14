import { _UIComponentProps } from '../../types';
import UIElement from '../UIElement/UIElement';
import TransactionDetails from './components/TransactionDetails';
import { TransactionDetailsComponentProps } from './types';

export class TransactionsElement extends UIElement<TransactionDetailsComponentProps> {
    public static type = 'transactionsDetails';

    constructor(props: _UIComponentProps<TransactionDetailsComponentProps>) {
        super(props);
        this.elementRef = (props && props.elementRef) || this;
        this.componentToRender = this.componentToRender.bind(this);
    }

    public componentToRender = () => {
        return <TransactionDetails {...this.props} />;
    };
}

export default TransactionsElement;
