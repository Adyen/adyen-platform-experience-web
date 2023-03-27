import { ValidatorRules, ValidatorRule, FieldData, ValidationContext } from './types';
import { ValidationRuleResult } from './ValidationRuleResult';

class ValidationResult<FormSchema extends Record<string, any>> {
    private validationResults: ValidationRuleResult<FormSchema>[];

    constructor(results: ValidationRuleResult<FormSchema>[]) {
        this.validationResults = results;
    }

    /** Checks if all validation rules have passed */
    get isValid(): boolean {
        return this.validationResults.reduce((acc, result) => acc && result.isValid, true);
    }

    /** Checks if any validation rule returned an error */
    hasError(isValidatingForm = false): boolean {
        return Boolean(this.getError(isValidatingForm));
    }

    /** Returns the first validation result that returned an error */
    getError(isValidatingForm = false) {
        return this.validationResults.find(result => result.hasError(isValidatingForm));
    }

    /** Returns all validation results that returned an error */
    getAllErrors() {
        return this.validationResults.filter(result => result.hasError());
    }
}

class Validator<FormSchema extends Record<string, any>> {
    public rules: ValidatorRules<FormSchema> & { default: ValidatorRule<FormSchema> } = {
        default: {
            validate: () => true,
            modes: ['blur', 'input'],
        },
    };

    constructor(rules: ValidatorRules<FormSchema>) {
        this.setRules(rules);
    }

    setRules(newRules: ValidatorRules<FormSchema>) {
        this.rules = {
            ...this.rules,
            ...newRules,
        };
    }

    /**
     * Get all validation rules for a field
     */
    private getRulesFor(field: string): ValidatorRule<FormSchema>[] {
        let fieldRules: ValidatorRule<FormSchema> | ValidatorRule<FormSchema>[] = this.rules[field] ?? this.rules['default'];

        if (!Array.isArray(fieldRules)) {
            fieldRules = [fieldRules];
        }

        return fieldRules;
    }

    /**
     * Validates a field
     */

    validate({ key, value, mode = 'blur' }: FieldData<FormSchema>, context?: ValidationContext<FormSchema>) {
        const fieldRules = this.getRulesFor(key);
        const validationRulesResult = fieldRules.map(rule => new ValidationRuleResult(rule, value, mode, context));

        return new ValidationResult(validationRulesResult);
    }
}

export default Validator;
