import { PropsWithChildren } from 'preact/compat';
import { Dispatch, StateUpdater } from 'preact/hooks';

export interface BaseFileInputProps {
    name?: string;
    id?: string;
    disabled?: boolean;
    required?: boolean;
    maxFileSize?: number;
    allowedFileTypes?: readonly string[];
}

export interface DropzoneProps extends PropsWithChildren<BaseFileInputProps> {
    setFiles: Dispatch<StateUpdater<File[]>>;
}

export interface FileInputProps extends PropsWithChildren<BaseFileInputProps> {
    onChange?: (files: File[]) => void;
}

export interface UploadedFileProps {
    deleteFile: () => any;
    file: File;
}
