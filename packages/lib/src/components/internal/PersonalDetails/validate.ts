import { email, telephoneNumber } from '../../../utils/regex';
import { unformatDate } from '../FormFields/InputDate/utils';
import { ValidatorRules } from '../../../utils/Validator/types';
import { PersonalDetailsSchema } from '../../../types';

const isDateOfBirthValid = (value?: string) => {
    if (!value) return false;
    const rawValue = unformatDate(value);
    if (rawValue) {
        const ageDiff = Date.now() - Date.parse(rawValue);
        const age = new Date(ageDiff).getFullYear() - 1970;
        return age >= 18;
    }
    return false;
};

export const personalDetailsValidationRules: ValidatorRules<PersonalDetailsSchema> = {
    default: {
        validate: value => !!value && value.length > 0,
        modes: ['blur'],
    },
    dateOfBirth: {
        validate: value => isDateOfBirthValid(value),
        errorMessage: 'dateOfBirth.invalid',
        modes: ['blur'],
    },
    telephoneNumber: {
        validate: (value: PersonalDetailsSchema['telephoneNumber']) => !!value && telephoneNumber.test(value),
        modes: ['blur'],
    },
    shopperEmail: {
        validate: (value: PersonalDetailsSchema['shopperEmail']) => !!value && email.test(value),
        modes: ['blur'],
    },
};
