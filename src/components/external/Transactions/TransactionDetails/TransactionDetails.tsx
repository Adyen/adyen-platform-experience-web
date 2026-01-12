import TransactionData from './components/TransactionData';
import { _UIComponentProps, ExternalComponentType } from '../../../types';
import { TransactionDetailsProps } from './types';
import UIElement from '../../../base/UIElement/UIElement';

export class TransactionElement extends UIElement<TransactionDetailsProps> {
    public static type: ExternalComponentType = 'transactionDetails';

    constructor(props: _UIComponentProps<TransactionDetailsProps>) {
        super(props);
        this.componentToRender = this.componentToRender.bind(this);
    }

    public componentToRender = () => {
        return <TransactionData {...this.props} />;
    };
}

export default TransactionElement;
