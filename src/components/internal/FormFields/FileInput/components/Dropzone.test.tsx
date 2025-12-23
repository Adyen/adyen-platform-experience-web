/**
 * @vitest-environment jsdom
 */
import { describe, expect, test, vi } from 'vitest';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/preact';
import { userEvent } from '@testing-library/user-event';
import { validationErrors } from '../constants';
import Dropzone from './Dropzone';

// prettier-ignore
const FILES = [
    new File(['hello'], 'hello.png', { type: 'image/png' }),
    new File(['photo'], 'photo.png', { type: 'image/png' }),
];

const DISALLOWED_FILE = new File(['Hello world!!!'], 'hello.txt', { type: 'text/plain' });

describe('Dropzone', () => {
    // Rendering tests
    test('should render correctly', () => {
        const { rerender } = render(<Dropzone uploadFiles={vi.fn()} />);

        const dropzone = screen.getByRole('region');
        const fileInput: HTMLInputElement = within(dropzone).getByTestId('dropzone-input');
        const labelElement = within(dropzone)
            .getByText(/Browse files/)
            .closest('label')!;

        [dropzone, fileInput, labelElement].forEach(elem => {
            expect(elem).toBeInTheDocument();
            expect(elem).toBeVisible();
        });

        expect(fileInput.name).toBe('');

        rerender(<Dropzone name="upload_file" uploadFiles={vi.fn()} />);

        expect(fileInput.name).toBe('upload_file');
    });

    test('should render label element with correct child content when provided', () => {
        render(
            <Dropzone uploadFiles={vi.fn()}>
                <span>Choose document</span>
            </Dropzone>
        );

        const dropzone = screen.getByRole('region');
        const childElement = within(dropzone).getByText(/Choose document/);
        const labelElement = childElement.closest('label')!;

        [childElement, labelElement].forEach(elem => {
            expect(elem).toBeInTheDocument();
            expect(elem).toBeVisible();
        });

        expect(childElement.nodeName).toBe('SPAN');
        expect(childElement.textContent).toBe('Choose document');
    });

    test('should render file input element with id when provided', () => {
        render(<Dropzone id="input-id" uploadFiles={vi.fn()} />);

        const dropzone = screen.getByRole('region');
        const fileInput: HTMLInputElement = within(dropzone).getByTestId('dropzone-input');

        expect(fileInput.id).toBe('input-id');
    });

    test('should render file input element with unique id if not provided', () => {
        const { rerender } = render(<Dropzone uploadFiles={vi.fn()} />);

        const dropzone = screen.getByRole('region');
        const fileInput: HTMLInputElement = within(dropzone).getByTestId('dropzone-input');
        const previousInputId = fileInput.id;

        expect(fileInput.id).toBeTypeOf('string');
        expect(fileInput.id).not.toBe('');

        rerender(<Dropzone uploadFiles={vi.fn()} />);

        expect(fileInput.id).toBe(previousInputId);
    });

    test('should render correct missing file error message if required', async () => {
        const user = userEvent.setup();

        render(<Dropzone uploadFiles={vi.fn()} required />);

        const dropzone = screen.getByRole('region');
        const fileInput: HTMLInputElement = within(dropzone).getByTestId('dropzone-input');

        await act(() => {
            fileInput.focus();
            fileInput.blur();
        });

        const inputError = screen.getByText(validationErrors.FILE_REQUIRED);

        expect(inputError).toBeInTheDocument();
        expect(inputError).toBeVisible();
    });

    // File upload tests
    test('should upload one file at a time', async () => {
        const user = userEvent.setup();
        const uploadFilesMock = vi.fn();

        render(<Dropzone uploadFiles={uploadFilesMock} />);

        const dropzone = screen.getByRole('region');
        const fileInput: HTMLInputElement = within(dropzone).getByTestId('dropzone-input');

        for (let i = 1; i <= 3; i++) {
            const file = FILES[i % FILES.length]!;

            await user.upload(fileInput, file);

            expect(fileInput.files).toHaveLength(1);
            expect(uploadFilesMock).toHaveBeenCalledTimes(i);
            expect(uploadFilesMock).toHaveBeenLastCalledWith([file]);
        }
    });

    test('should not upload multiple files at a time', async () => {
        const user = userEvent.setup();
        const uploadFilesMock = vi.fn();

        render(<Dropzone uploadFiles={uploadFilesMock} />);

        const dropzone = screen.getByRole('region');
        const fileInput: HTMLInputElement = within(dropzone).getByTestId('dropzone-input');

        await user.upload(fileInput, FILES);

        expect(fileInput.files).not.toHaveLength(FILES.length);
        expect(fileInput.files).toHaveLength(1);

        expect(uploadFilesMock).not.toHaveBeenLastCalledWith(FILES);
        expect(uploadFilesMock).toHaveBeenLastCalledWith([FILES[0]]);
    });

    test('should not upload file of disallowed type', async () => {
        const user = userEvent.setup();
        const uploadFilesMock = vi.fn();

        render(<Dropzone uploadFiles={uploadFilesMock} />);

        const dropzone = screen.getByRole('region');
        const fileInput: HTMLInputElement = within(dropzone).getByTestId('dropzone-input');

        await user.upload(fileInput, DISALLOWED_FILE);

        expect(fileInput.files).toHaveLength(0);
        expect(uploadFilesMock).not.toHaveBeenCalled();
    });

    test('should not upload file larger than the maximum file size', async () => {
        const user = userEvent.setup();
        const uploadFilesMock = vi.fn();
        const maxFileSize = 1;

        render(<Dropzone uploadFiles={uploadFilesMock} maxFileSize={maxFileSize} />);

        const dropzone = screen.getByRole('region');
        const fileInput: HTMLInputElement = within(dropzone).getByTestId('dropzone-input');
        const file = FILES[0]!;

        await user.upload(fileInput, file);

        expect(file.size).toBeGreaterThan(maxFileSize);
        expect(uploadFilesMock).not.toHaveBeenCalled();

        const inputError = await screen.findByText(validationErrors.VERY_LARGE_FILE);

        await waitFor(() => expect(inputError).toBeInTheDocument());
        await waitFor(() => expect(inputError).toBeVisible());
    });

    test('should not upload file if disabled', async () => {
        const user = userEvent.setup();
        const uploadFilesMock = vi.fn();

        render(<Dropzone uploadFiles={uploadFilesMock} disabled />);

        const dropzone = screen.getByRole('region');
        const fileInput: HTMLInputElement = within(dropzone).getByTestId('dropzone-input');

        await user.upload(fileInput, FILES[0]!);

        expect(fileInput.files).toHaveLength(0);
        expect(uploadFilesMock).not.toHaveBeenCalled();
    });

    // File drop tests
    test('should drop one file at a time', async () => {
        const uploadFilesMock = vi.fn();

        render(<Dropzone uploadFiles={uploadFilesMock} />);

        const dropzone = await screen.findByRole('region');

        for (let i = 1; i <= 3; i++) {
            const file = FILES[i % FILES.length]!;

            await act(() => {
                fireEvent.drop(dropzone, {
                    dataTransfer: { files: [file] },
                });
            });

            await waitFor(() => expect(uploadFilesMock).toHaveBeenCalledTimes(i));
            await waitFor(() => expect(uploadFilesMock).toHaveBeenLastCalledWith([file]));
        }
    });

    test('should not drop multiple files at a time', async () => {
        const uploadFilesMock = vi.fn();

        render(<Dropzone uploadFiles={uploadFilesMock} />);

        const dropzone = screen.getByRole('region');

        await act(() => {
            fireEvent.drop(dropzone, {
                dataTransfer: { files: FILES },
            });
        });

        expect(uploadFilesMock).not.toHaveBeenCalled();

        const inputError = screen.getByText(validationErrors.TOO_MANY_FILES);

        expect(inputError).toBeInTheDocument();
        expect(inputError).toBeVisible();
    });

    test('should not drop file of disallowed type', async () => {
        const uploadFilesMock = vi.fn();

        render(<Dropzone uploadFiles={uploadFilesMock} />);

        const dropzone = screen.getByRole('region');

        await act(() => {
            fireEvent.drop(dropzone, {
                dataTransfer: { files: [DISALLOWED_FILE] },
            });
        });

        expect(uploadFilesMock).not.toHaveBeenCalled();

        const inputError = await screen.findByText(validationErrors.DISALLOWED_FILE_TYPE);

        await waitFor(() => expect(inputError).toBeInTheDocument());
        await waitFor(() => expect(inputError).toBeVisible());
    });

    test('should not drop file larger than the maximum file size', async () => {
        const uploadFilesMock = vi.fn();
        const maxFileSize = 1;

        render(<Dropzone uploadFiles={uploadFilesMock} maxFileSize={maxFileSize} />);

        const dropzone = screen.getByRole('region');
        const file = FILES[0]!;

        await act(() => {
            fireEvent.drop(dropzone, {
                dataTransfer: { files: [file] },
            });
        });

        expect(uploadFilesMock).not.toHaveBeenCalled();

        const inputError = await screen.findByText(validationErrors.VERY_LARGE_FILE);

        await waitFor(() => expect(inputError).toBeInTheDocument());
        await waitFor(() => expect(inputError).toBeVisible());
    });

    test('should not drop file if disabled', async () => {
        const uploadFilesMock = vi.fn();

        render(<Dropzone uploadFiles={uploadFilesMock} disabled />);

        const dropzone = screen.getByRole('region');
        const file = FILES[0];

        await act(() => {
            fireEvent.drop(dropzone, {
                dataTransfer: { files: [file] },
            });
        });

        expect(uploadFilesMock).not.toHaveBeenCalled();
    });
});
