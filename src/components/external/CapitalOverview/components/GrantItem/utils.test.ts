/**
 * @vitest-environment jsdom
 */

import { beforeEach, describe, expect, test, vi } from 'vitest';
import { enhanceTermsAndConditionsUrl } from './utils';

describe('enhanceTermsAndConditionsUrl', () => {
    beforeEach(() => {
        vi.unstubAllGlobals();
    });

    test('should add to the input URL the redirectUrl query parameter with the current url when the redirectUrl does not exist', () => {
        const windowUrl = 'http://localhost:8080?key=value';
        const inputUrl = 'https://balanceplatform-test.adyen.com/balanceplatform';
        const expectedEnhancedUrl = 'https://balanceplatform-test.adyen.com/balanceplatform?redirectUrl=http%3A%2F%2Flocalhost%3A8080%3Fkey%3Dvalue';

        vi.stubGlobal('location', { href: windowUrl });
        expect(enhanceTermsAndConditionsUrl(inputUrl)).toEqual(expectedEnhancedUrl);
    });

    test('should replace in the input URL the redirectUrl query parameter with the current url when the redirectUrl already exists', () => {
        const windowUrl = 'http://localhost:8080?key=value';
        const inputUrl = 'https://balanceplatform-test.adyen.com/balanceplatform?redirectUrl=url';
        const expectedEnhancedUrl = 'https://balanceplatform-test.adyen.com/balanceplatform?redirectUrl=http%3A%2F%2Flocalhost%3A8080%3Fkey%3Dvalue';

        vi.stubGlobal('location', { href: windowUrl });
        expect(enhanceTermsAndConditionsUrl(inputUrl)).toEqual(expectedEnhancedUrl);
    });

    test('should return undefined if the input URL is not valid', () => {
        const inputUrl = 'invalid url';
        expect(enhanceTermsAndConditionsUrl(inputUrl)).toBeUndefined();
    });
});
