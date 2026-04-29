import { _UIComponentProps, ExternalComponentType } from '@integration-components/types';
import Transactions from './components/TransactionsOverviewContainer/TransactionsOverviewContainer';
import { UIElement } from '@integration-components/core/preact';
import type { TransactionsOverviewComponentProps } from './types';

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
