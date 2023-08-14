import type { AccountHolder } from '../../packages/lib/src/types/models/api/account-holder';

export const ACCOUNT_HOLDER_1: AccountHolder = {
    balancePlatform: 'TestBalancePlatform',
    contactDetails: {
        address: { city: 'Amsterdam', country: 'NL', houseNumberOrName: '6', postalCode: '12336750', street: 'Simon Carmiggeltstraat' },
        email: 'john@doe.com',
        phone: { number: '+31205277777', type: 'landline' },
    },
    description: 'Liable account holder for TestBalancePlatform',
    legalEntityId: 'LE3227C223222D5D8RQH439TN',
    id: 'AH3227B2248HKJ5BHTQPKC5GX',
    status: 'active',
    capabilities: {
        receiveFromPlatformPayments: {
            enabled: true,
            requested: true,
            allowed: false,
            verificationStatus: 'pending',
        },
        receiveFromBalanceAccount: {
            enabled: true,
            requested: true,
            allowed: false,
            verificationStatus: 'pending',
        },
        sendToBalanceAccount: {
            enabled: true,
            requested: true,
            allowed: false,
            verificationStatus: 'pending',
        },
        sendToTransferInstrument: {
            enabled: true,
            requested: true,
            allowed: false,
            verificationStatus: 'pending',
        },
    },
};
export const ACCOUNT_HOLDER_2: AccountHolder = {
    balancePlatform: 'BalancePlatform 2',
    contactDetails: {
        address: { city: 'Amsterdam', country: 'NL', houseNumberOrName: '6', postalCode: '12336750', street: 'Simon Carmiggeltstraat' },
        email: 'john@doe.com',
        phone: { number: '+31205277777', type: 'landline' },
    },
    description: 'Liable account holder for TestBalancePlatform',
    legalEntityId: 'LE3227C223222D5D8RQH439TN',
    id: 'AH3227C223222B5GG3XG7G5CF',
    status: 'active',
    capabilities: {
        receiveFromPlatformPayments: {
            enabled: true,
            requested: true,
            allowed: false,
            verificationStatus: 'pending',
        },
        receiveFromBalanceAccount: {
            enabled: true,
            requested: true,
            allowed: false,
            verificationStatus: 'pending',
        },
    },
};
export const ACCOUNT_HOLDERS = [ACCOUNT_HOLDER_1, ACCOUNT_HOLDER_2] as const;
