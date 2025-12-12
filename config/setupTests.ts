import matchers from '@testing-library/jest-dom/matchers';
import { beforeEach, beforeAll, expect, vi } from 'vitest';
import { cleanup } from '@testing-library/preact';

vi.mock('@adyen/identityrisk-data-collection/devicefingerprint.js', () => ({
    adyenGetData: vi.fn().mockResolvedValue({}),
}));

expect.extend(matchers);

beforeEach(cleanup);

/**
 * This is to mock window.matchMedia used in src/hooks/useMediaQuery.ts
 * only when in a browser-like environment (e.g. jsdom)
 */
beforeAll(() => {
    if (globalThis.window) {
        window.matchMedia = vi.fn().mockImplementation(() => ({
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
        }));
    }
});
