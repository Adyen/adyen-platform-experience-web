import { _UIComponentProps } from '@src/components/types';
import UIElement from '../UIElement';
import BalanceAccountDetails from './components/BalanceAccountDetails';
import type { BalanceAccountComponentProps } from './types';

export class BalanceAccountElement extends UIElement<BalanceAccountComponentProps> {
    public static type = 'balanceAccountDetails';

    constructor(props: _UIComponentProps<BalanceAccountComponentProps>) {
        super(props);
        this.elementRef = (props && props.elementRef) || this;
        this.componentToRender = this.componentToRender.bind(this);
    }

    componentToRender = () => {
        return (
            <BalanceAccountDetails
                ref={(ref: UIElement<BalanceAccountComponentProps>) => {
                    this.componentRef = ref;
                }}
                {...this.props}
                onChange={this.setState}
            />
        );
    };
}

export default BalanceAccountElement;
