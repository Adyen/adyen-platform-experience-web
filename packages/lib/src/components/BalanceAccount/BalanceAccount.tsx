import CoreProvider from '../../core/Context/CoreProvider';
import UIElement from '../UIElement';
import BalanceAccountDetails from './components/BalanceAccountDetails';
import { BalanceAccountDetailsProps } from '../BalanceAccount/types';

export class BalanceAccountElement extends UIElement<BalanceAccountDetailsProps> {
    public static type = 'balanceAccountDetails';

    get isValid() {
        return !!this.state.isValid;
    }

    get displayName() {
        return this.props.name ?? this.type;
    }

    formatProps(props: BalanceAccountDetailsProps) {
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
                    ref={(ref: UIElement<BalanceAccountDetailsProps>) => {
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
