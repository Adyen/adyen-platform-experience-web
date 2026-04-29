import { _UIComponentProps, ExternalComponentType, TransactionsOverviewComponentProps } from '../../../../../../src/components/types';
import Transactions from './components/TransactionsOverviewContainer/TransactionsOverviewContainer';
import UIElement from '../../../../../../src/components/external/UIElement/UIElement';

export class TransactionsElement extends UIElement<TransactionsOverviewComponentProps> {
    public static type: ExternalComponentType = 'transactions';

    constructor(props: _UIComponentProps<TransactionsOverviewComponentProps>) {
        super(props);
        this.componentToRender = this.componentToRender.bind(this);
    }

    public componentToRender = () => {
        return <Transactions {...this.props} />;
    };
}

export default TransactionsElement;
