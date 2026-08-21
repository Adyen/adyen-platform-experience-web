import type { ICreateGrantOfferRequest, IGrantOfferResponseDTO } from '@integration-components/types';
import { DEFAULT_TERM } from '../../constants';

export const getOffersByTerm = (offers: readonly IGrantOfferResponseDTO[]) => {
    return Object.fromEntries(offers.map(offer => [offer.expectedRepaymentPeriodDays, offer]));
};

export const getAvailableTerms = (offersByTerm: Record<number, IGrantOfferResponseDTO>) => {
    return Object.keys(offersByTerm).map(Number);
};

export const getDefaultTerm = (availableTerms: readonly number[]): number | undefined => {
    if (!availableTerms.length) return undefined;
    return availableTerms.includes(DEFAULT_TERM) ? DEFAULT_TERM : availableTerms[0];
};

export const adjustSelectedTerm = (availableTerms: readonly number[], selectedTerm: number): number | undefined => {
    if (!availableTerms.length) return undefined;
    return availableTerms.reduce((nearest, term) => (Math.abs(term - selectedTerm) < Math.abs(nearest - selectedTerm) ? term : nearest));
};

export const getOfferForTerm = (offersByTerm: Record<number, IGrantOfferResponseDTO>, term: number) => {
    return term === undefined ? undefined : offersByTerm[term];
};

export const getCreateGrantOfferBody = (offer: IGrantOfferResponseDTO): ICreateGrantOfferRequest => {
    return {
        amount: offer.grantAmount.value,
        currency: offer.grantAmount.currency,
        selectedEstimatedRepaymentTermDays: offer.expectedRepaymentPeriodDays,
    };
};
