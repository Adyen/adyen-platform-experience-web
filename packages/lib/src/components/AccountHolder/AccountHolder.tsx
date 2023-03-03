import { h } from 'preact';
import CoreProvider from '../../core/Context/CoreProvider';
import UIElement from '../UIElement';
import AccountHolderDetails from './components/AccountHolderDetails';

export class AccountHolderElement extends UIElement {
    public static type = 'accountHolder';

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
                <AccountHolderDetails
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

export default AccountHolderElement;
