import { TranslationKey } from '../../../translations';
import { ILegalEntity } from '../../../types';
import { supportedCountries, SupportedLocation, supportedRegions } from './constants';

const getSubtitleByRegion = (region?: string) => {
    switch (region) {
        case SupportedLocation.EU:
            return 'capital.capitalOfferSubtitleEU';
        default:
            return null;
    }
};

const getSubtitleByCountry = (countryCode?: string) => {
    switch (countryCode) {
        case SupportedLocation.AU:
            return 'capital.capitalOfferSubtitleAU';
        case SupportedLocation.GB:
            return 'capital.capitalOfferSubtitleGB';
        case SupportedLocation.US:
            return 'capital.capitalOfferSubtitleUS';
        default:
            return null;
    }
};

export const getCapitalHeaderSubtitleByLegalEntity = (legalEntity?: ILegalEntity): TranslationKey | null => {
    const capitalRegion = legalEntity?.regions?.find(region => region.type === 'capital');
    const region = capitalRegion?.value ?? '';
    const countryCode = legalEntity?.countryCode;

    // Check the country first because it is more specific and first handle the one with a narrow scope
    return getSubtitleByCountry(countryCode) ?? getSubtitleByRegion(region);
};

export const isCapitalRegionSupported = (legalEntity?: ILegalEntity) => {
    const capitalRegion = legalEntity?.regions?.find(region => region.type === 'capital');
    const region = capitalRegion?.value ?? '';
    const countryCode = legalEntity?.countryCode ?? '';
    return supportedCountries.includes(countryCode) || supportedRegions.includes(region);
};
