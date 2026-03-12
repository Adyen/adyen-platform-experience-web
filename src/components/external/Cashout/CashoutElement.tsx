import { _UIComponentProps, ExternalComponentType } from '../../types';
import UIElement from '../UIElement/UIElement';
import { CashoutElementProps } from './types';
import { Cashout } from './components/Cashout/Cashout';

export class CashoutElement extends UIElement<CashoutElementProps> {
    public static type: ExternalComponentType = 'cashout';

    constructor(props: _UIComponentProps<CashoutElementProps>) {
        super(props);
        this.componentToRender = this.componentToRender.bind(this);
        this.customClassNames = 'adyen-pe-cashout-component';
    }

    public componentToRender = () => {
        return <Cashout {...this.props} />;
    };
}

export default CashoutElement;
