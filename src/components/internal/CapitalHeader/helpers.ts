import { TranslationKey } from '../../../translations';
import { ILegalEntity } from '../../../types';
import { AllowedLocations } from './constants';

const getSubtitleByRegion = (region?: string) => {
    switch (region) {
        case AllowedLocations.EU:
            return 'capital.capitalOfferSubtitleEU';
        default:
            return null;
    }
};

const getSubtitleByCountry = (countryCode?: string) => {
    switch (countryCode) {
        case AllowedLocations.AU:
            return 'capital.capitalOfferSubtitleAUS';
        case AllowedLocations.UK:
            return 'capital.capitalOfferSubtitleUK';
        case AllowedLocations.US:
            return 'capital.capitalOfferSubtitleUS';
        default:
            return null;
    }
};

export const getCapitalOfferSubtitleByLegalEntity = (legalEntity?: ILegalEntity): TranslationKey | null => {
    const region = legalEntity?.region;
    const countryCode = legalEntity?.countryCode;

    return getSubtitleByCountry(countryCode) ?? getSubtitleByRegion(region);
};
