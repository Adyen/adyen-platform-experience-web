import CoreProvider from '../../core/Context/CoreProvider';
import UIElement from '../UIElement';
import AccountHolderDetails from './components/AccountHolderDetails';
import { AccountHolderDetailsProps } from './types';

export class AccountHolderElement extends UIElement<AccountHolderDetailsProps> {
    public static type = 'accountHolder';

    get isValid() {
        return !!this.state.isValid;
    }

    get displayName() {
        return this.props.name ?? this.type;
    }

    formatProps(props: AccountHolderDetailsProps) {
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
                <AccountHolderDetails {...this.props} onChange={this.props.onChange ?? this.setState} />
            </CoreProvider>
        );
    }
}

export default AccountHolderElement;
