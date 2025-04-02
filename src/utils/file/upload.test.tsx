/**
 * @vitest-environment jsdom
 */
import { describe, expect, test } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/preact';
import { userEvent } from '@testing-library/user-event';
import { getUploadedFilesFromSource } from './upload';

// prettier-ignore
const FILES = [
    new File(['hello'], 'hello.png', { type: 'image/png' }),
    new File(['photo'], 'photo.png', { type: 'image/png' }),
];

const getInputElementWithFileList = async (files = FILES) => {
    const user = userEvent.setup();
    render(
        <div>
            <label htmlFor="file-uploader">Upload file:</label>
            <input id="file-uploader" type="file" multiple />
        </div>
    );

    const input: HTMLInputElement = screen.getByLabelText(/upload file/i);
    await user.upload(input, files);
    return input;
};

const getDataTransferWithFiles = (files = FILES) => {
    return new Promise<DataTransfer>(resolve => {
        const preventDefaultAction = (evt: DragEvent) => {
            evt.stopPropagation();
            evt.preventDefault();
        };

        const Dropzone = () => (
            <div
                onDragOver={preventDefaultAction}
                onDrop={(evt: DragEvent) => {
                    preventDefaultAction(evt);
                    resolve(evt.dataTransfer!);
                }}
            >
                Drag files here
            </div>
        );

        render(<Dropzone />);

        const dropzone = screen.getByText(/drag files/i);

        void act(() => {
            fireEvent.drop(dropzone, {
                dataTransfer: { files },
            });
        });
    });
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
});
