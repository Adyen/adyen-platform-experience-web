import { UIElementProps } from '../../types';
import { AccountHolder } from '@src/types';

export interface AccountHolderComponentProps extends UIElementProps {
    accountHolder?: AccountHolder;
    accountHolderId: string;
    onChange?: (newState: Record<any, any>) => void;
}
