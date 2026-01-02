import { _UIComponentProps, ExternalComponentType } from '../../types';
import UIElement from '../UIElement/UIElement';
import DataOverviewDetails from '../../internal/DataOverviewDetails/DataOverviewDetails';
import { TransactionDetailsProps } from './types';

export class TransactionElement extends UIElement<TransactionDetailsProps> {
    public static type: ExternalComponentType = 'transactionDetails';

    constructor(props: _UIComponentProps<TransactionDetailsProps>) {
        super(props);
        this.componentToRender = this.componentToRender.bind(this);
    }

    public componentToRender = () => {
        return <DataOverviewDetails {...this.props} type="transaction" />;
    };
}

export default TransactionElement;
