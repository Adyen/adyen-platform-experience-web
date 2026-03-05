import matchers from '@testing-library/jest-dom/matchers';
import { beforeEach, beforeAll, expect, vi } from 'vitest';
import { cleanup } from '@testing-library/preact';

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

        if (!Element.prototype.scrollIntoView) {
            Element.prototype.scrollIntoView = vi.fn();
        }

        if (!Element.prototype.scrollTo) {
            Element.prototype.scrollTo = vi.fn();
        }

        if (!window.IntersectionObserver) {
            window.IntersectionObserver = vi.fn(function (
                this: IntersectionObserver,
                _callback: IntersectionObserverCallback,
                options?: IntersectionObserverInit
            ) {
                const self = this as unknown as Record<string, unknown>;
                self.root = options?.root ?? null;
                self.rootMargin = options?.rootMargin ?? '';
                self.thresholds = Array.isArray(options?.threshold) ? options.threshold : [options?.threshold ?? 0];
                self.observe = vi.fn();
                self.unobserve = vi.fn();
                self.disconnect = vi.fn();
                self.takeRecords = vi.fn(() => []);
            }) as unknown as typeof IntersectionObserver;
        }
    }
});
