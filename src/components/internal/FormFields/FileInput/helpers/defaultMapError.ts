import { TranslationKey } from '../../../../../translations';
import { validationErrors } from '../constants';
import { ValidationError } from '../types';

export const defaultMapErrors = (error: ValidationError): TranslationKey => {
    switch (error) {
        case validationErrors.DISALLOWED_FILE_TYPE:
            return 'inputError.disallowedFileType';
        case validationErrors.FILE_REQUIRED:
            return 'inputError.fileRequired';
        case validationErrors.TOO_MANY_FILES:
            return 'inputError.tooManyFiles';
        case validationErrors.VERY_LARGE_FILE:
            return 'inputError.veryLargeFile';
    }
};

export default defaultMapErrors;
