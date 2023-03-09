import CoreProvider from '../../core/Context/CoreProvider';
import UIElement from '../UIElement';
import Transactions from './components/Transactions';

export class TransactionsElement extends UIElement {
    public static type = 'transactions';

    constructor(props) {
        super(props);
        this.elementRef = (props && props.elementRef) || this;
    }

    get isValid() {
        return !!this.state.isValid;
    }

    get displayName() {
        return this.props.name;
    }

    formatProps(props) {
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

    // handleFilterChange(filters) {
    //     if (this.props.onFilterChange) this.props.onFilterChange({filters}, this.elementRef);
    // }

    render() {
        return (
            <CoreProvider i18n={this.props.i18n} loadingContext={this.props.loadingContext}>
                <Transactions
                    ref={ref => {
                        this.componentRef = ref;
                    }}
                    {...this.props}
                    onChange={this.setState}
                    elementRef={this.elementRef}
                />
            </CoreProvider>
        );
    }
}

export default TransactionsElement;
