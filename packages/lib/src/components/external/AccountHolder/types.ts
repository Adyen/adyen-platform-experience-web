import { UIElementProps } from '../../types';
import { AccountHolder } from '@src/types';
import { TranslationKey } from '@src/core/Localization/types';

export interface AccountHolderComponentProps extends UIElementProps {
    accountHolder?: AccountHolder;
    accountHolderId: string;
    onChange?: (newState: Record<any, any>) => void;
    title?: TranslationKey;
}
