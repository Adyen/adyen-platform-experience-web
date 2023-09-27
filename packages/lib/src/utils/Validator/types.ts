import { ValidationRuleResult } from './ValidationRuleResult';
import { ValueOf } from '../types';
import { SchemaKeys } from '../useForm/types';
import { TranslationKey } from '@src/localization/types';

export type ValidatorMode = 'blur' | 'input';

export type ErrorMessageObject = {
    translationKey: TranslationKey;
    translationObject: any;
};

export type Ruleset = {
    [key: string]: any;
};

export type CountryRuleset = {
    [country: string]: Ruleset;
};

type FormatterFn<FormSchema extends Record<string, any>> = (value: any, context?: ValidationContext<FormSchema>) => string;

export interface Format<FormSchema extends Record<string, any> = {}> {
    formatter?: FormatterFn<FormSchema>;
    format?: string;
    maxlength?: number;
}

export type FormatRules<FormSchema extends Record<string, any>> = { [field: string]: Format<FormSchema> };

export type CountryFormatRules<FormSchema extends Record<string, any> = {}> = { [country: string]: FormatRules<FormSchema> };

export type ValidationContext<FormSchema> = { state: { data: Partial<FormSchema> } };

export interface ValidatorRule<FormSchema extends Record<string, any>> {
    validate: (value: ValueOf<FormSchema>, context?: ValidationContext<FormSchema>) => boolean;
    errorMessage?: string | ErrorMessageObject;
    modes: ValidatorMode[];
}

export type ValidatorRules<FormSchema extends Record<string, any>> = { [field: string]: ValidatorRule<FormSchema> | ValidatorRule<FormSchema>[] };

export type CountryBasedValidatorRules<FormSchema extends Record<string, any>> = { [country: string]: ValidatorRules<FormSchema> };

export interface FieldData<FormSchema extends Record<string, any>> {
    key: SchemaKeys<FormSchema>;
    value: ValueOf<FormSchema>;
    mode?: ValidatorMode;
}

export interface FieldContext {
    state: {
        [key: string]: any;
    };
}

export type ValidationRuleResults<FormSchema extends Record<string, any>> = { [key: string]: ValidationRuleResult<FormSchema> };
