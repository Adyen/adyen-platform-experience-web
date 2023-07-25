import { FieldsetVisibility } from '../../../types/shared';
import { ValidatorRules } from '../../../utils/Validator/types';
import { SchemaKeys } from '../../../utils/useForm/types';
import { SetTriggerValidation } from '../../types';
import { TranslationKey } from '@src/language/types';

export type CompanyDetailsSchema = {
    name?: string;
    registrationNumber?: string;
};

export interface CompanyDetailsProps<FormSchema extends Record<string, any>> {
    label?: TranslationKey;
    namePrefix?: string;
    requiredFields?: SchemaKeys<FormSchema>[];
    visibility?: FieldsetVisibility;
    data: CompanyDetailsSchema;
    onChange: (newState: object) => void;
    readonly?: boolean;
    ref?: any;
    validationRules?: ValidatorRules<FormSchema>;
    setTriggerValidation?: SetTriggerValidation;
}

export interface ReadOnlyCompanyDetailsProps {
    name?: string;
    registrationNumber?: string;
}
