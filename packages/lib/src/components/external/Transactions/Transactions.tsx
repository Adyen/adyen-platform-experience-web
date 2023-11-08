import CoreProvider from '@src/core/Context/CoreProvider';
import UIElement from '../UIElement';
import Transactions from './components/Transactions';
import { TransactionsComponentProps } from './types';
import { _UIComponentProps } from '../../types';

export class TransactionsElement extends UIElement<TransactionsComponentProps> {
    public static type = 'transactions';

    // TODO assign correct prop type
    constructor(props: _UIComponentProps<TransactionsComponentProps>) {
        super(props);
        this.elementRef = (props && props.elementRef) || this;
    }

    get isValid() {
        return !!this.state.isValid;
    }

    get displayName() {
        return this.props.name ?? this.type;
    }

    formatProps(props: TransactionsComponentProps) {
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
            <CoreProvider i18n={this.i18n} loadingContext={this.loadingContext}>
                <Transactions
                    {...this.props}
                    ref={(ref: UIElement<TransactionsComponentProps>) => {
                        this.componentRef = ref;
                    }}
                    elementRef={this.elementRef}
                />
            </CoreProvider>
        );
    }
}

export default TransactionsElement;
