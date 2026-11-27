import { describe, expect, it } from 'vitest';
import { CDN_ENVIRONMENTS } from './constants';

describe('CDN_ENVIRONMENTS', () => {
    const releaseLine = `v${process.env.SDK_VERSION?.split('.')[0] || '1'}`;

    it('uses platform-integration-exp CDN hosts and release-line channels', () => {
        expect(CDN_ENVIRONMENTS.test).toBe(`https://cdf6519016.cdn.adyen.com/platform-integration-exp/${releaseLine}-cdn-test`);
        expect(CDN_ENVIRONMENTS.live).toBe(`https://bae81f955b.cdn.adyen.com/platform-integration-exp/${releaseLine}-cdn-live`);
    });
});
