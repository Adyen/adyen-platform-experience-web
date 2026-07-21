import { TranslationKey } from '@integration-components/core';

export const getCapitalHeaderSubtitleByRegion = (region?: string): TranslationKey | null => {
    switch (region) {
        case 'EU':
            return 'capital.common.loanProviderInfo.EU' satisfies TranslationKey;
        case 'AU':
            return 'capital.common.loanProviderInfo.AU' satisfies TranslationKey;
        case 'GB':
            return 'capital.common.loanProviderInfo.GB' satisfies TranslationKey;
        case 'US':
            return 'capital.common.loanProviderInfo.US' satisfies TranslationKey;
        case 'CA':
            return 'capital.common.loanProviderInfo.CA' satisfies TranslationKey;
        default:
            return null;
    }
};
