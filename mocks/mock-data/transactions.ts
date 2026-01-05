import type { ILineItem, ILineItemRefundStatus, ITransaction, ITransactionRefundStatus } from '../../src';

export const TRANSACTIONS: ITransaction[] = [
    {
        paymentMethod: {
            type: 'paypal',
        },
        id: '8W54BM75W7DYCIVK',
        amount: {
            currency: 'EUR',
            value: 4000,
        },
        category: 'Payment',
        balanceAccountId: 'BA32272223222B5CTDQPM6W2H',
        status: 'Booked',
        createdAt: '2026-01-01T12:10:02.831Z',
    },
    {
        paymentMethod: {
            lastFourDigits: '5665',
            type: 'visa',
        },
        id: '4SE184IJ3ZJ2J635',
        amount: {
            currency: 'USD',
            value: 3000,
        },
        category: 'Payment',
        balanceAccountId: 'BA32272223222B5CTDQPM6W2H',
        status: 'Booked',
        createdAt: '2024-01-02T06:04:13.802Z',
    },
    {
        bankAccount: {
            accountNumberLastFourDigits: '0176',
        },
        id: 'YVBUA4RGV6A14629',
        amount: {
            currency: 'USD',
            value: 117500,
        },
        category: 'Transfer',
        balanceAccountId: 'BA32272223222B5CTDQPM6W2H',
        status: 'Booked',
        createdAt: '2024-01-03T08:14:36.616Z',
    },
    {
        paymentMethod: {
            lastFourDigits: '4200',
            type: 'mc',
        },
        id: '5A0YPE123NT2B355',
        amount: {
            currency: 'USD',
            value: -66350,
        },
        category: 'Chargeback',
        balanceAccountId: 'BA32272223222B5CTDQPM6W2H',
        status: 'Booked',
        createdAt: '2024-01-07T15:05:02.855Z',
    },
    {
        paymentMethod: {
            lastFourDigits: '4561',
            type: 'mc',
        },
        id: 'TXS4W8421MG7B0GW',
        amount: {
            currency: 'USD',
            value: 350000,
        },
        category: 'Capital',
        balanceAccountId: 'BA32272223222B5CTDQPM6W2H',
        status: 'Booked',
        createdAt: '2024-01-08T23:43:49.183Z',
    },
    {
        paymentMethod: {
            lastFourDigits: '6916',
            type: 'mc',
        },
        id: '32ZDT3P8VS886863',
        amount: {
            currency: 'EUR',
            value: -1649,
        },
        category: 'Fee',
        balanceAccountId: 'BA32272223222B5CTDQPM6W2H',
        status: 'Booked',
        createdAt: '2024-01-09T15:53:26.957Z',
    },
    {
        bankAccount: {
            accountNumberLastFourDigits: '6947',
        },
        id: '8B97841HLQ8ZVHLY',
        amount: {
            currency: 'EUR',
            value: 133350,
        },
        category: 'Transfer',
        balanceAccountId: 'BA32272223222B5CTDQPM6W2H',
        status: 'Booked',
        createdAt: '2024-01-09T22:16:00.288Z',
    },
    {
        bankAccount: {
            accountNumberLastFourDigits: '1059',
        },
        id: 'M88PDLTLZ8U24D31',
        amount: {
            currency: 'USD',
            value: 20000,
        },
        category: 'Payment',
        balanceAccountId: 'BA32272223222B5CTDQPM6W2G',
        status: 'Booked',
        createdAt: '2024-01-11T07:25:05.548Z',
    },
    {
        paymentMethod: {
            lastFourDigits: '8764',
            type: 'mc',
        },
        id: '6GU893HK011VLX24',
        amount: {
            currency: 'EUR',
            value: -47950,
        },
        category: 'Chargeback',
        balanceAccountId: 'BA32272223222B5CTDQPM6W2G',
        status: 'Booked',
        createdAt: '2024-01-11T07:33:54.867Z',
    },
    {
        paymentMethod: {
            type: 'paypal',
        },
        id: '6491IMWT9G323GJC',
        amount: {
            currency: 'EUR',
            value: 22000,
        },
        category: 'Payment',
        balanceAccountId: 'BA32272223222B5CTDQPM6W2H',
        status: 'Booked',
        createdAt: '2024-01-11T10:14:57.633Z',
    },
    {
        paymentMethod: {
            lastFourDigits: '1996',
            type: 'visa',
        },
        id: 'DC9891Z6MR0R73FP',
        amount: {
            currency: 'USD',
            value: -545,
        },
        category: 'Fee',
        balanceAccountId: 'BA32272223222B5CTDQPM6W2H',
        status: 'Booked',
        createdAt: '2024-01-13T04:24:45.682Z',
    },
    {
        paymentMethod: {
            lastFourDigits: '7069',
            type: 'mc',
        },
        id: '78GH1B3T4MIS62QM',
        amount: {
            currency: 'EUR',
            value: 7000,
        },
        category: 'Payment',
        balanceAccountId: 'BA32272223222B5CTDQPM6W2H',
        status: 'Booked',
        createdAt: '2024-01-24T22:13:32.725Z',
    },
    {
        bankAccount: {
            accountNumberLastFourDigits: '2174',
        },
        id: '959VR24Z1GEELFVM',
        amount: {
            currency: 'USD',
            value: 185750,
        },
        category: 'Transfer',
        balanceAccountId: 'BA32272223222B5CTDQPM6W2H',
        status: 'Booked',
        createdAt: '2024-01-25T00:22:54.272Z',
    },
    {
        paymentMethod: {
            lastFourDigits: '0557',
            type: 'visa',
        },
        id: 'G867JX35T6C9D1G9',
        amount: {
            currency: 'USD',
            value: 21000,
        },
        category: 'Payment',
        balanceAccountId: 'BA32272223222B5CTDQPM6W2H',
        status: 'Booked',
        createdAt: '2024-01-27T07:24:39.295Z',
    },
    {
        paymentMethod: {
            lastFourDigits: '2172',
            type: 'mc',
        },
        id: '6P3H06SG5PZ8RYTE',
        amount: {
            currency: 'USD',
            value: 700000,
        },
        category: 'Capital',
        balanceAccountId: 'BA32272223222B5CTDQPM6W2H',
        status: 'Booked',
        createdAt: '2024-01-29T13:03:11.358Z',
    },
    {
        paymentMethod: {
            lastFourDigits: '3262',
            type: 'visa',
        },
        id: 'E73R5HBNJWQZ1ENJ',
        amount: {
            currency: 'USD',
            value: 3000,
        },
        category: 'Payment',
        balanceAccountId: 'BA32272223222B5CTDQPM6W2G',
        status: 'Booked',
        createdAt: '2024-01-30T02:11:49.863Z',
    },
    {
        paymentMethod: {
            type: 'paypal',
        },
        id: '3B7TMC3X3F4WVZ39',
        amount: {
            currency: 'EUR',
            value: 6000,
        },
        category: 'Payment',
        balanceAccountId: 'BA32272223222B5CTDQPM6W2H',
        status: 'Booked',
        createdAt: '2024-02-05T21:21:10.777Z',
    },
    {
        paymentMethod: {
            lastFourDigits: '7490',
            type: 'mc',
        },
        id: 'R7D0C2N10B9IR24Y',
        amount: {
            currency: 'USD',
            value: 16000,
        },
        category: 'Payment',
        balanceAccountId: 'BA32272223222B5CTDQPM6W2G',
        status: 'Booked',
        createdAt: '2024-02-05T21:51:59.281Z',
    },
    {
        bankAccount: {
            accountNumberLastFourDigits: '4023',
        },
        id: '968J120W4ID73W15',
        amount: {
            currency: 'EUR',
            value: 25500,
        },
        category: 'Transfer',
        balanceAccountId: 'BA32272223222B5CTDQPM6W2G',
        status: 'Booked',
        createdAt: '2024-02-07T08:07:45.336Z',
    },
    {
        paymentMethod: {
            lastFourDigits: '1384',
            type: 'amex',
        },
        id: '4163W9HG619A0X62',
        amount: {
            currency: 'USD',
            value: 9000,
        },
        category: 'Payment',
        balanceAccountId: 'BA32272223222B5CTDQPM6W2G',
        status: 'Booked',
        createdAt: '2024-02-08T07:29:47.626Z',
    },
    {
        paymentMethod: {
            lastFourDigits: '4120',
            type: 'visa',
        },
        id: '85KP2S5L0W226QT5',
        amount: {
            currency: 'USD',
            value: -1209,
        },
        category: 'Fee',
        balanceAccountId: 'BA32272223222B5CTDQPM6W2H',
        status: 'Booked',
        createdAt: '2024-02-08T10:09:55.028Z',
    },
    {
        bankAccount: {
            accountNumberLastFourDigits: '6351',
        },
        id: 'D0Y6297KK62029EK',
        amount: {
            currency: 'EUR',
            value: 650000,
        },
        category: 'Capital',
        balanceAccountId: 'BA32272223222B5CTDQPM6W2H',
        status: 'Booked',
        createdAt: '2024-02-09T18:09:19.346Z',
    },
    {
        bankAccount: {
            accountNumberLastFourDigits: '2060',
        },
        id: '690HVRH941S87IA4',
        amount: {
            currency: 'USD',
            value: 60900,
        },
        category: 'Transfer',
        balanceAccountId: 'BA32272223222B5CTDQPM6W2G',
        status: 'Booked',
        createdAt: '2024-02-09T22:34:28.530Z',
    },
    {
        paymentMethod: {
            lastFourDigits: '6509',
            type: 'visa',
        },
        id: '4W7V7PR39L98370N',
        amount: {
            currency: 'USD',
            value: 250000,
        },
        category: 'Capital',
        balanceAccountId: 'BA32272223222B5CTDQPM6W2H',
        status: 'Booked',
        createdAt: '2024-02-11T05:18:37.938Z',
    },
    {
        paymentMethod: {
            lastFourDigits: '6843',
            type: 'visa',
        },
        id: '25E6VV95UD674Q87',
        amount: {
            currency: 'USD',
            value: 0,
        },
        category: 'Payment',
        balanceAccountId: 'BA32272223222B5CTDQPM6W2G',
        status: 'Booked',
        createdAt: '2024-02-11T20:41:00.478Z',
    },
    {
        paymentMethod: {
            lastFourDigits: '4741',
            type: 'visa',
        },
        id: '553MGH7K68Y7V16P',
        amount: {
            currency: 'USD',
            value: -849,
        },
        category: 'Fee',
        balanceAccountId: 'BA32272223222B5CTDQPM6W2H',
        status: 'Booked',
        createdAt: '2024-02-12T15:53:36.458Z',
    },
    {
        bankAccount: {
            accountNumberLastFourDigits: '4317',
        },
        id: '7XBSUV94C471VWE0',
        amount: {
            currency: 'USD',
            value: 132400,
        },
        category: 'Transfer',
        balanceAccountId: 'BA32272223222B5CTDQPM6W2H',
        status: 'Booked',
        createdAt: '2024-02-12T18:04:17.708Z',
    },
    {
        bankAccount: {
            accountNumberLastFourDigits: '9590',
        },
        id: '44BB58G56000G76Y',
        amount: {
            currency: 'USD',
            value: 10000,
        },
        category: 'Payment',
        balanceAccountId: 'BA32272223222B5CTDQPM6W2H',
        status: 'Booked',
        createdAt: '2024-02-13T04:04:55.100Z',
    },
    {
        bankAccount: {
            accountNumberLastFourDigits: '8176',
        },
        id: '30R94F75156N2IY4',
        amount: {
            currency: 'USD',
            value: 650000,
        },
        category: 'Capital',
        balanceAccountId: 'BA32272223222B5CTDQPM6W2G',
        status: 'Booked',
        createdAt: '2024-02-14T07:17:53.666Z',
    },
    {
        bankAccount: {
            accountNumberLastFourDigits: '3610',
        },
        id: '2GT3Z6AFEHXD3546',
        amount: {
            currency: 'USD',
            value: 21000,
        },
        category: 'Payment',
        balanceAccountId: 'BA32272223222B5CTDQPM6W2H',
        status: 'Booked',
        createdAt: '2024-02-17T11:15:44.803Z',
    },
    {
        paymentMethod: {
            lastFourDigits: '1516',
            type: 'mc',
        },
        id: 'TXB61Z1G0YH93SIG',
        amount: {
            currency: 'EUR',
            value: -62700,
        },
        category: 'Chargeback',
        balanceAccountId: 'BA32272223222B5CTDQPM6W2H',
        status: 'Booked',
        createdAt: '2024-02-17T15:24:27.132Z',
    },
    {
        paymentMethod: {
            lastFourDigits: '7986',
            type: 'visa',
        },
        id: '240WT8B31QF5N65W',
        amount: {
            currency: 'EUR',
            value: 18000,
        },
        category: 'Payment',
        balanceAccountId: 'BA32272223222B5CTDQPM6W2H',
        status: 'Booked',
        createdAt: '2024-02-19T15:05:56.315Z',
    },
    {
        paymentMethod: {
            lastFourDigits: '6437',
            type: 'visa',
        },
        id: 'YYS56W2D1N4RW3B0',
        amount: {
            currency: 'EUR',
            value: 14000,
        },
        category: 'Payment',
        balanceAccountId: 'BA32272223222B5CTDQPM6W2G',
        status: 'Booked',
        createdAt: '2024-02-20T14:22:36.626Z',
    },
    {
        bankAccount: {
            accountNumberLastFourDigits: '7973',
        },
        id: '9N6706110AE41J83',
        amount: {
            currency: 'USD',
            value: 98500,
        },
        category: 'Transfer',
        balanceAccountId: 'BA32272223222B5CTDQPM6W2H',
        status: 'Booked',
        createdAt: '2024-02-20T15:44:03.984Z',
    },
    {
        bankAccount: {
            accountNumberLastFourDigits: '2376',
        },
        id: '8R7C2Q5M1312C2T2',
        amount: {
            currency: 'USD',
            value: 194250,
        },
        category: 'Transfer',
        balanceAccountId: 'BA32272223222B5CTDQPM6W2H',
        status: 'Booked',
        createdAt: '2024-02-20T22:17:58.778Z',
    },
    {
        bankAccount: {
            accountNumberLastFourDigits: '6438',
        },
        id: '1LC684XQ4CSZ706J',
        amount: {
            currency: 'USD',
            value: 158250,
        },
        category: 'Transfer',
        balanceAccountId: 'BA32272223222B5CTDQPM6W2G',
        status: 'Booked',
        createdAt: '2024-02-21T12:22:11.858Z',
    },
    {
        paymentMethod: {
            lastFourDigits: '0083',
            type: 'mc',
        },
        id: '7I77327R6XNLR724',
        amount: {
            currency: 'EUR',
            value: -36325,
        },
        category: 'Chargeback',
        balanceAccountId: 'BA32272223222B5CTDQPM6W2H',
        status: 'Booked',
        createdAt: '2024-02-22T13:23:46.404Z',
    },
    {
        bankAccount: {
            accountNumberLastFourDigits: '3723',
        },
        id: 'SMK4WBV3S7Y34YPT',
        amount: {
            currency: 'USD',
            value: 176350,
        },
        category: 'Transfer',
        balanceAccountId: 'BA32272223222B5CTDQPM6W2H',
        status: 'Booked',
        createdAt: '2024-02-22T17:24:53.889Z',
    },
    {
        paymentMethod: {
            lastFourDigits: '4054',
            type: 'mc',
        },
        id: '65KA4SLZ4PUC82K0',
        amount: {
            currency: 'EUR',
            value: -47375,
        },
        category: 'Refund',
        balanceAccountId: 'BA32272223222B5CTDQPM6W2H',
        status: 'Booked',
        createdAt: '2024-02-26T14:11:34.409Z',
    },
    {
        paymentMethod: {
            lastFourDigits: '5995',
            type: 'mc',
        },
        id: 'C3C9U591L10E8II3',
        amount: {
            currency: 'USD',
            value: 13550,
        },
        category: 'Payment',
        balanceAccountId: 'BA32272223222B5CTDQPM6W2H',
        status: 'Booked',
        createdAt: '2024-02-28T22:26:05.420Z',
    },
    {
        paymentMethod: {
            lastFourDigits: '8212',
            type: 'visa',
        },
        id: 'Q3PW6Y5QZ1I01Z3H',
        amount: {
            currency: 'EUR',
            value: 15000,
        },
        category: 'Payment',
        balanceAccountId: 'BA32272223222B5CTDQPM6W2H',
        status: 'Booked',
        createdAt: '2024-03-01T15:58:11.997Z',
    },
    {
        paymentMethod: {
            type: 'paypal',
        },
        id: 'Y6U8NHA2VJY718PQ',
        amount: {
            currency: 'USD',
            value: 9000,
        },
        category: 'Payment',
        balanceAccountId: 'BA32272223222B5CTDQPM6W2H',
        status: 'Booked',
        createdAt: '2024-03-02T10:09:58.774Z',
    },
    {
        bankAccount: {
            accountNumberLastFourDigits: '6902',
        },
        id: '5P6PZ8LB36P3095K',
        amount: {
            currency: 'EUR',
            value: 129200,
        },
        category: 'Transfer',
        balanceAccountId: 'BA32272223222B5CTDQPM6W2H',
        status: 'Booked',
        createdAt: '2024-03-02T23:52:34.918Z',
    },
    {
        paymentMethod: {
            lastFourDigits: '5832',
            type: 'mc',
        },
        id: 'S28LBLG15Y1168E5',
        amount: {
            currency: 'USD',
            value: 600000,
        },
        category: 'Capital',
        balanceAccountId: 'BA32272223222B5CTDQPM6W2H',
        status: 'Booked',
        createdAt: '2024-03-03T16:53:25.365Z',
    },
    {
        bankAccount: {
            accountNumberLastFourDigits: '2280',
        },
        id: 'W81Z37K8081637B1',
        amount: {
            currency: 'USD',
            value: -5875,
        },
        category: 'Refund',
        balanceAccountId: 'BA32272223222B5CTDQPM6W2H',
        status: 'Booked',
        createdAt: '2024-03-04T13:51:06.805Z',
    },
    {
        bankAccount: {
            accountNumberLastFourDigits: '2207',
        },
        id: '881QMP961VUGC710',
        amount: {
            currency: 'EUR',
            value: 137100,
        },
        category: 'Transfer',
        balanceAccountId: 'BA32272223222B5CTDQPM6W2H',
        status: 'Booked',
        createdAt: '2024-03-05T00:04:02.658Z',
    },
    {
        bankAccount: {
            accountNumberLastFourDigits: '1428',
        },
        id: 'H06HQY56V6K81Q02',
        amount: {
            currency: 'USD',
            value: 217400,
        },
        category: 'Transfer',
        balanceAccountId: 'BA32272223222B5CTDQPM6W2H',
        status: 'Booked',
        createdAt: '2024-03-06T15:32:38.329Z',
    },
    {
        paymentMethod: {
            lastFourDigits: '8739',
            type: 'visa',
        },
        id: '1P47UV8XIGVK05L3',
        amount: {
            currency: 'USD',
            value: -2189,
        },
        category: 'Fee',
        balanceAccountId: 'BA32272223222B5CTDQPM6W2H',
        status: 'Booked',
        createdAt: '2024-03-10T21:05:03.891Z',
    },
    {
        paymentMethod: {
            lastFourDigits: '0058',
            type: 'visa',
        },
        id: 'ND36Z180S4G1T026',
        amount: {
            currency: 'USD',
            value: 550000,
        },
        category: 'Capital',
        balanceAccountId: 'BA32272223222B5CTDQPM6W2H',
        status: 'Booked',
        createdAt: '2024-03-13T18:04:49.663Z',
    },
    {
        paymentMethod: {
            type: 'paypal',
        },
        id: '271YMZI6MR54H26B',
        amount: {
            currency: 'USD',
            value: 1000,
        },
        category: 'Payment',
        balanceAccountId: 'BA32272223222B5CTDQPM6W2G',
        status: 'Booked',
        createdAt: '2024-03-14T14:11:10.787Z',
    },
    {
        paymentMethod: {
            lastFourDigits: '1647',
            type: 'mc',
        },
        id: 'YUZZGK1T1643L307',
        amount: {
            currency: 'USD',
            value: 10000,
        },
        category: 'Payment',
        balanceAccountId: 'BA32272223222B5CTDQPM6W2H',
        status: 'Booked',
        createdAt: '2024-03-14T23:19:10.020Z',
    },
    {
        paymentMethod: {
            lastFourDigits: '6895',
            type: 'mc',
        },
        id: 'S83Q81D583V95458',
        amount: {
            currency: 'EUR',
            value: 9000,
        },
        category: 'Payment',
        balanceAccountId: 'BA32272223222B5CTDQPM6W2H',
        status: 'Booked',
        createdAt: '2024-03-15T15:56:56.450Z',
    },
    {
        bankAccount: {
            accountNumberLastFourDigits: '8786',
        },
        id: 'F6P1M9HH46U4VN28',
        amount: {
            currency: 'USD',
            value: 147000,
        },
        category: 'Transfer',
        balanceAccountId: 'BA32272223222B5CTDQPM6W2H',
        status: 'Booked',
        createdAt: '2024-03-20T17:55:41.544Z',
    },
    {
        bankAccount: {
            accountNumberLastFourDigits: '6598',
        },
        id: '22LMB13652508I3Z',
        amount: {
            currency: 'USD',
            value: 225850,
        },
        category: 'Transfer',
        balanceAccountId: 'BA32272223222B5CTDQPM6W2G',
        status: 'Booked',
        createdAt: '2024-03-21T05:25:59.766Z',
    },
    {
        paymentMethod: {
            lastFourDigits: '3897',
            type: 'visa',
        },
        id: 'B6WPQ92INGWI7073',
        amount: {
            currency: 'USD',
            value: -1429,
        },
        category: 'Fee',
        balanceAccountId: 'BA32272223222B5CTDQPM6W2G',
        status: 'Booked',
        createdAt: '2024-03-22T04:06:07.859Z',
    },
    {
        paymentMethod: {
            type: 'paypal',
        },
        id: 'XM7AZ9E2E94K799W',
        amount: {
            currency: 'USD',
            value: 24000,
        },
        category: 'Payment',
        balanceAccountId: 'BA32272223222B5CTDQPM6W2G',
        status: 'Booked',
        createdAt: '2024-03-22T20:47:05.169Z',
    },
    {
        paymentMethod: {
            type: 'paypal',
        },
        id: '31FN146193QCMV07',
        amount: {
            currency: 'USD',
            value: 2000,
        },
        category: 'Payment',
        balanceAccountId: 'BA32272223222B5CTDQPM6W2H',
        status: 'Booked',
        createdAt: '2024-03-24T05:11:48.084Z',
    },
    {
        bankAccount: {
            accountNumberLastFourDigits: '1052',
        },
        id: '63F8X25N88RX3X5S',
        amount: {
            currency: 'USD',
            value: 59150,
        },
        category: 'Transfer',
        balanceAccountId: 'BA32272223222B5CTDQPM6W2H',
        status: 'Booked',
        createdAt: '2024-03-25T07:57:13.668Z',
    },
    {
        bankAccount: {
            accountNumberLastFourDigits: '9988',
        },
        id: 'M4REQLL6547Y44M9',
        amount: {
            currency: 'USD',
            value: 108700,
        },
        category: 'Transfer',
        balanceAccountId: 'BA32272223222B5CTDQPM6W2H',
        status: 'Booked',
        createdAt: '2024-03-26T11:00:38.702Z',
    },
    {
        bankAccount: {
            accountNumberLastFourDigits: '4658',
        },
        id: '4YA7V8Z821148RQM',
        amount: {
            currency: 'EUR',
            value: 850000,
        },
        category: 'Capital',
        balanceAccountId: 'BA32272223222B5CTDQPM6W2G',
        status: 'Booked',
        createdAt: '2024-03-31T21:40:00.568Z',
    },
    {
        paymentMethod: {
            lastFourDigits: '1186',
            type: 'visa',
        },
        id: 'I6ZVN8NDH9ZCL39R',
        amount: {
            currency: 'USD',
            value: -1289,
        },
        category: 'Fee',
        balanceAccountId: 'BA32272223222B5CTDQPM6W2H',
        status: 'Booked',
        createdAt: '2024-04-01T17:23:23.117Z',
    },
    {
        bankAccount: {
            accountNumberLastFourDigits: '6632',
        },
        id: 'K5U6L41ZI4151B21',
        amount: {
            currency: 'USD',
            value: 119550,
        },
        category: 'Transfer',
        balanceAccountId: 'BA32272223222B5CTDQPM6W2G',
        status: 'Booked',
        createdAt: '2024-04-01T18:38:04.523Z',
    },
    {
        bankAccount: {
            accountNumberLastFourDigits: '2169',
        },
        id: '52L4P70Y674745N9',
        amount: {
            currency: 'USD',
            value: 10000,
        },
        category: 'Payment',
        balanceAccountId: 'BA32272223222B5CTDQPM6W2G',
        status: 'Booked',
        createdAt: '2024-04-02T13:52:03.238Z',
    },
    {
        bankAccount: {
            accountNumberLastFourDigits: '5683',
        },
        id: '3I559571R96W4YZW',
        amount: {
            currency: 'EUR',
            value: 146250,
        },
        category: 'Transfer',
        balanceAccountId: 'BA32272223222B5CTDQPM6W2H',
        status: 'Booked',
        createdAt: '2024-04-03T11:18:55.267Z',
    },
    {
        bankAccount: {
            accountNumberLastFourDigits: '1402',
        },
        id: 'D349H6E79C268S0G',
        amount: {
            currency: 'EUR',
            value: 58300,
        },
        category: 'Transfer',
        balanceAccountId: 'BA32272223222B5CTDQPM6W2G',
        status: 'Booked',
        createdAt: '2024-04-04T17:32:13.892Z',
    },
    {
        bankAccount: {
            accountNumberLastFourDigits: '0017',
        },
        id: 'XZUMQX4R4W06G5FP',
        amount: {
            currency: 'USD',
            value: -3475,
        },
        category: 'Refund',
        balanceAccountId: 'BA32272223222B5CTDQPM6W2H',
        status: 'Booked',
        createdAt: '2024-04-06T17:43:08.120Z',
    },
    {
        paymentMethod: {
            lastFourDigits: '6534',
            type: 'amex',
        },
        id: '6N36X7I8U26XH63K',
        amount: {
            currency: 'EUR',
            value: 8000,
        },
        category: 'Payment',
        balanceAccountId: 'BA32272223222B5CTDQPM6W2H',
        status: 'Booked',
        createdAt: '2024-04-07T19:51:41.336Z',
    },
    {
        paymentMethod: {
            lastFourDigits: '6475',
            type: 'mc',
        },
        id: 'J06K883978B1Y781',
        amount: {
            currency: 'USD',
            value: -73350,
        },
        category: 'Chargeback',
        balanceAccountId: 'BA32272223222B5CTDQPM6W2G',
        status: 'Booked',
        createdAt: '2024-04-08T03:34:57.787Z',
    },
    {
        paymentMethod: {
            type: 'paypal',
        },
        id: '56XE2W3Q62N0P8H5',
        amount: {
            currency: 'EUR',
            value: 19000,
        },
        category: 'Payment',
        balanceAccountId: 'BA32272223222B5CTDQPM6W2G',
        status: 'Booked',
        createdAt: '2024-04-08T10:18:15.715Z',
    },
    {
        paymentMethod: {
            lastFourDigits: '8227',
            type: 'visa',
        },
        id: 'VQ69RV2L6CY66SKX',
        amount: {
            currency: 'USD',
            value: 24000,
        },
        category: 'Payment',
        balanceAccountId: 'BA32272223222B5CTDQPM6W2H',
        status: 'Booked',
        createdAt: '2024-04-08T15:27:33.683Z',
    },
    {
        paymentMethod: {
            lastFourDigits: '3499',
            type: 'amex',
        },
        id: 'Y6T04913ID09DR1P',
        amount: {
            currency: 'USD',
            value: 23000,
        },
        category: 'Payment',
        balanceAccountId: 'BA32272223222B5CTDQPM6W2H',
        status: 'Booked',
        createdAt: '2024-04-08T16:52:07.750Z',
    },
    {
        paymentMethod: {
            lastFourDigits: '7280',
            type: 'mc',
        },
        id: '74687D7AS73P6B4E',
        amount: {
            currency: 'EUR',
            value: -74700,
        },
        category: 'Chargeback',
        balanceAccountId: 'BA32272223222B5CTDQPM6W2H',
        status: 'Booked',
        createdAt: '2024-04-09T11:06:14.659Z',
    },
    {
        paymentMethod: {
            lastFourDigits: '4343',
            type: 'mc',
        },
        id: 'V97KYWMW8WL64842',
        amount: {
            currency: 'EUR',
            value: -2095,
        },
        category: 'Fee',
        balanceAccountId: 'BA32272223222B5CTDQPM6W2G',
        status: 'Booked',
        createdAt: '2024-04-13T00:31:14.033Z',
    },
    {
        paymentMethod: {
            lastFourDigits: '6888',
            type: 'visa',
        },
        id: '81348R3LCL882826',
        amount: {
            currency: 'EUR',
            value: 550000,
        },
        category: 'Capital',
        balanceAccountId: 'BA32272223222B5CTDQPM6W2G',
        status: 'Booked',
        createdAt: '2024-04-16T09:56:31.722Z',
    },
    {
        bankAccount: {
            accountNumberLastFourDigits: '5156',
        },
        id: 'Y300HB4G3985Z2F4',
        amount: {
            currency: 'EUR',
            value: 227350,
        },
        category: 'Transfer',
        balanceAccountId: 'BA32272223222B5CTDQPM6W2G',
        status: 'Booked',
        createdAt: '2024-04-16T15:49:00.104Z',
    },
    {
        bankAccount: {
            accountNumberLastFourDigits: '1256',
        },
        id: '9U5ANNDE4N6AZ6RV',
        amount: {
            currency: 'USD',
            value: 16000,
        },
        category: 'Payment',
        balanceAccountId: 'BA32272223222B5CTDQPM6W2H',
        status: 'Booked',
        createdAt: '2024-04-18T12:56:14.064Z',
    },
    {
        paymentMethod: {
            lastFourDigits: '9800',
            type: 'visa',
        },
        id: 'I1E70AI2P35H1X72',
        amount: {
            currency: 'EUR',
            value: 5000,
        },
        category: 'Payment',
        balanceAccountId: 'BA32272223222B5CTDQPM6W2H',
        status: 'Booked',
        createdAt: '2024-04-22T05:48:11.397Z',
    },
    {
        bankAccount: {
            accountNumberLastFourDigits: '7739',
        },
        id: '7C038Y622ZD3KKBD',
        amount: {
            currency: 'USD',
            value: 172400,
        },
        category: 'Transfer',
        balanceAccountId: 'BA32272223222B5CTDQPM6W2H',
        status: 'Booked',
        createdAt: '2024-04-22T17:41:39.871Z',
    },
    {
        paymentMethod: {
            lastFourDigits: '6120',
            type: 'mc',
        },
        id: '1J95VDQW7TIJ6C85',
        amount: {
            currency: 'USD',
            value: 9000,
        },
        category: 'Payment',
        balanceAccountId: 'BA32272223222B5CTDQPM6W2H',
        status: 'Booked',
        createdAt: '2024-04-22T23:46:50.313Z',
    },
    {
        paymentMethod: {
            lastFourDigits: '1990',
            type: 'visa',
        },
        id: '71RH41C42BWY5S6K',
        amount: {
            currency: 'USD',
            value: -10800,
        },
        category: 'Chargeback',
        balanceAccountId: 'BA32272223222B5CTDQPM6W2G',
        status: 'Booked',
        createdAt: '2024-04-24T17:33:50.577Z',
    },
    {
        paymentMethod: {
            lastFourDigits: '3151',
            type: 'visa',
        },
        id: '636G1TVBM55MUI7H',
        amount: {
            currency: 'USD',
            value: 12000,
        },
        category: 'Payment',
        balanceAccountId: 'BA32272223222B5CTDQPM6W2H',
        status: 'Booked',
        createdAt: '2024-04-27T10:35:32.289Z',
    },
    {
        paymentMethod: {
            lastFourDigits: '0469',
            type: 'mc',
        },
        id: 'S3B3143S20L57HQQ',
        amount: {
            currency: 'EUR',
            value: 21000,
        },
        category: 'Payment',
        balanceAccountId: 'BA32272223222B5CTDQPM6W2H',
        status: 'Booked',
        createdAt: '2024-04-30T07:01:44.996Z',
    },
    {
        paymentMethod: {
            lastFourDigits: '2009',
            type: 'visa',
        },
        id: '854620R8386U94F4',
        amount: {
            currency: 'USD',
            value: -595,
        },
        category: 'Fee',
        balanceAccountId: 'BA32272223222B5CTDQPM6W2H',
        status: 'Booked',
        createdAt: '2024-05-02T01:39:36.554Z',
    },
    {
        bankAccount: {
            accountNumberLastFourDigits: '9668',
        },
        id: 'F2GTC1N429E666UM',
        amount: {
            currency: 'EUR',
            value: 15350,
        },
        category: 'Transfer',
        balanceAccountId: 'BA32272223222B5CTDQPM6W2G',
        status: 'Booked',
        createdAt: '2024-05-02T10:34:20.607Z',
    },
    {
        paymentMethod: {
            lastFourDigits: '8906',
            type: 'mc',
        },
        id: '8SS07TENT793M397',
        amount: {
            currency: 'USD',
            value: -65375,
        },
        category: 'Chargeback',
        balanceAccountId: 'BA32272223222B5CTDQPM6W2H',
        status: 'Booked',
        createdAt: '2024-05-02T13:56:48.567Z',
    },
    {
        bankAccount: {
            accountNumberLastFourDigits: '2726',
        },
        id: '8D5JZ4H4E89XFPA6',
        amount: {
            currency: 'USD',
            value: 20000,
        },
        category: 'Payment',
        balanceAccountId: 'BA32272223222B5CTDQPM6W2H',
        status: 'Booked',
        createdAt: '2024-05-02T17:26:53.958Z',
    },
    {
        bankAccount: {
            accountNumberLastFourDigits: '3107',
        },
        id: '5D8D3BCZ5787H8K4',
        amount: {
            currency: 'USD',
            value: 18000,
        },
        category: 'Payment',
        balanceAccountId: 'BA32272223222B5CTDQPM6W2H',
        status: 'Booked',
        createdAt: '2024-05-03T18:38:31.299Z',
    },
    {
        paymentMethod: {
            lastFourDigits: '5995',
            type: 'mc',
        },
        id: 'E177W00BXTM6V255',
        amount: {
            currency: 'USD',
            value: -13550,
        },
        category: 'Refund',
        balanceAccountId: 'BA32272223222B5CTDQPM6W2H',
        status: 'Booked',
        createdAt: '2024-05-05T10:56:39.354Z',
    },
    {
        bankAccount: {
            accountNumberLastFourDigits: '0532',
        },
        id: '43C4XEEA37P5E318',
        amount: {
            currency: 'USD',
            value: 0,
        },
        category: 'Payment',
        balanceAccountId: 'BA32272223222B5CTDQPM6W2H',
        status: 'Booked',
        createdAt: '2024-05-08T10:57:13.266Z',
    },
    {
        paymentMethod: {
            lastFourDigits: '4930',
            type: 'visa',
        },
        id: '8S95P7Z4R23GLLBE',
        amount: {
            currency: 'USD',
            value: 16000,
        },
        category: 'Payment',
        balanceAccountId: 'BA32272223222B5CTDQPM6W2H',
        status: 'Booked',
        createdAt: '2024-05-10T13:33:52.502Z',
    },
    {
        paymentMethod: {
            lastFourDigits: '8809',
            type: 'amex',
        },
        id: '666CRVTJ6T1J8WHS',
        amount: {
            currency: 'USD',
            value: 4000,
        },
        category: 'Payment',
        balanceAccountId: 'BA32272223222B5CTDQPM6W2G',
        status: 'Booked',
        createdAt: '2024-05-10T16:18:43.814Z',
    },
    {
        bankAccount: {
            accountNumberLastFourDigits: '6411',
        },
        id: '62V5XUW6YIDGZ5P2',
        amount: {
            currency: 'EUR',
            value: 0,
        },
        category: 'Payment',
        balanceAccountId: 'BA32272223222B5CTDQPM6W2H',
        status: 'Booked',
        createdAt: '2024-05-14T22:55:40.567Z',
    },
    {
        paymentMethod: {
            lastFourDigits: '5443',
            type: 'mc',
        },
        id: '2M5CGU2S60T3M70Z',
        amount: {
            currency: 'USD',
            value: -50075,
        },
        category: 'Chargeback',
        balanceAccountId: 'BA32272223222B5CTDQPM6W2H',
        status: 'Booked',
        createdAt: '2024-05-18T07:59:17.010Z',
    },
    {
        bankAccount: {
            accountNumberLastFourDigits: '7747',
        },
        id: '9TB87C718QXX71Z4',
        amount: {
            currency: 'USD',
            value: -27950,
        },
        category: 'Refund',
        balanceAccountId: 'BA32272223222B5CTDQPM6W2G',
        status: 'Booked',
        createdAt: '2024-05-19T03:18:21.461Z',
    },
    {
        paymentMethod: {
            lastFourDigits: '8385',
            type: 'mc',
        },
        id: 'P22WF9KY44PG7L1X',
        amount: {
            currency: 'USD',
            value: 11000,
        },
        category: 'Payment',
        balanceAccountId: 'BA32272223222B5CTDQPM6W2H',
        status: 'Booked',
        createdAt: '2024-05-21T21:54:09.047Z',
    },
    {
        paymentMethod: {
            lastFourDigits: '4128',
            type: 'mc',
        },
        id: '67K470ZD5NPP4SX7',
        amount: {
            currency: 'USD',
            value: 300000,
        },
        category: 'Capital',
        balanceAccountId: 'BA32272223222B5CTDQPM6W2H',
        status: 'Booked',
        createdAt: '2024-05-23T14:22:57.132Z',
    },
    {
        bankAccount: {
            accountNumberLastFourDigits: '9964',
        },
        id: 'Y896LT9J720LN800',
        amount: {
            currency: 'USD',
            value: 10000,
        },
        category: 'Payment',
        balanceAccountId: 'BA32272223222B5CTDQPM6W2H',
        status: 'Booked',
        createdAt: '2024-05-24T15:44:32.223Z',
    },
    {
        paymentMethod: {
            type: 'paypal',
        },
        id: 'N39BHJ2ZHUG3HDK0',
        amount: {
            currency: 'USD',
            value: 17000,
        },
        category: 'Payment',
        balanceAccountId: 'BA32272223222B5CTDQPM6W2H',
        status: 'Booked',
        createdAt: '2024-05-25T11:53:22.561Z',
    },
    {
        bankAccount: {
            accountNumberLastFourDigits: '5197',
        },
        id: '63JF4G4594081ZL0',
        amount: {
            currency: 'USD',
            value: 44900,
        },
        category: 'Transfer',
        balanceAccountId: 'BA32272223222B5CTDQPM6W2G',
        status: 'Booked',
        createdAt: '2024-05-25T12:42:02.796Z',
    },
    {
        paymentMethod: {
            lastFourDigits: '5866',
            type: 'visa',
        },
        id: 'AWJE138YH21Y7F47',
        amount: {
            currency: 'EUR',
            value: 3000,
        },
        category: 'Payment',
        balanceAccountId: 'BA32272223222B5CTDQPM6W2H',
        status: 'Booked',
        createdAt: '2024-05-27T03:21:37.251Z',
    },
    {
        paymentMethod: {
            lastFourDigits: '5172',
            type: 'mc',
        },
        id: 'E4K2M2D1AS376F18',
        amount: {
            currency: 'USD',
            value: -265,
        },
        category: 'Fee',
        balanceAccountId: 'BA32272223222B5CTDQPM6W2H',
        status: 'Booked',
        createdAt: '2024-05-27T06:20:19.216Z',
    },
    {
        bankAccount: {
            accountNumberLastFourDigits: '0172',
        },
        id: 'Y0RMAS0R613M740K',
        amount: {
            currency: 'USD',
            value: 47900,
        },
        category: 'Transfer',
        balanceAccountId: 'BA32272223222B5CTDQPM6W2H',
        status: 'Booked',
        createdAt: '2024-05-28T00:11:37.048Z',
    },
    {
        bankAccount: {
            accountNumberLastFourDigits: '1682',
        },
        id: '88860H986PH67J9S',
        amount: {
            currency: 'EUR',
            value: 94100,
        },
        category: 'Transfer',
        balanceAccountId: 'BA32272223222B5CTDQPM6W2H',
        status: 'Booked',
        createdAt: '2024-05-28T10:06:44.680Z',
    },
    {
        paymentMethod: {
            type: 'paypal',
        },
        id: '5880637SJNR3X91E',
        amount: {
            currency: 'USD',
            value: 24000,
        },
        category: 'Payment',
        balanceAccountId: 'BA32272223222B5CTDQPM6W2H',
        status: 'Booked',
        createdAt: '2024-05-28T16:27:33.170Z',
    },
    {
        paymentMethod: {
            lastFourDigits: '4907',
            type: 'visa',
        },
        id: '1AZNLR8QC3B55B35',
        amount: {
            currency: 'USD',
            value: -139,
        },
        category: 'Fee',
        balanceAccountId: 'BA32272223222B5CTDQPM6W2H',
        status: 'Booked',
        createdAt: '2024-05-30T13:32:57.755Z',
    },
    {
        paymentMethod: {
            lastFourDigits: '6895',
            type: 'amex',
        },
        id: 'N6P9XRPIVHZ3065N',
        amount: {
            currency: 'EUR',
            value: 3000,
        },
        category: 'Payment',
        balanceAccountId: 'BA32272223222B5CTDQPM6W2G',
        status: 'Booked',
        createdAt: '2024-05-30T14:09:51.936Z',
    },
    {
        paymentMethod: {
            lastFourDigits: '1441',
            type: 'visa',
        },
        id: 'R190HS56F319349X',
        amount: {
            currency: 'USD',
            value: 23000,
        },
        category: 'Payment',
        balanceAccountId: 'BA32272223222B5CTDQPM6W2H',
        status: 'Booked',
        createdAt: '2024-06-01T06:09:14.369Z',
    },
    {
        bankAccount: {
            accountNumberLastFourDigits: '9518',
        },
        id: 'P07K462PN8110396',
        amount: {
            currency: 'USD',
            value: 57000,
        },
        category: 'Transfer',
        balanceAccountId: 'BA32272223222B5CTDQPM6W2H',
        status: 'Booked',
        createdAt: '2024-06-01T08:06:02.187Z',
    },
    {
        paymentMethod: {
            lastFourDigits: '2274',
            type: 'amex',
        },
        id: 'HKZEDJK3D86B68B3',
        amount: {
            currency: 'EUR',
            value: 150000,
        },
        category: 'Payment',
        balanceAccountId: 'BA32272223222B5CTDQPM6W2H',
        status: 'Booked',
        createdAt: '2024-06-01T15:25:07.719Z',
    },
    {
        paymentMethod: {
            lastFourDigits: '9952',
            type: 'visa',
        },
        id: '679804580TI615BK',
        amount: {
            currency: 'USD',
            value: -1365,
        },
        category: 'Fee',
        balanceAccountId: 'BA32272223222B5CTDQPM6W2H',
        status: 'Booked',
        createdAt: '2024-06-04T23:07:22.760Z',
    },
    {
        paymentMethod: {
            lastFourDigits: '2326',
            type: 'visa',
        },
        id: '8607Z382A5I805I8',
        amount: {
            currency: 'USD',
            value: -2099,
        },
        category: 'Fee',
        balanceAccountId: 'BA32272223222B5CTDQPM6W2H',
        status: 'Booked',
        createdAt: '2024-06-12T13:03:01.249Z',
    },
    {
        bankAccount: {
            accountNumberLastFourDigits: '3313',
        },
        id: '8247LG526H31261M',
        amount: {
            currency: 'USD',
            value: 24000,
        },
        category: 'Payment',
        balanceAccountId: 'BA32272223222B5CTDQPM6W2G',
        status: 'Booked',
        createdAt: '2024-06-12T23:54:27.430Z',
    },
    {
        paymentMethod: {
            lastFourDigits: '0705',
            type: 'mc',
        },
        id: '80N53DBSH777617C',
        amount: {
            currency: 'USD',
            value: 1000,
        },
        category: 'Payment',
        balanceAccountId: 'BA32272223222B5CTDQPM6W2H',
        status: 'Booked',
        createdAt: '2024-06-13T18:05:24.402Z',
    },
    {
        bankAccount: {
            accountNumberLastFourDigits: '5955',
        },
        id: '8V35KU6RYH09692U',
        amount: {
            currency: 'EUR',
            value: 9000,
        },
        category: 'Payment',
        balanceAccountId: 'BA32272223222B5CTDQPM6W2G',
        status: 'Booked',
        createdAt: '2024-06-14T17:26:50.802Z',
    },
    {
        paymentMethod: {
            lastFourDigits: '7288',
            type: 'amex',
        },
        id: '33NB50236047669K',
        amount: {
            currency: 'EUR',
            value: -50550,
        },
        category: 'Chargeback',
        balanceAccountId: 'BA32272223222B5CTDQPM6W2H',
        status: 'Booked',
        createdAt: '2024-06-15T18:21:53.060Z',
    },
    {
        bankAccount: {
            accountNumberLastFourDigits: '7492',
        },
        id: '9P4GH141S8UJB6W6',
        amount: {
            currency: 'USD',
            value: 18000,
        },
        category: 'Payment',
        balanceAccountId: 'BA32272223222B5CTDQPM6W2H',
        status: 'Booked',
        createdAt: '2024-06-17T22:02:56.535Z',
    },
    {
        bankAccount: {
            accountNumberLastFourDigits: '5936',
        },
        id: '4V577NYH925V18Y4',
        amount: {
            currency: 'USD',
            value: 110950,
        },
        category: 'Transfer',
        balanceAccountId: 'BA32272223222B5CTDQPM6W2G',
        status: 'Booked',
        createdAt: '2024-06-19T00:56:59.883Z',
    },
    {
        bankAccount: {
            accountNumberLastFourDigits: '3989',
        },
        id: '744W4W50UC1P5608',
        amount: {
            currency: 'EUR',
            value: 227000,
        },
        category: 'Transfer',
        balanceAccountId: 'BA32272223222B5CTDQPM6W2H',
        status: 'Booked',
        createdAt: '2024-06-19T01:54:48.267Z',
    },
    {
        paymentMethod: {
            lastFourDigits: '7794',
            type: 'mc',
        },
        id: '7296S01PDM80A6J2',
        amount: {
            currency: 'USD',
            value: -22600,
        },
        category: 'Refund',
        balanceAccountId: 'BA32272223222B5CTDQPM6W2H',
        status: 'Booked',
        createdAt: '2024-06-19T03:05:56.456Z',
    },
    {
        bankAccount: {
            accountNumberLastFourDigits: '1994',
        },
        id: 'J268DIH2343N6B2T',
        amount: {
            currency: 'USD',
            value: 8000,
        },
        category: 'Payment',
        balanceAccountId: 'BA32272223222B5CTDQPM6W2H',
        status: 'Booked',
        createdAt: '2024-06-19T03:51:15.171Z',
    },
    {
        bankAccount: {
            accountNumberLastFourDigits: '6316',
        },
        id: 'SRZ2J8AND6K2W3YF',
        amount: {
            currency: 'USD',
            value: -39050,
        },
        category: 'Refund',
        balanceAccountId: 'BA32272223222B5CTDQPM6W2H',
        status: 'Booked',
        createdAt: '2024-06-19T23:36:51.534Z',
    },
    {
        bankAccount: {
            accountNumberLastFourDigits: '5665',
        },
        id: '14UEJSP4KAN5Z407',
        amount: {
            currency: 'EUR',
            value: 127400,
        },
        category: 'Transfer',
        balanceAccountId: 'BA32272223222B5CTDQPM6W2H',
        status: 'Booked',
        createdAt: '2024-06-21T06:43:53.146Z',
    },
    {
        bankAccount: {
            accountNumberLastFourDigits: '3018',
        },
        id: 'D92L69449PJX0KMT',
        amount: {
            currency: 'EUR',
            value: 58700,
        },
        category: 'Transfer',
        balanceAccountId: 'BA32272223222B5CTDQPM6W2H',
        status: 'Booked',
        createdAt: '2024-06-21T18:45:43.946Z',
    },
    {
        bankAccount: {
            accountNumberLastFourDigits: '0990',
        },
        id: '3PKB9SU3920381Q9',
        amount: {
            currency: 'EUR',
            value: 202000,
        },
        category: 'Transfer',
        balanceAccountId: 'BA32272223222B5CTDQPM6W2H',
        status: 'Booked',
        createdAt: '2024-06-22T14:09:02.145Z',
    },
    {
        paymentMethod: {
            lastFourDigits: '4080',
            type: 'visa',
        },
        id: 'J21035G974F758U3',
        amount: {
            currency: 'USD',
            value: 11000,
        },
        category: 'Payment',
        balanceAccountId: 'BA32272223222B5CTDQPM6W2G',
        status: 'Booked',
        createdAt: '2024-06-24T23:11:09.775Z',
    },
    {
        bankAccount: {
            accountNumberLastFourDigits: '7386',
        },
        id: 'M02F0BRD4JP75RXI',
        amount: {
            currency: 'USD',
            value: 10000,
        },
        category: 'Payment',
        balanceAccountId: 'BA32272223222B5CTDQPM6W2G',
        status: 'Booked',
        createdAt: '2024-06-27T06:46:48.678Z',
    },
    {
        paymentMethod: {
            type: 'paypal',
        },
        id: 'B78I76Y77072H126',
        amount: {
            currency: 'USD',
            value: 22000,
        },
        category: 'Payment',
        balanceAccountId: 'BA32272223222B5CTDQPM6W2G',
        status: 'Booked',
        createdAt: '2024-06-30T05:16:44.764Z',
    },
    {
        bankAccount: {
            accountNumberLastFourDigits: '6890',
        },
        id: '254X7TAUWB140HW0',
        amount: {
            currency: 'USD',
            value: 1400000,
        },
        category: 'Payment',
        balanceAccountId: 'BA32272223222B5CTDQPM6W2H',
        status: 'Booked',
        createdAt: '2024-06-30T19:58:16.527Z',
    },
    {
        paymentMethod: {
            type: 'klarna',
            description: 'Klarna Pay Later',
        },
        id: 'B78I76Y77072H126',
        amount: {
            currency: 'USD',
            value: 22000,
        },
        category: 'Payment',
        balanceAccountId: 'BA32272223222B5CTDQPM6W2H',
        status: 'Booked',
        createdAt: '2025-02-04T05:16:44.764Z',
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
    amount: { currency: 'EUR', value: 100000 },
    balanceAccountId: '',
    status: 'Booked',
    category: 'Fee',
    paymentMethod: { lastFourDigits: '1945', type: 'mc' },
    createdAt: '2022-08-29T14:47:03+02:00',
};
