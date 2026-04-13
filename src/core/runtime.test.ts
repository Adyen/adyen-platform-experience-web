import { describe, expect, it } from 'vitest';
import { getCurrentUrl, getScreenWidth, getUserAgent, shouldWarnAboutServerSideInitialization } from './runtime';

describe('runtime', () => {
    it('should return safe defaults when browser globals are unavailable', () => {
        expect(getUserAgent({})).toBe('');
        expect(getCurrentUrl({})).toBe('');
        expect(getScreenWidth({})).toBeUndefined();
    });

    it('should warn about server-side initialization only in development mode', () => {
        expect(
            shouldWarnAboutServerSideInitialization({
                runtimeWindow: undefined,
                runtimeProcess: { env: { NODE_ENV: 'development' } },
                mode: 'production',
            })
        ).toBe(true);

        expect(
            shouldWarnAboutServerSideInitialization({
                runtimeWindow: undefined,
                runtimeProcess: { env: { NODE_ENV: 'production' } },
                mode: 'production',
            })
        ).toBe(false);

        expect(
            shouldWarnAboutServerSideInitialization({
                runtimeWindow: { document: {} as Document },
                runtimeProcess: { env: { NODE_ENV: 'development' } },
                mode: 'development',
            })
        ).toBe(false);
    });
});
