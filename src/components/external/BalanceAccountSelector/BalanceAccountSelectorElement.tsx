import { _UIComponentProps, BalanceAccountSelectorComponentProps, ExternalComponentType } from '../../types';
import BalanceAccountSelector from './components/BalanceAccountSelectorContainer';
import UIElement from '../UIElement/UIElement';

export class BalanceAccountSelectorElement extends UIElement<BalanceAccountSelectorComponentProps> {
    public static type: ExternalComponentType = 'balanceAccountSelector';

    constructor(props: _UIComponentProps<BalanceAccountSelectorComponentProps>) {
        super(props);
        this.componentToRender = this.componentToRender.bind(this);
    }

    public componentToRender = () => {
        return (
            <BalanceAccountSelector
                {...this.props}
                // ref={(ref: UIElement<BalanceAccountSelectorComponentProps>) => void (this.componentRef = ref)}
            />
        );
    };
}

export default BalanceAccountSelectorElement;
