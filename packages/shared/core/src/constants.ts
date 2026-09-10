export const API_ENVIRONMENTS = {
    test: 'https://platform-components-external-test.adyen.com/platform-components-external/api/',
    live: 'https://platform-components-external-live.adyen.com/platform-components-external/api/',
} as const;

const CDN_RELEASE_LINE = `v${process.env.SDK_VERSION?.split('.')[0] || '1'}`;

export const CDN_ENVIRONMENTS = {
    test: `https://18e8543875.cdn.adyen.com/platform-components/${CDN_RELEASE_LINE}-cdn-test`,
    live: `https://bae81f955b.cdn.adyen.com/platform-components/${CDN_RELEASE_LINE}-cdn-live`,
} as const;
