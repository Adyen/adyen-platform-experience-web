import { FileSource } from './types';

export const getFilesFromSource = <T extends FileSource>(source?: T | null): File[] => {
    if (source?.items instanceof DataTransferItemList) {
        return [...source.items].reduce((files, item) => {
            if (item.kind === 'file') {
                const file = item.getAsFile();
                if (file) files.push(file);
            }
            return files;
        }, [] as File[]);
    }

    return Array.from(source?.files ?? []);
};
