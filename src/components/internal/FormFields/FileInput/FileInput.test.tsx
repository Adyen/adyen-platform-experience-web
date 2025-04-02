/**
 * @vitest-environment jsdom
 */
import { describe, expect, test, vi } from 'vitest';
import { act, render, screen, within } from '@testing-library/preact';
import { userEvent } from '@testing-library/user-event';
import FileInput from './FileInput';

const MOCK_FILE = new File(['image'], 'photo.png', { type: 'image/png' });

describe('FileInput', () => {
    test('should render file input (dropzone) if files are yet to be uploaded', () => {
        render(<FileInput name="upload_file" />);

        const dropzone = screen.getByRole('region');
        const fileInput = within(dropzone).getByTestId('dropzone-input');

        [dropzone, fileInput].forEach(elem => {
            expect(elem).toBeInTheDocument();
            expect(elem).toBeVisible();
        });
    });

    test('should render uploaded file details if file has been uploaded', async () => {
        const user = userEvent.setup();

        render(<FileInput name="upload_file" />);

        const dropzone = screen.getByRole('region');
        const fileInput = within(dropzone).getByTestId('dropzone-input');

        await act(async () => {
            await user.upload(fileInput, MOCK_FILE);
        });

        const fileName = screen.getByText('photo.png');
        const fileSize = screen.getByText(/bytes$/);
        const fileDeleteButton = screen.getByRole('button');

        [fileName, fileSize, fileDeleteButton].forEach(elem => {
            expect(elem).toBeInTheDocument();
            expect(elem).toBeVisible();
        });

        [dropzone, fileInput].forEach(elem => {
            expect(elem).not.toBeInTheDocument();
        });
    });

    test('should render file input (dropzone) again after removing uploaded file', async () => {
        const user = userEvent.setup();

        render(<FileInput name="upload_file" />);

        await act(async () => {
            const dropzone = screen.getByRole('region');
            const fileInput = within(dropzone).getByTestId('dropzone-input');
            await user.upload(fileInput, MOCK_FILE);
        });

        const fileDeleteButton = screen.getByRole('button');

        await act(async () => {
            await user.click(fileDeleteButton);
        });

        const dropzone = screen.getByRole('region');
        const fileInput = within(dropzone).getByTestId('dropzone-input');

        expect(fileDeleteButton).not.toBeInTheDocument();

        [dropzone, fileInput].forEach(elem => {
            expect(elem).toBeInTheDocument();
            expect(elem).toBeVisible();
        });
    });

    test('should trigger onChange callback with the correct files array', async () => {
        const user = userEvent.setup();
        const onChange = vi.fn();

        render(<FileInput name="upload_file" onChange={onChange} />);

        await act(async () => {
            const dropzone = screen.getByRole('region');
            const fileInput = within(dropzone).getByTestId('dropzone-input');
            await user.upload(fileInput, MOCK_FILE);
        });

        expect(onChange).toHaveBeenCalledOnce();
        expect(onChange).toHaveBeenLastCalledWith([MOCK_FILE]);

        await act(async () => {
            await user.click(screen.getByRole('button'));
        });

        expect(onChange).toHaveBeenCalledTimes(2);
        expect(onChange).toHaveBeenLastCalledWith([]);
    });

    test('should only trigger onChange callback when uploaded files have changed', async () => {
        const user = userEvent.setup();
        const onChange = vi.fn();

        const { rerender } = render(<FileInput name="upload_file" onChange={onChange} />);

        expect(onChange).not.toHaveBeenCalled();

        await act(async () => {
            const dropzone = screen.getByRole('region');
            const fileInput = within(dropzone).getByTestId('dropzone-input');
            await user.upload(fileInput, MOCK_FILE);
        });

        expect(onChange).toHaveBeenCalledOnce();
        expect(onChange).toHaveBeenLastCalledWith([MOCK_FILE]);

        const onChange2 = vi.fn();

        rerender(<FileInput name="upload_file" onChange={onChange2} />);

        expect(onChange2).not.toHaveBeenCalled();

        await act(async () => {
            await user.click(screen.getByRole('button'));
        });

        expect(onChange2).toHaveBeenCalledOnce();
        expect(onChange2).toHaveBeenLastCalledWith([]);
    });
});
