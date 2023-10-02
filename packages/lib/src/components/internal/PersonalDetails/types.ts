import { FieldsetVisibility } from '../../../types/shared';
import { ValidatorRules } from '../../../utils/Validator/types';
import { SetTriggerValidation } from '../../types';
import { TranslationKey } from '@src/core/Localization/types';

export type PersonalDetailsSchema = {
    firstName?: string;
    lastName?: string;
    gender?: string;
    dateOfBirth?: string;
    shopperEmail?: string;
    telephoneNumber?: string;
};

type PersonalDetailsPlaceholders = Omit<PersonalDetailsSchema, 'gender'>;

export interface PersonalDetailsProps<FormSchema extends Record<string, any>> {
    label?: TranslationKey;
    namePrefix?: string;
    requiredFields: Extract<keyof FormSchema, string>[];
    visibility?: FieldsetVisibility;
    data: PersonalDetailsSchema;
    onChange?: (newState: object) => void;
    placeholders?: PersonalDetailsPlaceholders;
    readonly?: boolean;
    ref?: any;
    validationRules?: ValidatorRules<FormSchema>;
    setTriggerValidation?: SetTriggerValidation;
}

export interface PersonalDetailsStateError {
    firstName?: boolean;
    lastName?: boolean;
    gender?: boolean;
    dateOfBirth?: string | boolean;
    shopperEmail?: boolean;
    telephoneNumber?: string | boolean;
}

export interface PersonalDetailsStateValid {
    firstName?: boolean;
    lastName?: boolean;
    gender?: boolean;
    dateOfBirth?: boolean;
    shopperEmail?: boolean;
    telephoneNumber?: boolean;
}

export interface ReadOnlyPersonalDetailsProps {
    firstName?: string;
    lastName?: string;
    shopperEmail?: string;
    telephoneNumber?: string;
}

export interface ValidationResult {
    errorMessage: string;
    isValid: boolean;
}
