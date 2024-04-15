import { DataOverviewComponentProps } from '@src/components';
import UIElement from '../UIElement';
import Transactions from './components/TransactionsOverviewContainer/OverviewContainer';
import { _UIComponentProps } from '../../types';

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
                type={'transactions'}
                elementRef={this.elementRef}
            />
        );
    };
}

export default TransactionsElement;
