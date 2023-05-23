import CoreProvider from '../../core/Context/CoreProvider';
import UIElement from '../UIElement';
import Transactions from './components/Transactions';
import { TransactionsPageProps } from './types';

export class TransactionsElement extends UIElement<TransactionsPageProps> {
    public static type = 'transactions';

    // TODO assign correct prop type
    constructor(props: TransactionsPageProps) {
        super(props);
        this.elementRef = (props && props.elementRef) || this;
    }

    get isValid() {
        return !!this.state.isValid;
    }

    get displayName() {
        return this.props.name ?? this.type;
    }

    formatProps(props: TransactionsPageProps) {
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
                <Transactions
                    {...this.props}
                    ref={(ref: UIElement<TransactionsPageProps>) => {
                        this.componentRef = ref;
                    }}
                    onChange={this.setState}
                    elementRef={this.elementRef}
                />
            </CoreProvider>
        );
    }
}

export default TransactionsElement;
