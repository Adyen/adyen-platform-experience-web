import { AccountHolder } from '../../packages/lib/src/components/AccountHolder/types';

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
} as const;
export const ACCOUNT_HOLDER_2 = {
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
} as const;
export const ACCOUNT_HOLDERS = [ACCOUNT_HOLDER_1, ACCOUNT_HOLDER_2] as const;
