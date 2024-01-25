import UIElement from '../UIElement';
import AccountHolderDetails from './components/AccountHolderDetails';
import { AccountHolderComponentProps } from './types';
import { _UIComponentProps } from '../../types';

export class AccountHolderElement extends UIElement<AccountHolderComponentProps> {
    public static type = 'accountHolder';

    constructor(props: _UIComponentProps<AccountHolderComponentProps>) {
        super(props);
        this.elementRef = (props && props.elementRef) || this;
        this.componentToRender = this.componentToRender.bind(this);
    }

    componentToRender = () => {
        return <AccountHolderDetails {...this.props} onChange={this.props.onChange ?? this.setState} />;
    };
}

export default AccountHolderElement;
