import Language from '../../../language/Language';
import { SetTriggerValidation } from '../../types';
import { StateUpdater } from 'preact/compat';
import { TranslationKey } from '@src/language/types';

export interface PhoneInputComponentProps {
    onChange: (state: Record<string, any>) => void;
    onValid: () => void;
    payButton: (args: { status: string }) => void;
    phoneLabel?: TranslationKey;
    selected: string;
    items: [];
    minLength: number;
    prefixName: string;
    phoneName: string;
    showPayButton: boolean;
    isValid: boolean;
    i18n?: Language;
    data?: {
        phonePrefix: string;
        phoneNumber: string;
    };
    setTriggerValidation?: SetTriggerValidation;
    setUIElementStatus?: (callback: StateUpdater<string>) => void;
}

export interface PhoneInputState {
    data?: {
        phonePrefix: string;
        phoneNumber: string;
    };
    errors?: {
        phoneNumber?: boolean;
        phonePrefix?: boolean;
    };
    isValid?: boolean;
}

export interface PhoneInputSchema {
    phoneNumber?: string;
    phonePrefix?: string;
}
