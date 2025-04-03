import { Dispatch, StateUpdater } from 'preact/hooks';
import { TranslationKey } from '../../../../translations';

export interface BaseFileInputProps {
    name: string;
    id?: string;
    label?: TranslationKey;
    disabled?: boolean;
    required?: boolean;
    maxFileSize?: number;
    allowedFileTypes?: readonly string[];
}

export interface DropzoneProps extends BaseFileInputProps {
    setFiles: Dispatch<StateUpdater<File[]>>;
}

export interface FileInputProps extends BaseFileInputProps {
    onChange?: (files: File[]) => void;
}

export interface UploadedFileProps {
    deleteFile: () => any;
    file: File;
}
