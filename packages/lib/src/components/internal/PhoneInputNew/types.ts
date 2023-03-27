import { DataSet, DataSetItem } from '../../../core/Services/data-set';
import { SchemaKeys } from '../../../utils/useForm/types';

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
    onChange: (obj) => void;
    phoneNumberKey?: string;
    phonePrefixErrorKey?: string;
    phoneNumberErrorKey?: string;
    placeholders?: {
        phoneNumber?: string;
    };
    ref?;
}

export interface PhonePrefixes {
    phonePrefixes: DataSetItem[];
    loadingStatus: string;
}
