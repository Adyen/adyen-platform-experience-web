export const API_ENVIRONMENTS = {
    test: 'https://platform-components-external-test.adyen.com/platform-components-external/api/',
    live: 'https://platform-components-external-live.adyen.com/platform-components-external/api/',
} as const;

export const CDN_ENVIRONMENTS = {
    test: 'https://18e8543875.cdn.adyen.com/platform-components/v1-cdn-test',
    live: 'https://bae81f955b.cdn.adyen.com/platform-components/v1-cdn-live',
} as const;
