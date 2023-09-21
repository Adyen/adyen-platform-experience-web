import { UIElementProps } from '../../types';

export interface AccountHolderComponentProps extends UIElementProps {
    accountHolderId: string;
    onChange?: (newState: Record<any, any>) => void;
}
