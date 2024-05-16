import { ErrorMessageObject, ValidationContext, ValidatorMode, ValidatorRule } from './types';
import { isNullish } from '../../primitives/utils';
import { ValueOf } from '../types';

/**
 * Holds the result of a validation
 */
export class ValidationRuleResult<FormSchema extends Record<string, any>> {
    private readonly shouldValidate: boolean;
    public isValid: boolean;
    public errorMessage: string | ErrorMessageObject;

    constructor(rule: ValidatorRule<FormSchema>, value: ValueOf<FormSchema>, mode?: ValidatorMode, context?: ValidationContext<FormSchema>) {
        this.shouldValidate = mode ? rule.modes.includes(mode) : false;
        this.isValid = rule.validate(value, context);
        this.errorMessage = rule.errorMessage ?? '';
    }

    /**
     * Whether the validation is considered an error.
     * A field is only considered to be an error if the validation rule applies to the current mode i.e. 'blur' or 'input'.
     * Also, if a validation function returns a null value e.g. when the field is empty, then the field will not be considered to be in error
     * unless the whole form is being validated
     */
    hasError(isValidatingForm = false): boolean {
        return isValidatingForm ? !this.isValid && this.shouldValidate : !isNullish(this.isValid) && !this.isValid && this.shouldValidate;
    }
}
