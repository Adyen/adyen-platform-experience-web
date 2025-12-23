export const BASE_CLASS = 'adyen-pe-file-input';
export const DEFAULT_FILE_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'] as const;
export const DEFAULT_MAX_FILE_SIZE = 2097152; // 2MB

export const validationErrors = {
    DISALLOWED_FILE_TYPE: 'disallowed_file_type',
    FILE_REQUIRED: 'file_required',
    TOO_MANY_FILES: 'too_many_files',
    VERY_LARGE_FILE: 'very_large_file',
    MAX_FILE_SIZE: 'max_file_size',
    MAX_DIMENSIONS: 'max_dimensions',
} as const;
