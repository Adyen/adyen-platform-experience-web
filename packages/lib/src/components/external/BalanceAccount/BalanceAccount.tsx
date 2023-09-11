import CoreProvider from '../../../core/Context/CoreProvider';
import UIElement from '../../internal/UIElement/UIElement';
import BalanceAccountDetails from './components/BalanceAccountDetails';
import type { BalanceAccountComponentProps } from './types';

export class BalanceAccountElement extends UIElement<BalanceAccountComponentProps> {
    public static type = 'balanceAccountDetails';

    get isValid() {
        return !!this.state.isValid;
    }

    get displayName() {
        return this.props.name ?? this.type;
    }

    formatProps(props: BalanceAccountComponentProps) {
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
                    ref={(ref: UIElement<BalanceAccountComponentProps>) => {
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
