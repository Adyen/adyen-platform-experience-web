import type { ILineItem, ILineItemRefundStatus, ITransaction, ITransactionRefundStatus } from '../../src';
import { BALANCE_ACCOUNTS } from './balanceAccounts';

const getCreatedAt = (() => {
    let index = 0;

    const maxSize = 130;
    const skewFactor = -4;
    const fromDate = new Date();
    const expBase = Math.exp(skewFactor);
    const timeSpan = fromDate.getTime() - fromDate.setFullYear(fromDate.getFullYear() - 2);

    return () => {
        const normalizedIndex = Math.min(index++, maxSize) / maxSize;
        const expTerm = Math.exp(skewFactor * normalizedIndex);
        const nonLinearProgress = (expTerm - 1) / (expBase - 1);
        return new Date(fromDate.getTime() + nonLinearProgress * timeSpan).toISOString();
    };
})();

const getPspReference = (() => {
    let index = 0;

    return () => {
        const incrementalSuffix = `${index++}`.padStart(3, '0');
        return `PSP3WRM8KK5JT${incrementalSuffix}`;
    };
})();

export const TRANSACTIONS: ITransaction[] = [
    {
        paymentMethod: {
            type: 'paypal',
        },
        id: '8W54BM75W7DYCIVK',
        amountBeforeDeductions: {
            currency: 'EUR',
            value: 4000,
        },
        netAmount: {
            currency: 'EUR',
            value: 4000,
        },
        category: 'Payment',
        balanceAccountId: BALANCE_ACCOUNTS[0].id,
        status: 'Booked',
        createdAt: getCreatedAt(),
        pspReference: getPspReference(),
    },
    {
        paymentMethod: {
            lastFourDigits: '5665',
            type: 'visa',
        },
        id: '4SE184IJ3ZJ2J635',
        amountBeforeDeductions: {
            currency: 'USD',
            value: 3000,
        },
        netAmount: {
            currency: 'USD',
            value: 3000,
        },
        category: 'Payment',
        balanceAccountId: BALANCE_ACCOUNTS[0].id,
        status: 'Booked',
        createdAt: getCreatedAt(),
        pspReference: getPspReference(),
    },
    {
        bankAccount: {
            accountNumberLastFourDigits: '0176',
        },
        id: 'YVBUA4RGV6A14629',
        amountBeforeDeductions: {
            currency: 'USD',
            value: 117500,
        },
        netAmount: {
            currency: 'USD',
            value: 117500,
        },
        category: 'Transfer',
        balanceAccountId: BALANCE_ACCOUNTS[0].id,
        status: 'Booked',
        createdAt: getCreatedAt(),
        pspReference: getPspReference(),
    },
    {
        paymentMethod: {
            lastFourDigits: '4200',
            type: 'mc',
        },
        id: '5A0YPE123NT2B355',
        amountBeforeDeductions: {
            currency: 'USD',
            value: -66350,
        },
        netAmount: {
            currency: 'USD',
            value: -66350,
        },
        category: 'Chargeback',
        balanceAccountId: BALANCE_ACCOUNTS[0].id,
        status: 'Booked',
        createdAt: getCreatedAt(),
        pspReference: getPspReference(),
    },
    {
        paymentMethod: {
            lastFourDigits: '4561',
            type: 'mc',
        },
        id: 'TXS4W8421MG7B0GW',
        amountBeforeDeductions: {
            currency: 'USD',
            value: 350000,
        },
        netAmount: {
            currency: 'USD',
            value: 350000,
        },
        category: 'Capital',
        balanceAccountId: BALANCE_ACCOUNTS[0].id,
        status: 'Booked',
        createdAt: getCreatedAt(),
        pspReference: getPspReference(),
    },
    {
        paymentMethod: {
            lastFourDigits: '6916',
            type: 'mc',
        },
        id: '32ZDT3P8VS886863',
        amountBeforeDeductions: {
            currency: 'EUR',
            value: -1649,
        },
        netAmount: {
            currency: 'EUR',
            value: -1649,
        },
        category: 'Other',
        balanceAccountId: BALANCE_ACCOUNTS[0].id,
        status: 'Booked',
        createdAt: getCreatedAt(),
        pspReference: getPspReference(),
    },
    {
        bankAccount: {
            accountNumberLastFourDigits: '6947',
        },
        id: '8B97841HLQ8ZVHLY',
        amountBeforeDeductions: {
            currency: 'EUR',
            value: 133350,
        },
        netAmount: {
            currency: 'EUR',
            value: 133350,
        },
        category: 'Transfer',
        balanceAccountId: BALANCE_ACCOUNTS[0].id,
        status: 'Booked',
        createdAt: getCreatedAt(),
        pspReference: getPspReference(),
    },
    {
        bankAccount: {
            accountNumberLastFourDigits: '1059',
        },
        id: 'M88PDLTLZ8U24D31',
        amountBeforeDeductions: {
            currency: 'USD',
            value: 20000,
        },
        netAmount: {
            currency: 'USD',
            value: 20000,
        },
        category: 'Payment',
        balanceAccountId: BALANCE_ACCOUNTS[1].id,
        status: 'Booked',
        createdAt: getCreatedAt(),
        pspReference: getPspReference(),
    },
    {
        paymentMethod: {
            lastFourDigits: '8764',
            type: 'mc',
        },
        balanceAccountId: BALANCE_ACCOUNTS[1].id,
        amountBeforeDeductions: {
            currency: 'EUR',
            value: -47950,
        },
        netAmount: {
            currency: 'EUR',
            value: -47950,
        },
        id: '6GU893HK011VLX24',
        category: 'Chargeback',
        status: 'Booked',
        createdAt: getCreatedAt(),
        pspReference: getPspReference(),
    },
    {
        paymentMethod: {
            type: 'paypal',
        },
        id: '6491IMWT9G323GJC',
        amountBeforeDeductions: {
            currency: 'EUR',
            value: 22000,
        },
        netAmount: {
            currency: 'EUR',
            value: 22000,
        },
        category: 'Payment',
        balanceAccountId: BALANCE_ACCOUNTS[0].id,
        status: 'Booked',
        createdAt: getCreatedAt(),
        pspReference: getPspReference(),
    },
    {
        paymentMethod: {
            lastFourDigits: '1996',
            type: 'visa',
        },
        id: 'DC9891Z6MR0R73FP',
        amountBeforeDeductions: {
            currency: 'USD',
            value: -545,
        },
        netAmount: {
            currency: 'USD',
            value: -545,
        },
        category: 'Other',
        balanceAccountId: BALANCE_ACCOUNTS[0].id,
        status: 'Booked',
        createdAt: getCreatedAt(),
        pspReference: getPspReference(),
    },
    {
        paymentMethod: {
            lastFourDigits: '7069',
            type: 'mc',
        },
        balanceAccountId: BALANCE_ACCOUNTS[0].id,
        amountBeforeDeductions: {
            currency: 'EUR',
            value: 7000,
        },
        netAmount: {
            currency: 'EUR',
            value: 7000,
        },
        id: '78GH1B3T4MIS62QM',
        category: 'Payment',
        status: 'Booked',
        createdAt: getCreatedAt(),
        pspReference: getPspReference(),
    },
    {
        bankAccount: {
            accountNumberLastFourDigits: '2174',
        },
        balanceAccountId: BALANCE_ACCOUNTS[0].id,
        amountBeforeDeductions: {
            currency: 'USD',
            value: 185750,
        },
        netAmount: {
            currency: 'USD',
            value: 185750,
        },
        id: '959VR24Z1GEELFVM',
        category: 'Transfer',
        status: 'Booked',
        createdAt: getCreatedAt(),
        pspReference: getPspReference(),
    },
    {
        paymentMethod: {
            lastFourDigits: '0557',
            type: 'visa',
        },
        balanceAccountId: BALANCE_ACCOUNTS[0].id,
        amountBeforeDeductions: {
            currency: 'USD',
            value: 21000,
        },
        netAmount: {
            currency: 'USD',
            value: 21000,
        },
        id: 'G867JX35T6C9D1G9',
        category: 'Payment',
        status: 'Booked',
        createdAt: getCreatedAt(),
        pspReference: getPspReference(),
    },
    {
        paymentMethod: {
            lastFourDigits: '2172',
            type: 'mc',
        },
        balanceAccountId: BALANCE_ACCOUNTS[0].id,
        amountBeforeDeductions: {
            currency: 'USD',
            value: 700000,
        },
        netAmount: {
            currency: 'USD',
            value: 700000,
        },
        id: '6P3H06SG5PZ8RYTE',
        category: 'Capital',
        status: 'Booked',
        createdAt: getCreatedAt(),
        pspReference: getPspReference(),
    },
    {
        paymentMethod: {
            lastFourDigits: '3262',
            type: 'visa',
        },
        balanceAccountId: BALANCE_ACCOUNTS[1].id,
        amountBeforeDeductions: {
            currency: 'USD',
            value: 3000,
        },
        netAmount: {
            currency: 'USD',
            value: 3000,
        },
        id: 'E73R5HBNJWQZ1ENJ',
        category: 'Payment',
        status: 'Booked',
        createdAt: getCreatedAt(),
        pspReference: getPspReference(),
    },
    {
        paymentMethod: {
            type: 'paypal',
        },
        balanceAccountId: BALANCE_ACCOUNTS[0].id,
        amountBeforeDeductions: {
            currency: 'EUR',
            value: 6000,
        },
        netAmount: {
            currency: 'EUR',
            value: 6000,
        },
        id: '3B7TMC3X3F4WVZ39',
        category: 'Payment',
        status: 'Booked',
        createdAt: getCreatedAt(),
        pspReference: getPspReference(),
    },
    {
        paymentMethod: {
            lastFourDigits: '7490',
            type: 'mc',
        },
        balanceAccountId: BALANCE_ACCOUNTS[1].id,
        amountBeforeDeductions: {
            currency: 'USD',
            value: 16000,
        },
        netAmount: {
            currency: 'USD',
            value: 16000,
        },
        id: 'R7D0C2N10B9IR24Y',
        category: 'Payment',
        status: 'Booked',
        createdAt: getCreatedAt(),
        pspReference: getPspReference(),
    },
    {
        bankAccount: {
            accountNumberLastFourDigits: '4023',
        },
        balanceAccountId: BALANCE_ACCOUNTS[1].id,
        amountBeforeDeductions: {
            currency: 'EUR',
            value: 25500,
        },
        netAmount: {
            currency: 'EUR',
            value: 25500,
        },
        id: '968J120W4ID73W15',
        category: 'Transfer',
        status: 'Booked',
        createdAt: getCreatedAt(),
        pspReference: getPspReference(),
    },
    {
        paymentMethod: {
            lastFourDigits: '1384',
            type: 'amex',
        },
        balanceAccountId: BALANCE_ACCOUNTS[1].id,
        amountBeforeDeductions: {
            currency: 'USD',
            value: 9000,
        },
        netAmount: {
            currency: 'USD',
            value: 9000,
        },
        id: '4163W9HG619A0X62',
        category: 'Payment',
        status: 'Booked',
        createdAt: getCreatedAt(),
        pspReference: getPspReference(),
    },
    {
        paymentMethod: {
            lastFourDigits: '4120',
            type: 'visa',
        },
        id: '85KP2S5L0W226QT5',
        amountBeforeDeductions: {
            currency: 'USD',
            value: -1209,
        },
        netAmount: {
            currency: 'USD',
            value: -1209,
        },
        category: 'Other',
        balanceAccountId: BALANCE_ACCOUNTS[0].id,
        status: 'Booked',
        createdAt: getCreatedAt(),
        pspReference: getPspReference(),
    },
    {
        bankAccount: {
            accountNumberLastFourDigits: '6351',
        },
        id: 'D0Y6297KK62029EK',
        amountBeforeDeductions: {
            currency: 'EUR',
            value: 650000,
        },
        netAmount: {
            currency: 'EUR',
            value: 650000,
        },
        category: 'Capital',
        balanceAccountId: BALANCE_ACCOUNTS[0].id,
        status: 'Booked',
        createdAt: getCreatedAt(),
        pspReference: getPspReference(),
    },
    {
        bankAccount: {
            accountNumberLastFourDigits: '2060',
        },
        id: '690HVRH941S87IA4',
        amountBeforeDeductions: {
            currency: 'USD',
            value: 60900,
        },
        netAmount: {
            currency: 'USD',
            value: 60900,
        },
        category: 'Transfer',
        balanceAccountId: BALANCE_ACCOUNTS[1].id,
        status: 'Booked',
        createdAt: getCreatedAt(),
        pspReference: getPspReference(),
    },
    {
        paymentMethod: {
            lastFourDigits: '6509',
            type: 'visa',
        },
        id: '4W7V7PR39L98370N',
        amountBeforeDeductions: {
            currency: 'USD',
            value: 250000,
        },
        netAmount: {
            currency: 'USD',
            value: 250000,
        },
        category: 'Capital',
        balanceAccountId: BALANCE_ACCOUNTS[0].id,
        status: 'Booked',
        createdAt: getCreatedAt(),
        pspReference: getPspReference(),
    },
    {
        paymentMethod: {
            lastFourDigits: '6843',
            type: 'visa',
        },
        id: '25E6VV95UD674Q87',
        amountBeforeDeductions: {
            currency: 'USD',
            value: 0,
        },
        netAmount: {
            currency: 'USD',
            value: 0,
        },
        category: 'Payment',
        balanceAccountId: BALANCE_ACCOUNTS[1].id,
        status: 'Booked',
        createdAt: getCreatedAt(),
        pspReference: getPspReference(),
    },
    {
        paymentMethod: {
            lastFourDigits: '4741',
            type: 'visa',
        },
        id: '553MGH7K68Y7V16P',
        amountBeforeDeductions: {
            currency: 'USD',
            value: -849,
        },
        netAmount: {
            currency: 'USD',
            value: -849,
        },
        category: 'Other',
        balanceAccountId: BALANCE_ACCOUNTS[0].id,
        status: 'Booked',
        createdAt: getCreatedAt(),
        pspReference: getPspReference(),
    },
    {
        bankAccount: {
            accountNumberLastFourDigits: '4317',
        },
        id: '7XBSUV94C471VWE0',
        amountBeforeDeductions: {
            currency: 'USD',
            value: 132400,
        },
        netAmount: {
            currency: 'USD',
            value: 132400,
        },
        category: 'Transfer',
        balanceAccountId: BALANCE_ACCOUNTS[0].id,
        status: 'Booked',
        createdAt: getCreatedAt(),
        pspReference: getPspReference(),
    },
    {
        bankAccount: {
            accountNumberLastFourDigits: '9590',
        },
        id: '44BB58G56000G76Y',
        amountBeforeDeductions: {
            currency: 'USD',
            value: 10000,
        },
        netAmount: {
            currency: 'USD',
            value: 10000,
        },
        category: 'Payment',
        balanceAccountId: BALANCE_ACCOUNTS[0].id,
        status: 'Booked',
        createdAt: getCreatedAt(),
        pspReference: getPspReference(),
    },
    {
        bankAccount: {
            accountNumberLastFourDigits: '8176',
        },
        id: '30R94F75156N2IY4',
        amountBeforeDeductions: {
            currency: 'USD',
            value: 650000,
        },
        netAmount: {
            currency: 'USD',
            value: 650000,
        },
        category: 'Capital',
        balanceAccountId: BALANCE_ACCOUNTS[1].id,
        status: 'Booked',
        createdAt: getCreatedAt(),
        pspReference: getPspReference(),
    },
    {
        bankAccount: {
            accountNumberLastFourDigits: '3610',
        },
        id: '2GT3Z6AFEHXD3546',
        amountBeforeDeductions: {
            currency: 'USD',
            value: 21000,
        },
        netAmount: {
            currency: 'USD',
            value: 21000,
        },
        category: 'Payment',
        balanceAccountId: BALANCE_ACCOUNTS[0].id,
        status: 'Booked',
        createdAt: getCreatedAt(),
        pspReference: getPspReference(),
    },
    {
        paymentMethod: {
            lastFourDigits: '1516',
            type: 'mc',
        },
        id: 'TXB61Z1G0YH93SIG',
        amountBeforeDeductions: {
            currency: 'EUR',
            value: -62700,
        },
        netAmount: {
            currency: 'EUR',
            value: -62700,
        },
        category: 'Chargeback',
        balanceAccountId: BALANCE_ACCOUNTS[0].id,
        status: 'Booked',
        createdAt: getCreatedAt(),
        pspReference: getPspReference(),
    },
    {
        paymentMethod: {
            lastFourDigits: '7986',
            type: 'visa',
        },
        id: '240WT8B31QF5N65W',
        amountBeforeDeductions: {
            currency: 'EUR',
            value: 18000,
        },
        netAmount: {
            currency: 'EUR',
            value: 18000,
        },
        category: 'Payment',
        balanceAccountId: BALANCE_ACCOUNTS[0].id,
        status: 'Booked',
        createdAt: getCreatedAt(),
        pspReference: getPspReference(),
    },
    {
        paymentMethod: {
            lastFourDigits: '6437',
            type: 'visa',
        },
        id: 'YYS56W2D1N4RW3B0',
        amountBeforeDeductions: {
            currency: 'EUR',
            value: 14000,
        },
        netAmount: {
            currency: 'EUR',
            value: 14000,
        },
        category: 'Payment',
        balanceAccountId: BALANCE_ACCOUNTS[1].id,
        status: 'Booked',
        createdAt: getCreatedAt(),
        pspReference: getPspReference(),
    },
    {
        bankAccount: {
            accountNumberLastFourDigits: '7973',
        },
        id: '9N6706110AE41J83',
        amountBeforeDeductions: {
            currency: 'USD',
            value: 98500,
        },
        netAmount: {
            currency: 'USD',
            value: 98500,
        },
        category: 'Transfer',
        balanceAccountId: BALANCE_ACCOUNTS[0].id,
        status: 'Booked',
        createdAt: getCreatedAt(),
        pspReference: getPspReference(),
    },
    {
        bankAccount: {
            accountNumberLastFourDigits: '2376',
        },
        id: '8R7C2Q5M1312C2T2',
        amountBeforeDeductions: {
            currency: 'USD',
            value: 194250,
        },
        netAmount: {
            currency: 'USD',
            value: 194250,
        },
        category: 'Transfer',
        balanceAccountId: BALANCE_ACCOUNTS[0].id,
        status: 'Booked',
        createdAt: getCreatedAt(),
        pspReference: getPspReference(),
    },
    {
        bankAccount: {
            accountNumberLastFourDigits: '6438',
        },
        id: '1LC684XQ4CSZ706J',
        amountBeforeDeductions: {
            currency: 'USD',
            value: 158250,
        },
        netAmount: {
            currency: 'USD',
            value: 158250,
        },
        category: 'Transfer',
        balanceAccountId: BALANCE_ACCOUNTS[1].id,
        status: 'Booked',
        createdAt: getCreatedAt(),
        pspReference: getPspReference(),
    },
    {
        paymentMethod: {
            lastFourDigits: '0083',
            type: 'mc',
        },
        id: '7I77327R6XNLR724',
        amountBeforeDeductions: {
            currency: 'EUR',
            value: -36325,
        },
        netAmount: {
            currency: 'EUR',
            value: -36325,
        },
        category: 'Chargeback',
        balanceAccountId: BALANCE_ACCOUNTS[0].id,
        status: 'Booked',
        createdAt: getCreatedAt(),
        pspReference: getPspReference(),
    },
    {
        bankAccount: {
            accountNumberLastFourDigits: '3723',
        },
        id: 'SMK4WBV3S7Y34YPT',
        amountBeforeDeductions: {
            currency: 'USD',
            value: 176350,
        },
        netAmount: {
            currency: 'USD',
            value: 176350,
        },
        category: 'Transfer',
        balanceAccountId: BALANCE_ACCOUNTS[0].id,
        status: 'Booked',
        createdAt: getCreatedAt(),
        pspReference: getPspReference(),
    },
    {
        paymentMethod: {
            lastFourDigits: '4054',
            type: 'mc',
        },
        id: '65KA4SLZ4PUC82K0',
        amountBeforeDeductions: {
            currency: 'EUR',
            value: -47375,
        },
        netAmount: {
            currency: 'EUR',
            value: -47375,
        },
        category: 'Refund',
        balanceAccountId: BALANCE_ACCOUNTS[0].id,
        status: 'Booked',
        createdAt: getCreatedAt(),
        pspReference: getPspReference(),
    },
    {
        paymentMethod: {
            lastFourDigits: '5995',
            type: 'mc',
        },
        id: 'C3C9U591L10E8II3',
        amountBeforeDeductions: {
            currency: 'USD',
            value: 13550,
        },
        netAmount: {
            currency: 'USD',
            value: 13550,
        },
        category: 'Payment',
        balanceAccountId: BALANCE_ACCOUNTS[0].id,
        status: 'Booked',
        createdAt: getCreatedAt(),
        pspReference: getPspReference(),
    },
    {
        paymentMethod: {
            lastFourDigits: '8212',
            type: 'visa',
        },
        id: 'Q3PW6Y5QZ1I01Z3H',
        amountBeforeDeductions: {
            currency: 'EUR',
            value: 15000,
        },
        netAmount: {
            currency: 'EUR',
            value: 15000,
        },
        category: 'Payment',
        balanceAccountId: BALANCE_ACCOUNTS[0].id,
        status: 'Booked',
        createdAt: getCreatedAt(),
        pspReference: getPspReference(),
    },
    {
        paymentMethod: {
            type: 'paypal',
        },
        id: 'Y6U8NHA2VJY718PQ',
        amountBeforeDeductions: {
            currency: 'USD',
            value: 9000,
        },
        netAmount: {
            currency: 'USD',
            value: 9000,
        },
        category: 'Payment',
        balanceAccountId: BALANCE_ACCOUNTS[0].id,
        status: 'Booked',
        createdAt: getCreatedAt(),
        pspReference: getPspReference(),
    },
    {
        bankAccount: {
            accountNumberLastFourDigits: '6902',
        },
        id: '5P6PZ8LB36P3095K',
        amountBeforeDeductions: {
            currency: 'EUR',
            value: 129200,
        },
        netAmount: {
            currency: 'EUR',
            value: 129200,
        },
        category: 'Transfer',
        balanceAccountId: BALANCE_ACCOUNTS[0].id,
        status: 'Booked',
        createdAt: getCreatedAt(),
        pspReference: getPspReference(),
    },
    {
        paymentMethod: {
            lastFourDigits: '5832',
            type: 'mc',
        },
        id: 'S28LBLG15Y1168E5',
        amountBeforeDeductions: {
            currency: 'USD',
            value: 600000,
        },
        netAmount: {
            currency: 'USD',
            value: 600000,
        },
        category: 'Capital',
        balanceAccountId: BALANCE_ACCOUNTS[0].id,
        status: 'Booked',
        createdAt: getCreatedAt(),
        pspReference: getPspReference(),
    },
    {
        bankAccount: {
            accountNumberLastFourDigits: '2280',
        },
        id: 'W81Z37K8081637B1',
        amountBeforeDeductions: {
            currency: 'USD',
            value: -5875,
        },
        netAmount: {
            currency: 'USD',
            value: -5875,
        },
        category: 'Refund',
        balanceAccountId: BALANCE_ACCOUNTS[0].id,
        status: 'Booked',
        createdAt: getCreatedAt(),
        pspReference: getPspReference(),
    },
    {
        bankAccount: {
            accountNumberLastFourDigits: '2207',
        },
        id: '881QMP961VUGC710',
        amountBeforeDeductions: {
            currency: 'EUR',
            value: 137100,
        },
        netAmount: {
            currency: 'EUR',
            value: 137100,
        },
        category: 'Transfer',
        balanceAccountId: BALANCE_ACCOUNTS[0].id,
        status: 'Booked',
        createdAt: getCreatedAt(),
        pspReference: getPspReference(),
    },
    {
        bankAccount: {
            accountNumberLastFourDigits: '1428',
        },
        id: 'H06HQY56V6K81Q02',
        amountBeforeDeductions: {
            currency: 'USD',
            value: 217400,
        },
        netAmount: {
            currency: 'USD',
            value: 217400,
        },
        category: 'Transfer',
        balanceAccountId: BALANCE_ACCOUNTS[0].id,
        status: 'Booked',
        createdAt: getCreatedAt(),
        pspReference: getPspReference(),
    },
    {
        paymentMethod: {
            lastFourDigits: '8739',
            type: 'visa',
        },
        id: '1P47UV8XIGVK05L3',
        amountBeforeDeductions: {
            currency: 'USD',
            value: -2189,
        },
        netAmount: {
            currency: 'USD',
            value: -2189,
        },
        category: 'Other',
        balanceAccountId: BALANCE_ACCOUNTS[0].id,
        status: 'Booked',
        createdAt: getCreatedAt(),
        pspReference: getPspReference(),
    },
    {
        paymentMethod: {
            lastFourDigits: '0058',
            type: 'visa',
        },
        id: 'ND36Z180S4G1T026',
        amountBeforeDeductions: {
            currency: 'USD',
            value: 550000,
        },
        netAmount: {
            currency: 'USD',
            value: 550000,
        },
        category: 'Capital',
        balanceAccountId: BALANCE_ACCOUNTS[0].id,
        status: 'Booked',
        createdAt: getCreatedAt(),
        pspReference: getPspReference(),
    },
    {
        paymentMethod: {
            type: 'paypal',
        },
        id: '271YMZI6MR54H26B',
        amountBeforeDeductions: {
            currency: 'USD',
            value: 1000,
        },
        netAmount: {
            currency: 'USD',
            value: 1000,
        },
        category: 'Payment',
        balanceAccountId: BALANCE_ACCOUNTS[1].id,
        status: 'Booked',
        createdAt: getCreatedAt(),
        pspReference: getPspReference(),
    },
    {
        paymentMethod: {
            lastFourDigits: '1647',
            type: 'mc',
        },
        id: 'YUZZGK1T1643L307',
        amountBeforeDeductions: {
            currency: 'USD',
            value: 10000,
        },
        netAmount: {
            currency: 'USD',
            value: 10000,
        },
        category: 'Payment',
        balanceAccountId: BALANCE_ACCOUNTS[0].id,
        status: 'Booked',
        createdAt: getCreatedAt(),
        pspReference: getPspReference(),
    },
    {
        paymentMethod: {
            lastFourDigits: '6895',
            type: 'mc',
        },
        id: 'S83Q81D583V95458',
        amountBeforeDeductions: {
            currency: 'EUR',
            value: 9000,
        },
        netAmount: {
            currency: 'EUR',
            value: 9000,
        },
        category: 'Payment',
        balanceAccountId: BALANCE_ACCOUNTS[0].id,
        status: 'Booked',
        createdAt: getCreatedAt(),
        pspReference: getPspReference(),
    },
    {
        bankAccount: {
            accountNumberLastFourDigits: '8786',
        },
        id: 'F6P1M9HH46U4VN28',
        amountBeforeDeductions: {
            currency: 'USD',
            value: 147000,
        },
        netAmount: {
            currency: 'USD',
            value: 147000,
        },
        category: 'Transfer',
        balanceAccountId: BALANCE_ACCOUNTS[0].id,
        status: 'Booked',
        createdAt: getCreatedAt(),
        pspReference: getPspReference(),
    },
    {
        bankAccount: {
            accountNumberLastFourDigits: '6598',
        },
        id: '22LMB13652508I3Z',
        amountBeforeDeductions: {
            currency: 'USD',
            value: 225850,
        },
        netAmount: {
            currency: 'USD',
            value: 225850,
        },
        category: 'Transfer',
        balanceAccountId: BALANCE_ACCOUNTS[1].id,
        status: 'Booked',
        createdAt: getCreatedAt(),
        pspReference: getPspReference(),
    },
    {
        paymentMethod: {
            lastFourDigits: '3897',
            type: 'visa',
        },
        id: 'B6WPQ92INGWI7073',
        amountBeforeDeductions: {
            currency: 'USD',
            value: -1429,
        },
        netAmount: {
            currency: 'USD',
            value: -1429,
        },
        category: 'Other',
        balanceAccountId: BALANCE_ACCOUNTS[1].id,
        status: 'Booked',
        createdAt: getCreatedAt(),
        pspReference: getPspReference(),
    },
    {
        paymentMethod: {
            type: 'paypal',
        },
        id: 'XM7AZ9E2E94K799W',
        amountBeforeDeductions: {
            currency: 'USD',
            value: 24000,
        },
        netAmount: {
            currency: 'USD',
            value: 24000,
        },
        category: 'Payment',
        balanceAccountId: BALANCE_ACCOUNTS[1].id,
        status: 'Booked',
        createdAt: getCreatedAt(),
        pspReference: getPspReference(),
    },
    {
        paymentMethod: {
            type: 'paypal',
        },
        id: '31FN146193QCMV07',
        amountBeforeDeductions: {
            currency: 'USD',
            value: 2000,
        },
        netAmount: {
            currency: 'USD',
            value: 2000,
        },
        category: 'Payment',
        balanceAccountId: BALANCE_ACCOUNTS[0].id,
        status: 'Booked',
        createdAt: getCreatedAt(),
        pspReference: getPspReference(),
    },
    {
        bankAccount: {
            accountNumberLastFourDigits: '1052',
        },
        id: '63F8X25N88RX3X5S',
        amountBeforeDeductions: {
            currency: 'USD',
            value: 59150,
        },
        netAmount: {
            currency: 'USD',
            value: 59150,
        },
        category: 'Transfer',
        balanceAccountId: BALANCE_ACCOUNTS[0].id,
        status: 'Booked',
        createdAt: getCreatedAt(),
        pspReference: getPspReference(),
    },
    {
        bankAccount: {
            accountNumberLastFourDigits: '9988',
        },
        id: 'M4REQLL6547Y44M9',
        amountBeforeDeductions: {
            currency: 'USD',
            value: 108700,
        },
        netAmount: {
            currency: 'USD',
            value: 108700,
        },
        category: 'Transfer',
        balanceAccountId: BALANCE_ACCOUNTS[0].id,
        status: 'Booked',
        createdAt: getCreatedAt(),
        pspReference: getPspReference(),
    },
    {
        bankAccount: {
            accountNumberLastFourDigits: '4658',
        },
        id: '4YA7V8Z821148RQM',
        amountBeforeDeductions: {
            currency: 'EUR',
            value: 850000,
        },
        netAmount: {
            currency: 'EUR',
            value: 850000,
        },
        category: 'Capital',
        balanceAccountId: BALANCE_ACCOUNTS[1].id,
        status: 'Booked',
        createdAt: getCreatedAt(),
        pspReference: getPspReference(),
    },
    {
        paymentMethod: {
            lastFourDigits: '1186',
            type: 'visa',
        },
        id: 'I6ZVN8NDH9ZCL39R',
        amountBeforeDeductions: {
            currency: 'USD',
            value: -1289,
        },
        netAmount: {
            currency: 'USD',
            value: -1289,
        },
        category: 'Other',
        balanceAccountId: BALANCE_ACCOUNTS[0].id,
        status: 'Booked',
        createdAt: getCreatedAt(),
        pspReference: getPspReference(),
    },
    {
        bankAccount: {
            accountNumberLastFourDigits: '6632',
        },
        id: 'K5U6L41ZI4151B21',
        amountBeforeDeductions: {
            currency: 'USD',
            value: 119550,
        },
        netAmount: {
            currency: 'USD',
            value: 119550,
        },
        category: 'Transfer',
        balanceAccountId: BALANCE_ACCOUNTS[1].id,
        status: 'Booked',
        createdAt: getCreatedAt(),
        pspReference: getPspReference(),
    },
    {
        bankAccount: {
            accountNumberLastFourDigits: '2169',
        },
        id: '52L4P70Y674745N9',
        amountBeforeDeductions: {
            currency: 'USD',
            value: 10000,
        },
        netAmount: {
            currency: 'USD',
            value: 10000,
        },
        category: 'Payment',
        balanceAccountId: BALANCE_ACCOUNTS[1].id,
        status: 'Booked',
        createdAt: getCreatedAt(),
        pspReference: getPspReference(),
    },
    {
        bankAccount: {
            accountNumberLastFourDigits: '5683',
        },
        id: '3I559571R96W4YZW',
        amountBeforeDeductions: {
            currency: 'EUR',
            value: 146250,
        },
        netAmount: {
            currency: 'EUR',
            value: 146250,
        },
        category: 'Transfer',
        balanceAccountId: BALANCE_ACCOUNTS[0].id,
        status: 'Booked',
        createdAt: getCreatedAt(),
        pspReference: getPspReference(),
    },
    {
        bankAccount: {
            accountNumberLastFourDigits: '1402',
        },
        id: 'D349H6E79C268S0G',
        amountBeforeDeductions: {
            currency: 'EUR',
            value: 58300,
        },
        netAmount: {
            currency: 'EUR',
            value: 58300,
        },
        category: 'Transfer',
        balanceAccountId: BALANCE_ACCOUNTS[1].id,
        status: 'Booked',
        createdAt: getCreatedAt(),
        pspReference: getPspReference(),
    },
    {
        bankAccount: {
            accountNumberLastFourDigits: '0017',
        },
        id: 'XZUMQX4R4W06G5FP',
        amountBeforeDeductions: {
            currency: 'USD',
            value: -3475,
        },
        netAmount: {
            currency: 'USD',
            value: -3475,
        },
        category: 'Refund',
        balanceAccountId: BALANCE_ACCOUNTS[0].id,
        status: 'Booked',
        createdAt: getCreatedAt(),
        pspReference: getPspReference(),
    },
    {
        paymentMethod: {
            lastFourDigits: '6534',
            type: 'amex',
        },
        id: '6N36X7I8U26XH63K',
        amountBeforeDeductions: {
            currency: 'EUR',
            value: 8000,
        },
        netAmount: {
            currency: 'EUR',
            value: 8000,
        },
        category: 'Payment',
        balanceAccountId: BALANCE_ACCOUNTS[0].id,
        status: 'Booked',
        createdAt: getCreatedAt(),
        pspReference: getPspReference(),
    },
    {
        paymentMethod: {
            lastFourDigits: '6475',
            type: 'mc',
        },
        id: 'J06K883978B1Y781',
        amountBeforeDeductions: {
            currency: 'USD',
            value: -73350,
        },
        netAmount: {
            currency: 'USD',
            value: -73350,
        },
        category: 'Chargeback',
        balanceAccountId: BALANCE_ACCOUNTS[1].id,
        status: 'Booked',
        createdAt: getCreatedAt(),
        pspReference: getPspReference(),
    },
    {
        paymentMethod: {
            type: 'paypal',
        },
        id: '56XE2W3Q62N0P8H5',
        amountBeforeDeductions: {
            currency: 'EUR',
            value: 19000,
        },
        netAmount: {
            currency: 'EUR',
            value: 19000,
        },
        category: 'Payment',
        balanceAccountId: BALANCE_ACCOUNTS[1].id,
        status: 'Booked',
        createdAt: getCreatedAt(),
        pspReference: getPspReference(),
    },
    {
        paymentMethod: {
            lastFourDigits: '8227',
            type: 'visa',
        },
        id: 'VQ69RV2L6CY66SKX',
        amountBeforeDeductions: {
            currency: 'USD',
            value: 24000,
        },
        netAmount: {
            currency: 'USD',
            value: 24000,
        },
        category: 'Payment',
        balanceAccountId: BALANCE_ACCOUNTS[0].id,
        status: 'Booked',
        createdAt: getCreatedAt(),
        pspReference: getPspReference(),
    },
    {
        paymentMethod: {
            lastFourDigits: '3499',
            type: 'amex',
        },
        id: 'Y6T04913ID09DR1P',
        amountBeforeDeductions: {
            currency: 'USD',
            value: 23000,
        },
        netAmount: {
            currency: 'USD',
            value: 23000,
        },
        category: 'Payment',
        balanceAccountId: BALANCE_ACCOUNTS[0].id,
        status: 'Booked',
        createdAt: getCreatedAt(),
        pspReference: getPspReference(),
    },
    {
        paymentMethod: {
            lastFourDigits: '7280',
            type: 'mc',
        },
        id: '74687D7AS73P6B4E',
        amountBeforeDeductions: {
            currency: 'EUR',
            value: -74700,
        },
        netAmount: {
            currency: 'EUR',
            value: -74700,
        },
        category: 'Chargeback',
        balanceAccountId: BALANCE_ACCOUNTS[0].id,
        status: 'Booked',
        createdAt: getCreatedAt(),
        pspReference: getPspReference(),
    },
    {
        paymentMethod: {
            lastFourDigits: '4343',
            type: 'mc',
        },
        id: 'V97KYWMW8WL64842',
        amountBeforeDeductions: {
            currency: 'EUR',
            value: -2095,
        },
        netAmount: {
            currency: 'EUR',
            value: -2095,
        },
        category: 'Other',
        balanceAccountId: BALANCE_ACCOUNTS[1].id,
        status: 'Booked',
        createdAt: getCreatedAt(),
        pspReference: getPspReference(),
    },
    {
        paymentMethod: {
            lastFourDigits: '6888',
            type: 'visa',
        },
        id: '81348R3LCL882826',
        amountBeforeDeductions: {
            currency: 'EUR',
            value: 550000,
        },
        netAmount: {
            currency: 'EUR',
            value: 550000,
        },
        category: 'Capital',
        balanceAccountId: BALANCE_ACCOUNTS[1].id,
        status: 'Booked',
        createdAt: getCreatedAt(),
        pspReference: getPspReference(),
    },
    {
        bankAccount: {
            accountNumberLastFourDigits: '5156',
        },
        id: 'Y300HB4G3985Z2F4',
        amountBeforeDeductions: {
            currency: 'EUR',
            value: 227350,
        },
        netAmount: {
            currency: 'EUR',
            value: 227350,
        },
        category: 'Transfer',
        balanceAccountId: BALANCE_ACCOUNTS[1].id,
        status: 'Booked',
        createdAt: getCreatedAt(),
        pspReference: getPspReference(),
    },
    {
        bankAccount: {
            accountNumberLastFourDigits: '1256',
        },
        id: '9U5ANNDE4N6AZ6RV',
        amountBeforeDeductions: {
            currency: 'USD',
            value: 16000,
        },
        netAmount: {
            currency: 'USD',
            value: 16000,
        },
        category: 'Payment',
        balanceAccountId: BALANCE_ACCOUNTS[0].id,
        status: 'Booked',
        createdAt: getCreatedAt(),
        pspReference: getPspReference(),
    },
    {
        paymentMethod: {
            lastFourDigits: '9800',
            type: 'visa',
        },
        id: 'I1E70AI2P35H1X72',
        amountBeforeDeductions: {
            currency: 'EUR',
            value: 5000,
        },
        netAmount: {
            currency: 'EUR',
            value: 5000,
        },
        category: 'Payment',
        balanceAccountId: BALANCE_ACCOUNTS[0].id,
        status: 'Booked',
        createdAt: getCreatedAt(),
        pspReference: getPspReference(),
    },
    {
        bankAccount: {
            accountNumberLastFourDigits: '7739',
        },
        id: '7C038Y622ZD3KKBD',
        amountBeforeDeductions: {
            currency: 'USD',
            value: 172400,
        },
        netAmount: {
            currency: 'USD',
            value: 172400,
        },
        category: 'Transfer',
        balanceAccountId: BALANCE_ACCOUNTS[0].id,
        status: 'Booked',
        createdAt: getCreatedAt(),
        pspReference: getPspReference(),
    },
    {
        paymentMethod: {
            lastFourDigits: '6120',
            type: 'mc',
        },
        id: '1J95VDQW7TIJ6C85',
        amountBeforeDeductions: {
            currency: 'USD',
            value: 9000,
        },
        netAmount: {
            currency: 'USD',
            value: 9000,
        },
        category: 'Payment',
        balanceAccountId: BALANCE_ACCOUNTS[0].id,
        status: 'Booked',
        createdAt: getCreatedAt(),
        pspReference: getPspReference(),
    },
    {
        paymentMethod: {
            lastFourDigits: '1990',
            type: 'visa',
        },
        id: '71RH41C42BWY5S6K',
        amountBeforeDeductions: {
            currency: 'USD',
            value: -10800,
        },
        netAmount: {
            currency: 'USD',
            value: -10800,
        },
        category: 'Chargeback',
        balanceAccountId: BALANCE_ACCOUNTS[1].id,
        status: 'Booked',
        createdAt: getCreatedAt(),
        pspReference: getPspReference(),
    },
    {
        paymentMethod: {
            lastFourDigits: '3151',
            type: 'visa',
        },
        id: '636G1TVBM55MUI7H',
        amountBeforeDeductions: {
            currency: 'USD',
            value: 12000,
        },
        netAmount: {
            currency: 'USD',
            value: 12000,
        },
        category: 'Payment',
        balanceAccountId: BALANCE_ACCOUNTS[0].id,
        status: 'Booked',
        createdAt: getCreatedAt(),
        pspReference: getPspReference(),
    },
    {
        paymentMethod: {
            lastFourDigits: '0469',
            type: 'mc',
        },
        id: 'S3B3143S20L57HQQ',
        amountBeforeDeductions: {
            currency: 'EUR',
            value: 21000,
        },
        netAmount: {
            currency: 'EUR',
            value: 21000,
        },
        category: 'Payment',
        balanceAccountId: BALANCE_ACCOUNTS[0].id,
        status: 'Booked',
        createdAt: getCreatedAt(),
        pspReference: getPspReference(),
    },
    {
        paymentMethod: {
            lastFourDigits: '2009',
            type: 'visa',
        },
        id: '854620R8386U94F4',
        amountBeforeDeductions: {
            currency: 'USD',
            value: -595,
        },
        netAmount: {
            currency: 'USD',
            value: -595,
        },
        category: 'Other',
        balanceAccountId: BALANCE_ACCOUNTS[0].id,
        status: 'Booked',
        createdAt: getCreatedAt(),
        pspReference: getPspReference(),
    },
    {
        bankAccount: {
            accountNumberLastFourDigits: '9668',
        },
        id: 'F2GTC1N429E666UM',
        amountBeforeDeductions: {
            currency: 'EUR',
            value: 15350,
        },
        netAmount: {
            currency: 'EUR',
            value: 15350,
        },
        category: 'Transfer',
        balanceAccountId: BALANCE_ACCOUNTS[1].id,
        status: 'Booked',
        createdAt: getCreatedAt(),
        pspReference: getPspReference(),
    },
    {
        paymentMethod: {
            lastFourDigits: '8906',
            type: 'mc',
        },
        id: '8SS07TENT793M397',
        amountBeforeDeductions: {
            currency: 'USD',
            value: -65375,
        },
        netAmount: {
            currency: 'USD',
            value: -65375,
        },
        category: 'Chargeback',
        balanceAccountId: BALANCE_ACCOUNTS[0].id,
        status: 'Booked',
        createdAt: getCreatedAt(),
        pspReference: getPspReference(),
    },
    {
        bankAccount: {
            accountNumberLastFourDigits: '2726',
        },
        id: '8D5JZ4H4E89XFPA6',
        amountBeforeDeductions: {
            currency: 'USD',
            value: 20000,
        },
        netAmount: {
            currency: 'USD',
            value: 20000,
        },
        category: 'Payment',
        balanceAccountId: BALANCE_ACCOUNTS[0].id,
        status: 'Booked',
        createdAt: getCreatedAt(),
        pspReference: getPspReference(),
    },
    {
        bankAccount: {
            accountNumberLastFourDigits: '3107',
        },
        id: '5D8D3BCZ5787H8K4',
        amountBeforeDeductions: {
            currency: 'USD',
            value: 18000,
        },
        netAmount: {
            currency: 'USD',
            value: 18000,
        },
        category: 'Payment',
        balanceAccountId: BALANCE_ACCOUNTS[0].id,
        status: 'Booked',
        createdAt: getCreatedAt(),
        pspReference: getPspReference(),
    },
    {
        paymentMethod: {
            lastFourDigits: '5995',
            type: 'mc',
        },
        id: 'E177W00BXTM6V255',
        amountBeforeDeductions: {
            currency: 'USD',
            value: -13550,
        },
        netAmount: {
            currency: 'USD',
            value: -13550,
        },
        category: 'Refund',
        balanceAccountId: BALANCE_ACCOUNTS[0].id,
        status: 'Booked',
        createdAt: getCreatedAt(),
        pspReference: getPspReference(),
    },
    {
        bankAccount: {
            accountNumberLastFourDigits: '0532',
        },
        id: '43C4XEEA37P5E318',
        amountBeforeDeductions: {
            currency: 'USD',
            value: 0,
        },
        netAmount: {
            currency: 'USD',
            value: 0,
        },
        category: 'Payment',
        balanceAccountId: BALANCE_ACCOUNTS[0].id,
        status: 'Booked',
        createdAt: getCreatedAt(),
        pspReference: getPspReference(),
    },
    {
        paymentMethod: {
            lastFourDigits: '4930',
            type: 'visa',
        },
        id: '8S95P7Z4R23GLLBE',
        amountBeforeDeductions: {
            currency: 'USD',
            value: 16000,
        },
        netAmount: {
            currency: 'USD',
            value: 16000,
        },
        category: 'Payment',
        balanceAccountId: BALANCE_ACCOUNTS[0].id,
        status: 'Booked',
        createdAt: getCreatedAt(),
        pspReference: getPspReference(),
    },
    {
        paymentMethod: {
            lastFourDigits: '8809',
            type: 'amex',
        },
        id: '666CRVTJ6T1J8WHS',
        amountBeforeDeductions: {
            currency: 'USD',
            value: 4000,
        },
        netAmount: {
            currency: 'USD',
            value: 4000,
        },
        category: 'Payment',
        balanceAccountId: BALANCE_ACCOUNTS[1].id,
        status: 'Booked',
        createdAt: getCreatedAt(),
        pspReference: getPspReference(),
    },
    {
        bankAccount: {
            accountNumberLastFourDigits: '6411',
        },
        id: '62V5XUW6YIDGZ5P2',
        amountBeforeDeductions: {
            currency: 'EUR',
            value: 0,
        },
        netAmount: {
            currency: 'EUR',
            value: 0,
        },
        category: 'Payment',
        balanceAccountId: BALANCE_ACCOUNTS[0].id,
        status: 'Booked',
        createdAt: getCreatedAt(),
        pspReference: getPspReference(),
    },
    {
        paymentMethod: {
            lastFourDigits: '5443',
            type: 'mc',
        },
        id: '2M5CGU2S60T3M70Z',
        amountBeforeDeductions: {
            currency: 'USD',
            value: -50075,
        },
        netAmount: {
            currency: 'USD',
            value: -50075,
        },
        category: 'Chargeback',
        balanceAccountId: BALANCE_ACCOUNTS[0].id,
        status: 'Booked',
        createdAt: getCreatedAt(),
        pspReference: getPspReference(),
    },
    {
        bankAccount: {
            accountNumberLastFourDigits: '7747',
        },
        id: '9TB87C718QXX71Z4',
        amountBeforeDeductions: {
            currency: 'USD',
            value: -27950,
        },
        netAmount: {
            currency: 'USD',
            value: -27950,
        },
        category: 'Refund',
        balanceAccountId: BALANCE_ACCOUNTS[1].id,
        status: 'Booked',
        createdAt: getCreatedAt(),
        pspReference: getPspReference(),
    },
    {
        paymentMethod: {
            lastFourDigits: '8385',
            type: 'mc',
        },
        id: 'P22WF9KY44PG7L1X',
        amountBeforeDeductions: {
            currency: 'USD',
            value: 11000,
        },
        netAmount: {
            currency: 'USD',
            value: 11000,
        },
        category: 'Payment',
        balanceAccountId: BALANCE_ACCOUNTS[0].id,
        status: 'Booked',
        createdAt: getCreatedAt(),
        pspReference: getPspReference(),
    },
    {
        paymentMethod: {
            lastFourDigits: '4128',
            type: 'mc',
        },
        id: '67K470ZD5NPP4SX7',
        amountBeforeDeductions: {
            currency: 'USD',
            value: 300000,
        },
        netAmount: {
            currency: 'USD',
            value: 300000,
        },
        category: 'Capital',
        balanceAccountId: BALANCE_ACCOUNTS[0].id,
        status: 'Booked',
        createdAt: getCreatedAt(),
        pspReference: getPspReference(),
    },
    {
        bankAccount: {
            accountNumberLastFourDigits: '9964',
        },
        id: 'Y896LT9J720LN800',
        amountBeforeDeductions: {
            currency: 'USD',
            value: 10000,
        },
        netAmount: {
            currency: 'USD',
            value: 10000,
        },
        category: 'Payment',
        balanceAccountId: BALANCE_ACCOUNTS[0].id,
        status: 'Booked',
        createdAt: getCreatedAt(),
        pspReference: getPspReference(),
    },
    {
        paymentMethod: {
            type: 'paypal',
        },
        id: 'N39BHJ2ZHUG3HDK0',
        amountBeforeDeductions: {
            currency: 'USD',
            value: 17000,
        },
        netAmount: {
            currency: 'USD',
            value: 17000,
        },
        category: 'Payment',
        balanceAccountId: BALANCE_ACCOUNTS[0].id,
        status: 'Booked',
        createdAt: getCreatedAt(),
        pspReference: getPspReference(),
    },
    {
        bankAccount: {
            accountNumberLastFourDigits: '5197',
        },
        id: '63JF4G4594081ZL0',
        amountBeforeDeductions: {
            currency: 'USD',
            value: 44900,
        },
        netAmount: {
            currency: 'USD',
            value: 44900,
        },
        category: 'Transfer',
        balanceAccountId: BALANCE_ACCOUNTS[1].id,
        status: 'Booked',
        createdAt: getCreatedAt(),
        pspReference: getPspReference(),
    },
    {
        paymentMethod: {
            lastFourDigits: '5866',
            type: 'visa',
        },
        id: 'AWJE138YH21Y7F47',
        amountBeforeDeductions: {
            currency: 'EUR',
            value: 3000,
        },
        netAmount: {
            currency: 'EUR',
            value: 3000,
        },
        category: 'Payment',
        balanceAccountId: BALANCE_ACCOUNTS[0].id,
        status: 'Booked',
        createdAt: getCreatedAt(),
        pspReference: getPspReference(),
    },
    {
        paymentMethod: {
            lastFourDigits: '5172',
            type: 'mc',
        },
        id: 'E4K2M2D1AS376F18',
        amountBeforeDeductions: {
            currency: 'USD',
            value: -265,
        },
        netAmount: {
            currency: 'USD',
            value: -265,
        },
        category: 'Other',
        balanceAccountId: BALANCE_ACCOUNTS[0].id,
        status: 'Booked',
        createdAt: getCreatedAt(),
        pspReference: getPspReference(),
    },
    {
        bankAccount: {
            accountNumberLastFourDigits: '0172',
        },
        id: 'Y0RMAS0R613M740K',
        amountBeforeDeductions: {
            currency: 'USD',
            value: 47900,
        },
        netAmount: {
            currency: 'USD',
            value: 47900,
        },
        category: 'Transfer',
        balanceAccountId: BALANCE_ACCOUNTS[0].id,
        status: 'Booked',
        createdAt: getCreatedAt(),
        pspReference: getPspReference(),
    },
    {
        bankAccount: {
            accountNumberLastFourDigits: '1682',
        },
        id: '88860H986PH67J9S',
        amountBeforeDeductions: {
            currency: 'EUR',
            value: 94100,
        },
        netAmount: {
            currency: 'EUR',
            value: 94100,
        },
        category: 'Transfer',
        balanceAccountId: BALANCE_ACCOUNTS[0].id,
        status: 'Booked',
        createdAt: getCreatedAt(),
        pspReference: getPspReference(),
    },
    {
        paymentMethod: {
            type: 'paypal',
        },
        id: '5880637SJNR3X91E',
        amountBeforeDeductions: {
            currency: 'USD',
            value: 24000,
        },
        netAmount: {
            currency: 'USD',
            value: 24000,
        },
        category: 'Payment',
        balanceAccountId: BALANCE_ACCOUNTS[0].id,
        status: 'Booked',
        createdAt: getCreatedAt(),
        pspReference: getPspReference(),
    },
    {
        paymentMethod: {
            lastFourDigits: '4907',
            type: 'visa',
        },
        id: '1AZNLR8QC3B55B35',
        amountBeforeDeductions: {
            currency: 'USD',
            value: -139,
        },
        netAmount: {
            currency: 'USD',
            value: -139,
        },
        category: 'Other',
        balanceAccountId: BALANCE_ACCOUNTS[0].id,
        status: 'Booked',
        createdAt: getCreatedAt(),
        pspReference: getPspReference(),
    },
    {
        paymentMethod: {
            lastFourDigits: '6895',
            type: 'amex',
        },
        id: 'N6P9XRPIVHZ3065N',
        amountBeforeDeductions: {
            currency: 'EUR',
            value: 3000,
        },
        netAmount: {
            currency: 'EUR',
            value: 3000,
        },
        category: 'Payment',
        balanceAccountId: BALANCE_ACCOUNTS[1].id,
        status: 'Booked',
        createdAt: getCreatedAt(),
        pspReference: getPspReference(),
    },
    {
        paymentMethod: {
            lastFourDigits: '1441',
            type: 'visa',
        },
        id: 'R190HS56F319349X',
        amountBeforeDeductions: {
            currency: 'USD',
            value: 23000,
        },
        netAmount: {
            currency: 'USD',
            value: 23000,
        },
        category: 'Payment',
        balanceAccountId: BALANCE_ACCOUNTS[0].id,
        status: 'Booked',
        createdAt: getCreatedAt(),
        pspReference: getPspReference(),
    },
    {
        bankAccount: {
            accountNumberLastFourDigits: '9518',
        },
        id: 'P07K462PN8110396',
        amountBeforeDeductions: {
            currency: 'USD',
            value: 57000,
        },
        netAmount: {
            currency: 'USD',
            value: 57000,
        },
        category: 'Transfer',
        balanceAccountId: BALANCE_ACCOUNTS[0].id,
        status: 'Booked',
        createdAt: getCreatedAt(),
        pspReference: getPspReference(),
    },
    {
        paymentMethod: {
            lastFourDigits: '2274',
            type: 'amex',
        },
        id: 'HKZEDJK3D86B68B3',
        amountBeforeDeductions: {
            currency: 'EUR',
            value: 150000,
        },
        netAmount: {
            currency: 'EUR',
            value: 150000,
        },
        category: 'Payment',
        balanceAccountId: BALANCE_ACCOUNTS[0].id,
        status: 'Booked',
        createdAt: getCreatedAt(),
        pspReference: getPspReference(),
    },
    {
        paymentMethod: {
            lastFourDigits: '9952',
            type: 'visa',
        },
        id: '679804580TI615BK',
        amountBeforeDeductions: {
            currency: 'USD',
            value: -1365,
        },
        netAmount: {
            currency: 'USD',
            value: -1365,
        },
        category: 'Other',
        balanceAccountId: BALANCE_ACCOUNTS[0].id,
        status: 'Booked',
        createdAt: getCreatedAt(),
        pspReference: getPspReference(),
    },
    {
        paymentMethod: {
            lastFourDigits: '2326',
            type: 'visa',
        },
        id: '8607Z382A5I805I8',
        amountBeforeDeductions: {
            currency: 'USD',
            value: -2099,
        },
        netAmount: {
            currency: 'USD',
            value: -2099,
        },
        category: 'Other',
        balanceAccountId: BALANCE_ACCOUNTS[0].id,
        status: 'Booked',
        createdAt: getCreatedAt(),
        pspReference: getPspReference(),
    },
    {
        bankAccount: {
            accountNumberLastFourDigits: '3313',
        },
        id: '8247LG526H31261M',
        amountBeforeDeductions: {
            currency: 'USD',
            value: 24000,
        },
        netAmount: {
            currency: 'USD',
            value: 24000,
        },
        category: 'Payment',
        balanceAccountId: BALANCE_ACCOUNTS[1].id,
        status: 'Booked',
        createdAt: getCreatedAt(),
        pspReference: getPspReference(),
    },
    {
        paymentMethod: {
            lastFourDigits: '0705',
            type: 'mc',
        },
        id: '80N53DBSH777617C',
        amountBeforeDeductions: {
            currency: 'USD',
            value: 1000,
        },
        netAmount: {
            currency: 'USD',
            value: 1000,
        },
        category: 'Payment',
        balanceAccountId: BALANCE_ACCOUNTS[0].id,
        status: 'Booked',
        createdAt: getCreatedAt(),
        pspReference: getPspReference(),
    },
    {
        bankAccount: {
            accountNumberLastFourDigits: '5955',
        },
        id: '8V35KU6RYH09692U',
        amountBeforeDeductions: {
            currency: 'EUR',
            value: 9000,
        },
        netAmount: {
            currency: 'EUR',
            value: 9000,
        },
        category: 'Payment',
        balanceAccountId: BALANCE_ACCOUNTS[1].id,
        status: 'Booked',
        createdAt: getCreatedAt(),
        pspReference: getPspReference(),
    },
    {
        paymentMethod: {
            lastFourDigits: '7288',
            type: 'amex',
        },
        id: '33NB50236047669K',
        amountBeforeDeductions: {
            currency: 'EUR',
            value: -50550,
        },
        netAmount: {
            currency: 'EUR',
            value: -50550,
        },
        category: 'Chargeback',
        balanceAccountId: BALANCE_ACCOUNTS[0].id,
        status: 'Booked',
        createdAt: getCreatedAt(),
        pspReference: getPspReference(),
    },
    {
        bankAccount: {
            accountNumberLastFourDigits: '7492',
        },
        id: '9P4GH141S8UJB6W6',
        amountBeforeDeductions: {
            currency: 'USD',
            value: 18000,
        },
        netAmount: {
            currency: 'USD',
            value: 18000,
        },
        category: 'Payment',
        balanceAccountId: BALANCE_ACCOUNTS[0].id,
        status: 'Booked',
        createdAt: getCreatedAt(),
        pspReference: getPspReference(),
    },
    {
        bankAccount: {
            accountNumberLastFourDigits: '5936',
        },
        id: '4V577NYH925V18Y4',
        amountBeforeDeductions: {
            currency: 'USD',
            value: 110950,
        },
        netAmount: {
            currency: 'USD',
            value: 110950,
        },
        category: 'Transfer',
        balanceAccountId: BALANCE_ACCOUNTS[1].id,
        status: 'Booked',
        createdAt: getCreatedAt(),
        pspReference: getPspReference(),
    },
    {
        bankAccount: {
            accountNumberLastFourDigits: '3989',
        },
        id: '744W4W50UC1P5608',
        amountBeforeDeductions: {
            currency: 'EUR',
            value: 227000,
        },
        netAmount: {
            currency: 'EUR',
            value: 227000,
        },
        category: 'Transfer',
        balanceAccountId: BALANCE_ACCOUNTS[0].id,
        status: 'Booked',
        createdAt: getCreatedAt(),
        pspReference: getPspReference(),
    },
    {
        paymentMethod: {
            lastFourDigits: '7794',
            type: 'mc',
        },
        id: '7296S01PDM80A6J2',
        amountBeforeDeductions: {
            currency: 'USD',
            value: -22600,
        },
        netAmount: {
            currency: 'USD',
            value: -22600,
        },
        category: 'Refund',
        balanceAccountId: BALANCE_ACCOUNTS[0].id,
        status: 'Booked',
        createdAt: getCreatedAt(),
        pspReference: getPspReference(),
    },
    {
        bankAccount: {
            accountNumberLastFourDigits: '1994',
        },
        id: 'J268DIH2343N6B2T',
        amountBeforeDeductions: {
            currency: 'USD',
            value: 8000,
        },
        netAmount: {
            currency: 'USD',
            value: 8000,
        },
        category: 'Payment',
        balanceAccountId: BALANCE_ACCOUNTS[0].id,
        status: 'Booked',
        createdAt: getCreatedAt(),
        pspReference: getPspReference(),
    },
    {
        bankAccount: {
            accountNumberLastFourDigits: '6316',
        },
        id: 'SRZ2J8AND6K2W3YF',
        amountBeforeDeductions: {
            currency: 'USD',
            value: -39050,
        },
        netAmount: {
            currency: 'USD',
            value: -39050,
        },
        category: 'Refund',
        balanceAccountId: BALANCE_ACCOUNTS[0].id,
        status: 'Booked',
        createdAt: getCreatedAt(),
        pspReference: getPspReference(),
    },
    {
        bankAccount: {
            accountNumberLastFourDigits: '5665',
        },
        id: '14UEJSP4KAN5Z407',
        amountBeforeDeductions: {
            currency: 'EUR',
            value: 127400,
        },
        netAmount: {
            currency: 'EUR',
            value: 127400,
        },
        category: 'Transfer',
        balanceAccountId: BALANCE_ACCOUNTS[0].id,
        status: 'Booked',
        createdAt: getCreatedAt(),
        pspReference: getPspReference(),
    },
    {
        bankAccount: {
            accountNumberLastFourDigits: '3018',
        },
        id: 'D92L69449PJX0KMT',
        amountBeforeDeductions: {
            currency: 'EUR',
            value: 58700,
        },
        netAmount: {
            currency: 'EUR',
            value: 58700,
        },
        category: 'Transfer',
        balanceAccountId: BALANCE_ACCOUNTS[0].id,
        status: 'Booked',
        createdAt: getCreatedAt(),
        pspReference: getPspReference(),
    },
    {
        bankAccount: {
            accountNumberLastFourDigits: '0990',
        },
        id: '3PKB9SU3920381Q9',
        amountBeforeDeductions: {
            currency: 'EUR',
            value: 202000,
        },
        netAmount: {
            currency: 'EUR',
            value: 202000,
        },
        category: 'Transfer',
        balanceAccountId: BALANCE_ACCOUNTS[0].id,
        status: 'Booked',
        createdAt: getCreatedAt(),
        pspReference: getPspReference(),
    },
    {
        paymentMethod: {
            lastFourDigits: '4080',
            type: 'visa',
        },
        id: 'J21035G974F758U3',
        amountBeforeDeductions: {
            currency: 'USD',
            value: 11000,
        },
        netAmount: {
            currency: 'USD',
            value: 11000,
        },
        category: 'Payment',
        balanceAccountId: BALANCE_ACCOUNTS[1].id,
        status: 'Booked',
        createdAt: getCreatedAt(),
        pspReference: getPspReference(),
    },
    {
        bankAccount: {
            accountNumberLastFourDigits: '7386',
        },
        id: 'M02F0BRD4JP75RXI',
        amountBeforeDeductions: {
            currency: 'USD',
            value: 10000,
        },
        netAmount: {
            currency: 'USD',
            value: 10000,
        },
        category: 'Payment',
        balanceAccountId: BALANCE_ACCOUNTS[1].id,
        status: 'Booked',
        createdAt: getCreatedAt(),
        pspReference: getPspReference(),
    },
    {
        paymentMethod: {
            type: 'paypal',
        },
        id: 'B78I76Y77072H126',
        amountBeforeDeductions: {
            currency: 'USD',
            value: 22000,
        },
        netAmount: {
            currency: 'USD',
            value: 22000,
        },
        category: 'Payment',
        balanceAccountId: BALANCE_ACCOUNTS[1].id,
        status: 'Booked',
        createdAt: getCreatedAt(),
        pspReference: getPspReference(),
    },
    {
        bankAccount: {
            accountNumberLastFourDigits: '6890',
        },
        id: '254X7TAUWB140HW0',
        amountBeforeDeductions: {
            currency: 'USD',
            value: 1400000,
        },
        netAmount: {
            currency: 'USD',
            value: 1400000,
        },
        category: 'Payment',
        balanceAccountId: BALANCE_ACCOUNTS[0].id,
        status: 'Booked',
        createdAt: getCreatedAt(),
        pspReference: getPspReference(),
    },
    {
        paymentMethod: {
            type: 'klarna',
            description: 'Klarna Pay Later',
        },
        id: 'B78I76Y77072H127',
        amountBeforeDeductions: {
            currency: 'USD',
            value: 22000,
        },
        netAmount: {
            currency: 'USD',
            value: 22000,
        },
        category: 'Payment',
        balanceAccountId: BALANCE_ACCOUNTS[0].id,
        status: 'Booked',
        createdAt: getCreatedAt(),
        pspReference: getPspReference(),
    },
];

export const DEFAULT_LINE_ITEM_REFUND_STATUSES: ILineItemRefundStatus = [
    {
        quantity: 1,
        status: 'in_progress',
    },
    {
        quantity: 2,
        status: 'completed',
    },
    {
        quantity: 1,
        status: 'failed',
    },
];

export const DEFAULT_LINE_ITEMS: ILineItem[] = [
    {
        id: '2049f87a-d47b-4f57-80b7-d2a5b3bc1018',
        reference: '2049f87a-d47b-4f57-80b7-d2a5b3bc1018',
        amountIncludingTax: { currency: 'USD', value: 4500 },
        description: 'Boots',
        availableQuantity: 2,
        originalQuantity: 6,
        refundStatuses: DEFAULT_LINE_ITEM_REFUND_STATUSES,
    },
    {
        id: '3aa2de10-3de2-494a-9dc9-6abf77597945',
        reference: '3aa2de10-3de2-494a-9dc9-6abf77597945',
        amountIncludingTax: { currency: 'USD', value: 4500 },
        description: 'Boots',
        availableQuantity: 2,
        originalQuantity: 6,
        refundStatuses: DEFAULT_LINE_ITEM_REFUND_STATUSES,
    },
    {
        id: '620472a7-7eb3-49e6-8ecd-3219e4d614dc',
        reference: '620472a7-7eb3-49e6-8ecd-3219e4d614dc',
        amountIncludingTax: { currency: 'USD', value: 4500 },
        description: 'Boots',
        availableQuantity: 2,
        originalQuantity: 6,
        refundStatuses: DEFAULT_LINE_ITEM_REFUND_STATUSES,
    },
    {
        id: '681839b3-dffb-4909-b569-5e1f0606b143',
        reference: '681839b3-dffb-4909-b569-5e1f0606b143',
        amountIncludingTax: { currency: 'USD', value: 4500 },
        description: 'Boots',
        availableQuantity: 2,
        originalQuantity: 6,
        refundStatuses: DEFAULT_LINE_ITEM_REFUND_STATUSES,
    },
    {
        id: '74e5a2f4-7ca2-4ac0-ae0d-fa7fb4577ba1',
        reference: '74e5a2f4-7ca2-4ac0-ae0d-fa7fb4577ba1',
        amountIncludingTax: { currency: 'USD', value: 4500 },
        description: 'Boots',
        availableQuantity: 2,
        originalQuantity: 6,
        refundStatuses: DEFAULT_LINE_ITEM_REFUND_STATUSES,
    },
    {
        id: '9124281f-d310-4d38-849d-56502eadf98e',
        reference: '9124281f-d310-4d38-849d-56502eadf98e',
        amountIncludingTax: { currency: 'USD', value: 4500 },
        description: 'Boots',
        availableQuantity: 2,
        originalQuantity: 6,
        refundStatuses: DEFAULT_LINE_ITEM_REFUND_STATUSES,
    },
    {
        id: 'af6413df-eaed-4a36-aed3-d05837753e29',
        reference: 'af6413df-eaed-4a36-aed3-d05837753e29',
        amountIncludingTax: { currency: 'USD', value: 4500 },
        description: 'Boots',
        availableQuantity: 2,
        originalQuantity: 6,
        refundStatuses: DEFAULT_LINE_ITEM_REFUND_STATUSES,
    },
    {
        id: 'c946c7ff-adb1-4035-9a13-8f703e154f76',
        reference: 'c946c7ff-adb1-4035-9a13-8f703e154f76',
        amountIncludingTax: { currency: 'USD', value: 4500 },
        description: 'Boots',
        availableQuantity: 2,
        originalQuantity: 6,
        refundStatuses: DEFAULT_LINE_ITEM_REFUND_STATUSES,
    },
    {
        id: 'e24de04e-b514-43e9-a42f-44c99b3dcca0',
        reference: 'e24de04e-b514-43e9-a42f-44c99b3dcca0',
        amountIncludingTax: { currency: 'USD', value: 4500 },
        description: 'Boots',
        availableQuantity: 2,
        originalQuantity: 6,
        refundStatuses: DEFAULT_LINE_ITEM_REFUND_STATUSES,
    },
];

export const DEFAULT_REFUND_STATUSES: ITransactionRefundStatus = [
    {
        amount: { currency: 'USD', value: -500 },
        status: 'in_progress',
    },
    {
        amount: { currency: 'USD', value: -1500 },
        status: 'in_progress',
    },
    {
        amount: { currency: 'USD', value: -500 },
        status: 'completed',
    },
    {
        amount: { currency: 'USD', value: -100 },
        status: 'failed',
    },
    {
        amount: { currency: 'USD', value: -200 },
        status: 'failed',
    },
    {
        amount: { currency: 'USD', value: -200 },
        status: 'failed',
    },
];

export const FAILED_REFUND_STATUSES: ITransactionRefundStatus = [
    {
        amount: { currency: 'USD', value: -117500 },
        status: 'failed',
    },
];

export const IN_PROGRESS_REFUND_STATUSES: ITransactionRefundStatus = [
    {
        amount: { currency: 'USD', value: -1000000 },
        status: 'in_progress',
    },
    {
        amount: { currency: 'USD', value: -400000 },
        status: 'in_progress',
    },
];

export const COMPLETED_REFUND_STATUSES: ITransactionRefundStatus = [
    {
        amount: { currency: 'USD', value: -500 },
        status: 'completed',
    },
    {
        amount: { currency: 'USD', value: -500 },
        status: 'completed',
    },
];

export const DEFAULT_TRANSACTION: ITransaction = {
    id: '1VVF0D5V3709DX6D',
    amountBeforeDeductions: { currency: 'EUR', value: 100000 },
    netAmount: { currency: 'EUR', value: 100000 },
    balanceAccountId: 'BA32272223222B5CTDQPM6W2H',
    status: 'Booked',
    category: 'Other',
    paymentMethod: { lastFourDigits: '1945', type: 'mc' },
    createdAt: '2022-08-29T14:47:03+02:00',
    pspReference: 'PSP3WRM8KK5JT789',
};
