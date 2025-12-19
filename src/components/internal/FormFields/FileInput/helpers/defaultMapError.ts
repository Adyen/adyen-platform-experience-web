import { TranslationKey } from '../../../../../translations';
import { validationErrors } from '../constants';
import { ValidationError } from '../types';

export const defaultMapErrors = (error: ValidationError): TranslationKey => {
    switch (error) {
        case validationErrors.DISALLOWED_FILE_TYPE:
            return 'common.inputs.file.errors.disallowedType';
        case validationErrors.FILE_REQUIRED:
            return 'common.inputs.file.errors.required';
        case validationErrors.TOO_MANY_FILES:
            return 'common.inputs.file.errors.tooMany';
        case validationErrors.VERY_LARGE_FILE:
            return 'common.inputs.file.errors.tooLarge';
        case validationErrors.MAX_DIMENSIONS:
            return 'common.inputs.file.errors.maxDimensions';
    }
};

export default defaultMapErrors;
