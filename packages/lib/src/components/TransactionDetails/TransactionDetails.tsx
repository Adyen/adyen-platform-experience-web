import CoreProvider from '../../core/Context/CoreProvider';
import UIElement from '../UIElement';
import TransactionDetails from './components/TransactionDetails';
import { TransactionDetailsProps } from './types';

export class TransactionsElement extends UIElement {
    public static type = 'transactionsDetails';

    get isValid() {
        return !!this.state.isValid;
    }

    get displayName() {
        return this.props.name;
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
                <TransactionDetails
                    ref={(ref: UIElement) => {
                        this.componentRef = ref;
                    }}
                    {...this.props}
                    onChange={this.setState}
                />
            </CoreProvider>
        );
    }
}

export default TransactionsElement;
