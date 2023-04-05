import CoreProvider from '../../core/Context/CoreProvider';
import UIElement from '../UIElement';
import BalanceAccountDetails from './components/BalanceAccountDetails';
import { AccountHolderDetailsProps } from '../AccountHolder/types';

export class BalanceAccountElement extends UIElement {
    public static type = 'balanceAccountDetails';

    get isValid() {
        return !!this.state.isValid;
    }

    get displayName() {
        return this.props.name;
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
                <BalanceAccountDetails
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

export default BalanceAccountElement;
