import { PropsWithChildren } from 'preact/compat';
import { TranslationKey } from '../../../../translations';
import { ValueOfRecord } from '../../../../utils/types';
import { validationErrors } from './constants';

export interface BaseFileInputProps {
    name?: string;
    id?: string;
    disabled?: boolean;
    required?: boolean;
    maxFileSize?: number;
    allowedFileTypes?: readonly string[];
    mapError?: (error: ValidationError) => TranslationKey;
}

export interface DropzoneProps extends PropsWithChildren<BaseFileInputProps> {
    uploadFiles: (files: File[]) => void;
}

export interface FileInputProps extends PropsWithChildren<BaseFileInputProps> {
    onChange?: (files: File[]) => void;
}

export interface UploadedFileProps {
    deleteFile: () => void;
    file: File;
}

export type ValidationError = ValueOfRecord<typeof validationErrors>;
