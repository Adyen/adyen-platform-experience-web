export interface FileSource {
    files: DataTransfer['files'] | null;
    items?: DataTransfer['items'];
}

export interface UploadedFileProps {
    deleteFile: () => any;
    file: File;
}

export interface BaseFileInputProps {
    name: string;
    id?: string;
    label?: string;
    disabled: boolean;
    required: boolean;
    allowedFileTypes: readonly string[];
}

export interface DropzoneProps extends BaseFileInputProps {
    updateFiles: <T extends FileSource>(source?: T | null) => void;
}

export interface FileInputProps extends Partial<BaseFileInputProps> {
    name: string;
    maxSize?: number;
    onChange?: (files: File[]) => void;
}
