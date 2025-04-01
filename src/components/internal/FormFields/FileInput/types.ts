import { Dispatch, StateUpdater } from 'preact/hooks';

export interface BaseFileInputProps {
    name: string;
    id?: string;
    label?: string;
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

export interface FileSource {
    files: DataTransfer['files'] | null;
    items?: DataTransfer['items'];
}
