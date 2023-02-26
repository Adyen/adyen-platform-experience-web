import { h } from 'preact';
import CoreProvider from '../../core/Context/CoreProvider';
import UIElement from '../UIElement';
import BalanceAccountsList from './components/BalanceAccountsList';

export default class BalanceAccountsElement extends UIElement {
    public static type = 'transactions';

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

    render() {
        return (
            <CoreProvider i18n={this.props.i18n} loadingContext={this.props.loadingContext}>
                <BalanceAccountsList
                    ref={ref => {
                        this.componentRef = ref;
                    }}
                    {...this.props}
                    onChange={this.setState}
                />
            </CoreProvider>
        );
    }
}
