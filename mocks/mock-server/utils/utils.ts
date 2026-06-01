import { IGrantOfferResponseDTO, IGrantOffersResponseDTO } from '../../../src';
import uuid from '../../../src/utils/random/uuid';
import { REPAYMENT_TERMS, REPAYMENT_TERM_FULL, REPAYMENT_TERM_HALF, REPAYMENT_TERM_QUARTER } from '../../mock-data';

const CURRENCIES_WITH_APR = ['CAD'];
const SHORT_REPAYMENT_TERM_LIMIT = 0.67;
const LONG_REPAYMENT_TERM_LIMIT = 0.33;

const getRepaymentRate = (term: number) => {
    switch (term) {
        case REPAYMENT_TERM_QUARTER:
            return 800;
        case REPAYMENT_TERM_HALF:
            return 1100;
        case REPAYMENT_TERM_FULL:
        default:
            return 1500;
    }
};

const getDecimalFromBasisPoints = (bps: number) => {
    return bps / 10000;
};

const calculateOfferForTerm = (amount: number, currency: string, repaymentTermDays: number): IGrantOfferResponseDTO => {
    const repaymentRate = getRepaymentRate(repaymentTermDays);
    const feesAmount = Number(amount) * getDecimalFromBasisPoints(repaymentRate);
    const totalAmount = Number(amount) + feesAmount;

    const repaymentFrequencyDays = 30;
    const numberOfRepayments = Math.floor(repaymentTermDays / repaymentFrequencyDays);
    const minimumRepayment = Number(totalAmount / numberOfRepayments);

    const offer = {
        grantAmount: {
            value: Number(amount),
            currency: currency,
        },
        feesAmount: {
            value: feesAmount,
            currency: currency,
        },
        totalAmount: {
            value: totalAmount,
            currency: currency,
        },
        thresholdAmount: {
            value: minimumRepayment,
            currency: currency,
        },
        repaymentRate,
        expectedRepaymentPeriodDays: repaymentTermDays,
        maximumRepaymentPeriodDays: repaymentTermDays + REPAYMENT_TERM_QUARTER,
        id: uuid(),
    } satisfies IGrantOfferResponseDTO;

    if (CURRENCIES_WITH_APR.includes(currency)) return { ...offer, aprBasisPoints: 2000 };
    return offer;
};

export const calculateOffers = (amount: number, currency: string, maxAmount?: number): IGrantOffersResponseDTO => {
    const terms = REPAYMENT_TERMS.filter(term => {
        return (
            !maxAmount ||
            !(
                (term === REPAYMENT_TERM_QUARTER && amount > maxAmount * SHORT_REPAYMENT_TERM_LIMIT) ||
                (term === REPAYMENT_TERM_FULL && amount < maxAmount * LONG_REPAYMENT_TERM_LIMIT)
            )
        );
    });

    return {
        offers: terms.map(term => calculateOfferForTerm(amount, currency, term)),
    };
};

export const calculateSelectedOffer = (amount: number, currency: string, repaymentTerm: number): IGrantOfferResponseDTO | undefined => {
    const { offers } = calculateOffers(amount, currency);
    return offers.find(offer => offer.expectedRepaymentPeriodDays === repaymentTerm) ?? offers[0];
};
