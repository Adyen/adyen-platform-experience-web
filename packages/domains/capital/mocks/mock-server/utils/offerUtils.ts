import { IContractType, IOffer, IOffersResponse } from '@integration-components/types';
import { uuid } from '@integration-components/utils';
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

const calculateOfferForTerm = (contractType: IContractType, amount: number, currency: string, repaymentTermDays: number): IOffer => {
    const repaymentRate = getRepaymentRate(repaymentTermDays);
    const feesAmount = Number(amount) * getDecimalFromBasisPoints(repaymentRate);
    const totalAmount = Number(amount) + feesAmount;

    const repaymentFrequencyDays = 30;
    const numberOfRepayments = Math.floor(repaymentTermDays / repaymentFrequencyDays);
    const minimumRepayment = Number(totalAmount / numberOfRepayments);

    const offer = {
        contractType,
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
    } satisfies IOffer;

    if (CURRENCIES_WITH_APR.includes(currency)) return { ...offer, aprBasisPoints: 2000 };
    return offer;
};

export const calculateOffers = (contractType: IContractType, amount: number, currency: string, maxAmount?: number): IOffersResponse => {
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
        offers: terms.map(term => calculateOfferForTerm(contractType, amount, currency, term)),
    };
};

export const calculateSelectedOffer = (contractType: IContractType, amount: number, currency: string, repaymentTerm: number): IOffer | undefined => {
    const { offers } = calculateOffers(contractType, amount, currency, undefined);
    return offers.find(offer => offer.expectedRepaymentPeriodDays === repaymentTerm) ?? offers[0];
};
