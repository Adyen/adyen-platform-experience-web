export const ERR_READ_ABORTED = 'ERR_READ_ABORTED';
export const ERR_READ_FAILED = 'ERR_READ_FAILED';

export const getAsBase64 = async (file: Blob): Promise<string> => {
    const dataUrl = await getAsDataURL(file);
    return dataUrl.split(';base64,')[1]!;
};

export const getAsDataURL = (file: Blob): Promise<string> => {
    return new Promise<string>((resolve, reject) => {
        const reader = getFileReader(resolve, reject);
        reader.readAsDataURL(file);
    });
};

const getFileReader = <ReadResultType>(
    resolve: (value: ReadResultType | PromiseLike<ReadResultType>) => void,
    reject: (reason?: any) => void
): FileReader => {
    const reader = new FileReader();

    reader.addEventListener('abort', () => reject(new Error(ERR_READ_ABORTED)));
    reader.addEventListener('error', () => reject(new Error(ERR_READ_FAILED)));
    reader.addEventListener('load', () => resolve(reader.result as ReadResultType));

    return reader;
};
