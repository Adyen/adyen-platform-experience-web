/**
 * @vitest-environment jsdom
 */
import { renderHook, waitFor } from '@testing-library/preact';
import * as CorePreact from '@integration-components/core/preact';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import localSupportedRegions from '../../../../domain/src/config/supportedRegions.json';
import { useSupportedRegions } from './useSupportedRegions';

vi.mock('@integration-components/core/preact');

describe('useSupportedRegions', () => {
    const mockUseCoreContext = vi.mocked(CorePreact.useCoreContext);

    beforeEach(() => {
        vi.clearAllMocks();
    });

    test('uses bundled regions initially and replaces them with the CDN config', async () => {
        const getCdnConfig = vi.fn().mockResolvedValue(['NL']);
        mockUseCoreContext.mockReturnValue({
            getCdnConfig,
        } as unknown as ReturnType<typeof CorePreact.useCoreContext>);

        const { result } = renderHook(() => useSupportedRegions());

        expect(result.current).toEqual(localSupportedRegions);
        await waitFor(() => expect(result.current).toEqual(['NL']));
        expect(getCdnConfig).toHaveBeenCalledWith({
            subFolder: 'capital',
            name: 'supportedRegions',
            fallback: localSupportedRegions,
        });
    });
});
