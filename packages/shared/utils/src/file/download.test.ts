/**
 * @vitest-environment jsdom
 */
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, MockInstance, test, vi } from 'vitest';
import { downloadBlob } from './download';

describe('downloadBlob', () => {
    const mockUrl = 'blob:mock-url';
    const mockBlob = new Blob(['content'], { type: 'text/plain' });

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
        anchor.addEventListener('click', event => event.preventDefault());
        createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue(anchor);
        clickSpy = vi.spyOn(anchor, 'click');
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
        downloadBlob({ blob: mockBlob, filename });

        expect(clickSpy).toHaveBeenCalled();
        expect(createElementSpy).toHaveBeenCalledWith('a');
        expect(URL.createObjectURL).toHaveBeenCalledWith(mockBlob);

        expect(anchor.href).toBe(mockUrl);
        expect(anchor.download).toBe(filename);
    });

    test('should use a default filename if none is provided', () => {
        downloadBlob({ blob: mockBlob });
        expect(anchor.download).toBe('download');
    });

    test('should revoke the object URL after the click event', () => {
        downloadBlob({ blob: mockBlob });

        expect(URL.revokeObjectURL).not.toHaveBeenCalled();
        vi.advanceTimersByTime(150);
        expect(URL.revokeObjectURL).toHaveBeenCalledWith(mockUrl);
    });
});
