import { ValidatorRules, ValidatorRule } from '../../../utils/Validator/types';
import { countrySpecificFormatters } from './validate.formats';
import { ERROR_MSG_INCOMPLETE_FIELD } from '../../../core/Errors/constants';
import { isEmpty } from '../../../utils/validator-utils';
import { AddressData } from './types';
import Specifications from './Specifications';

const createPatternByDigits = (digits: number) => {
    return {
        pattern: new RegExp(`\\d{${digits}}`),
    };
};

const postalCodePatterns: Record<string, { pattern: RegExp }> = {
    AT: createPatternByDigits(4),
    AU: createPatternByDigits(4),
    BE: { pattern: /(?:(?:[1-9])(?:\d{3}))/ },
    BG: createPatternByDigits(4),
    BR: createPatternByDigits(8),
    CA: { pattern: /(?:[ABCEGHJ-NPRSTVXY]\d[A-Z][ -]?\d[A-Z]\d)/ },
    CH: { pattern: /[1-9]\d{3}/ },
    CY: createPatternByDigits(4),
    CZ: { pattern: /\d{3}\s?\d{2}/ },
    DE: createPatternByDigits(5),
    DK: createPatternByDigits(4),
    EE: createPatternByDigits(5),
    ES: { pattern: /(?:0[1-9]|[1-4]\d|5[0-2])\d{3}/ },
    FI: createPatternByDigits(5),
    FR: createPatternByDigits(5),
    GB: { pattern: /^([A-Za-z][A-Ha-hK-Yk-y]?[0-9][A-Za-z0-9]? ?[0-9][A-Za-z]{2}|[Gg][Ii][Rr] ?0[Aa]{2})$/ },
    GE: createPatternByDigits(4),
    GR: { pattern: /^\d{3}\s{0,1}\d{2}$/ },
    HR: { pattern: /^([1-5])[0-9]{4}$/ },
    HU: createPatternByDigits(4),
    IE: { pattern: /(?:^[AC-FHKNPRTV-Y][0-9]{2}|D6W)[ -]?[0-9AC-FHKNPRTV-Y]{4}/ },
    IS: createPatternByDigits(3),
    IT: createPatternByDigits(5),
    LI: createPatternByDigits(4),
    LT: { pattern: /^(LT-\d{5})$/ },
    LU: createPatternByDigits(4),
    LV: { pattern: /^(LV-)[0-9]{4}$/ },
    MC: { pattern: /^980\d{2}$/ },
    MT: { pattern: /^[A-Za-z]{3}\d{4}$/ },
    MY: createPatternByDigits(5),
    NL: { pattern: /(?:NL-)?(?:[1-9]\d{3} ?(?:[A-EGHJ-NPRTVWXZ][A-EGHJ-NPRSTVWXZ]|S[BCEGHJ-NPRTVWXZ]))/ },
    NO: createPatternByDigits(4),
    PL: { pattern: /^\d{2}[-]{0,1}\d{3}$/ },
    PT: { pattern: /^([1-9]\d{3})([- ]?(\d{3})? *)$/ },
    RO: createPatternByDigits(6),
    SI: createPatternByDigits(4),
    SE: createPatternByDigits(5),
    SG: createPatternByDigits(6),
    SK: createPatternByDigits(5),
    US: createPatternByDigits(5),
} as const;

export const getAddressValidationRules = (specifications: Specifications): ValidatorRules<AddressData> => {
    const addressValidationRules: ValidatorRules<AddressData> = {
        postalCode: {
            modes: ['blur'],
            validate: (val: AddressData['postalCode'], context) => {
                const country = context?.state.data.country;

                // Country specific rule
                if (country) {
                    // Dynamically create errorMessage
                    (addressValidationRules.postalCode as ValidatorRule<AddressData>).errorMessage = {
                        translationKey: 'invalidFormatExpects',
                        translationObject: {
                            values: {
                                format: countrySpecificFormatters[country]?.postalCode?.format || null,
                            },
                        },
                    };

                    if (isEmpty(val)) return false;

                    const pattern = postalCodePatterns[country]?.pattern;
                    return pattern ? pattern.test(val) : !!val; // No pattern? Accept any, filled, value.
                }
                // Default rule
                return isEmpty(val) ? false : true;
            },
            errorMessage: ERROR_MSG_INCOMPLETE_FIELD,
        },
        houseNumberOrName: {
            validate: (value, context) => {
                const selectedCountry = context?.state?.data?.country;
                const isOptional = selectedCountry && specifications.countryHasOptionalField?.(selectedCountry, 'houseNumberOrName');
                return isOptional || (isEmpty(value) ? false : true);
            },
            modes: ['blur'],
            errorMessage: ERROR_MSG_INCOMPLETE_FIELD,
        },
        default: {
            validate: value => (isEmpty(value) ? false : true), // true, if there are chars other than spaces
            modes: ['blur'],
            errorMessage: ERROR_MSG_INCOMPLETE_FIELD,
        },
    };
    return addressValidationRules;
};
