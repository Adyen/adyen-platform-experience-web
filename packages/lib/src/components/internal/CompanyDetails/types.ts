import { FieldsetVisibility } from '../../../types';
import { ValidatorRules } from '../../../utils/Validator/types';
import { SchemaKeys } from '../../../utils/useForm/types';

export type CompanyDetailsSchema = {
    name?: string;
    registrationNumber?: string;
};

export interface CompanyDetailsProps<FormSchema extends Record<string, any>> {
    label?: string;
    namePrefix?: string;
    requiredFields?: SchemaKeys<FormSchema>[];
    visibility?: FieldsetVisibility;
    data: CompanyDetailsSchema;
    onChange: (newState: object) => void;
    readonly?: boolean;
    ref?: any;
    validationRules?: ValidatorRules;
}

export interface ReadOnlyCompanyDetailsProps {
    name?: string;
    registrationNumber?: string;
}
