import { IGrantOfferResponseDTO } from '../../../src';
import uuid from '../../../src/utils/random/uuid';

const CURRENCIES_WITH_APR = ['CAD'];

export const calculateGrant = (amount: number | string, currency: string) => {
    const feesAmount = Math.round(Number(amount) * 0.11 * 100) / 100;
    const totalAmount = Number(amount) + feesAmount;

    const repaymentFrequencyDays = 30;
    const numberOfRepayments = Math.floor(180 / repaymentFrequencyDays);
    const minimumRepayment = Number(totalAmount / numberOfRepayments);

    const response = {
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
        repaymentRate: 1100,
        expectedRepaymentPeriodDays: 180,
        maximumRepaymentPeriodDays: 540,
        id: uuid(),
    } satisfies IGrantOfferResponseDTO;

    if (CURRENCIES_WITH_APR.includes(currency)) return { ...response, aprBasisPoints: 2000 };
    return response;
};
