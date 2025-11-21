/**
 * @vitest-environment jsdom
 */
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, MockInstance, test, vi } from 'vitest';
import { render, fireEvent, screen } from '@testing-library/preact';
import { EndpointDownloadStreamData } from '../../types/api/endpoints';
import { downloadBlob } from './download';

describe('downloadBlob', () => {
    const mockUrl = 'blob:mock-url';
    const mockBlob = new Blob(['content'], { type: 'text/plain' });

    const DownloadComponent = (data: EndpointDownloadStreamData) => <button onClick={() => downloadBlob(data)}>Download</button>;

    let anchor: HTMLAnchorElement;
    let createElementSpy: MockInstance;
    let clickSpy: MockInstance;

    beforeAll(() => {
        vi.stubGlobal('URL', {
            createObjectURL: vi.fn().mockReturnValue(mockUrl),
            revokeObjectURL: vi.fn(),
        });
    });

    afterAll(() => {
        vi.restoreAllMocks();
        vi.unstubAllGlobals();
    });

    beforeEach(() => {
        vi.useFakeTimers();

        anchor = document.createElement('a');
        createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue(anchor);
        clickSpy = vi.spyOn(anchor, 'click').mockImplementation(() => {});
    });

    afterEach(() => {
        vi.useRealTimers();

        clickSpy.mockRestore();
        createElementSpy.mockRestore();

        vi.mocked(URL.createObjectURL).mockClear();
        vi.mocked(URL.revokeObjectURL).mockClear();
    });

    test('should create an anchor element, set attributes, and trigger a download', async () => {
        const filename = 'test.txt';
        render(<DownloadComponent blob={mockBlob} filename={filename} />);
        fireEvent.click(screen.getByText('Download'));

        expect(clickSpy).toHaveBeenCalled();
        expect(createElementSpy).toHaveBeenCalledWith('a');
        expect(URL.createObjectURL).toHaveBeenCalledWith(mockBlob);

        expect(anchor.href).toBe(mockUrl);
        expect(anchor.download).toBe(filename);
    });

    test('should use a default filename if none is provided', () => {
        render(<DownloadComponent blob={mockBlob} />);
        fireEvent.click(screen.getByText('Download'));
        expect(anchor.download).toBe('download');
    });

    test('should revoke the object URL after the click event', () => {
        render(<DownloadComponent blob={mockBlob} />);
        fireEvent.click(screen.getByText('Download'));

        expect(URL.revokeObjectURL).not.toHaveBeenCalled();
        vi.advanceTimersByTime(150);
        expect(URL.revokeObjectURL).toHaveBeenCalledWith(mockUrl);
    });
});
