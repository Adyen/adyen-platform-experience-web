import { TranslationKey } from '../../../translations';
import { ILegalEntity } from '../../../types';
import { supportedCountries, SupportedLocation, supportedRegions } from './constants';

const getCapitalRegion = (legalEntity?: ILegalEntity) => {
    const capitalRegion = legalEntity?.regions?.find(region => region.type === 'capital');
    return capitalRegion?.value ?? '';
};

const getSubtitleByRegion = (region?: string) => {
    switch (region) {
        case SupportedLocation.EU:
            return 'capital.common.loanProviderInfo.EU' satisfies TranslationKey;
        default:
            return null;
    }
};

const getSubtitleByCountry = (countryCode?: string) => {
    switch (countryCode) {
        case SupportedLocation.AU:
            return 'capital.common.loanProviderInfo.AU' satisfies TranslationKey;
        case SupportedLocation.GB:
            return 'capital.common.loanProviderInfo.GB' satisfies TranslationKey;
        case SupportedLocation.US:
            return 'capital.common.loanProviderInfo.US' satisfies TranslationKey;
        case SupportedLocation.CA:
            return 'capital.common.loanProviderInfo.CA' satisfies TranslationKey;
        default:
            return null;
    }
};

export const getCapitalHeaderSubtitleByLegalEntity = (legalEntity?: ILegalEntity): TranslationKey | null => {
    const region = getCapitalRegion(legalEntity);
    const countryCode = legalEntity?.countryCode;

    // Check the country first because it is more specific and first handle the one with a narrow scope
    return getSubtitleByCountry(countryCode) ?? getSubtitleByRegion(region);
};

export const isCapitalRegionSupported = (legalEntity?: ILegalEntity) => {
    const region = getCapitalRegion(legalEntity);
    const countryCode = legalEntity?.countryCode ?? '';

    return supportedCountries.includes(countryCode) || supportedRegions.includes(region);
};
