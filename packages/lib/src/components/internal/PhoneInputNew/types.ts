import { DataSet, DataSetItem } from '../../../core/Services/data-set';
import { SchemaKeys } from '../../../utils/useForm/types';
import { Ref, StateUpdater } from 'preact/hooks';
import AdyenPlatformExperienceError from '../../../core/Errors/AdyenPlatformExperienceError';

export type PhoneInputSchema = {
    phoneNumber?: string;
    phonePrefix?: string;
};

export interface PhoneInputProps<FormSchema extends Record<string, any>> {
    items: DataSet;
    requiredFields?: SchemaKeys<FormSchema>[];
    data: {
        phonePrefix?: string;
        phoneNumber?: string;
    };
    onChange: (obj: Record<string, any>) => void;
    phoneNumberKey?: string;
    phonePrefixErrorKey?: string;
    phoneNumberErrorKey?: string;
    placeholders?: {
        phoneNumber?: string;
    };
    ref?: Ref<HTMLElement>;
    setTriggerValidation?: (callback: StateUpdater<string>) => void;
}

export interface PhonePrefixes {
    phonePrefixes: DataSetItem[];
    loadingStatus: string;
}

export interface PhonePrefixesProps {
    allowedCountries: string[];
    loadingContext?: string;
    handleError?: (err: AdyenPlatformExperienceError) => void;
}
