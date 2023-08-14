import { UIElementProps } from '../types';
import { AccountHolder } from '../../types/models/api/account-holder';

export interface AccountHolderComponentProps extends UIElementProps {
    accountHolder: AccountHolder;
    onChange?: (newState: Record<any, any>) => void;
}
