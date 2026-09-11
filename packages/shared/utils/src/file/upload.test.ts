/**
 * @vitest-environment jsdom
 */
import { describe, expect, test } from 'vitest';
import { userEvent } from '@testing-library/user-event';
import { getUploadedFilesFromSource } from './upload';

// prettier-ignore
const FILES = [
    new File(['hello'], 'hello.png', { type: 'image/png' }),
    new File(['photo'], 'photo.png', { type: 'image/png' }),
];

const getInputElementWithFileList = async (files = FILES) => {
    const user = userEvent.setup();
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    await user.upload(input, files);
    return input;
};

const getDataTransferWithFiles = (files = FILES) => {
    // TODO: Replace this stub with a DOM drop event to cover complete DataTransfer semantics.
    return { files } as unknown as DataTransfer;
};

describe('getUploadedFilesFromSource', () => {
    test('should obtain files from file list source', async () => {
        const input = await getInputElementWithFileList(FILES);

        expect(input.files![0]).toBe(FILES[0]);
        expect(input.files![1]).toBe(FILES[1]);
        expect(input.files).not.toMatchObject(FILES);

        expect(getUploadedFilesFromSource(input)).toMatchObject(FILES);
    });

    test('should obtain files from data transfer source', async () => {
        const dataTransfer = await getDataTransferWithFiles(FILES);
        expect(getUploadedFilesFromSource(dataTransfer)).toMatchObject(FILES);
    });

    test('should return array with unique files', async () => {
        const dataTransfer = await getDataTransferWithFiles([...FILES, ...FILES]);
        expect(getUploadedFilesFromSource(dataTransfer)).toMatchObject(FILES);
    });
});
