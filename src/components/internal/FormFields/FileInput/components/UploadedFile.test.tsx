/**
 * @vitest-environment jsdom
 */
import { describe, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/preact';
import { userEvent } from '@testing-library/user-event';
import UploadedFile from './UploadedFile';

const MOCK_FILE = new File(['Hello world!!!'], 'hello.txt', { type: 'text/plain' });

describe('UploadedFile', () => {
    test('should render uploaded file details and delete button', () => {
        render(<UploadedFile file={MOCK_FILE} deleteFile={vi.fn()} />);

        const fileName = screen.getByText('hello.txt');
        const fileSize = screen.getByText(/bytes$/);
        const deleteButton = screen.getByRole('button', { name: /hello\.txt/ });

        [fileName, fileSize, deleteButton].forEach(elem => {
            expect(elem).toBeInTheDocument();
            expect(elem).toBeVisible();
        });
    });

    test('should trigger deleteFile callback when delete button is activated', async () => {
        const deleteFile = vi.fn();
        const user = userEvent.setup();

        render(<UploadedFile file={MOCK_FILE} deleteFile={deleteFile} />);
        expect(deleteFile).not.toHaveBeenCalled();

        const deleteButton = screen.getByRole('button', { name: /hello\.txt/ });

        await user.click(deleteButton);
        expect(deleteFile).toHaveBeenCalledOnce();

        await user.click(deleteButton);
        await user.click(deleteButton);
        expect(deleteFile).toHaveBeenCalledTimes(3);
    });
});
