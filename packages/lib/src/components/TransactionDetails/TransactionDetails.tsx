import CoreProvider from '../../core/Context/CoreProvider';
import UIElement from '../UIElement';
import TransactionDetails from './components/TransactionDetails';
import { TransactionDetailsProps } from './types';

export class TransactionsElement extends UIElement<TransactionDetailsProps> {
    public static type = 'transactionsDetails';

    get isValid() {
        return !!this.state.isValid;
    }

    get displayName() {
        return this.props.name ?? this.type;
    }

    formatProps(props: TransactionDetailsProps) {
        return props;
    }

    /**
     * Formats the component data output
     */
    formatData() {
        return {
            ...this.state,
        };
    }

    render() {
        return (
            <CoreProvider i18n={this.props.i18n} loadingContext={this.props.loadingContext}>
                <TransactionDetails {...this.props} onChange={this.setState} />
            </CoreProvider>
        );
    }
}

export default TransactionsElement;
