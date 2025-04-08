export const BASE_CLASS = 'adyen-pe-file-input';
export const DEFAULT_FILE_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'] as const;
export const DEFAULT_MAX_FILE_SIZE = 2097152; // 2MB

export const validationErrors = {
    MISSING_FILE: 'missing_file',
    TOO_MANY_FILES: 'too_many_files',
    UNEXPECTED_FILE: 'unexpected_file',
    VERY_LARGE_FILE: 'very_large_file',
};
