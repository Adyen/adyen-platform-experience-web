import { describe, expect, test } from 'vitest';
import {
    ACTIVE_GRANT,
    ACTIVE_GRANT_NL,
    ACTIVE_GRANT_WITHOUT_TRANSFER_INSTRUMENTS,
    GRANT_GB_ACCOUNT,
    GRANT_NL_ACCOUNT,
} from '../../../../mocks/mock-data/capital';
import {
    getBankAccount,
    getBankAccountDetails,
    getBankAccountFieldCopyButtonTranslationKey,
    getBankAccountFieldFormattedValue,
    getBankAccountFieldTextToCopy,
    getBankAccountFieldTranslationKey,
    getBankAccountFields,
    getTransferInstrumentIds,
    isBankAccountFieldPrimary,
} from './repayments';

describe('getBankAccount', () => {
    test('returns the first repayment bank account', () => {
        expect(getBankAccount(ACTIVE_GRANT_NL)).toEqual(GRANT_NL_ACCOUNT);
    });

    test('returns undefined when there are no repayment bank accounts', () => {
        expect(getBankAccount(ACTIVE_GRANT)).toBeUndefined();
    });
});

describe('getTransferInstrumentIds', () => {
    test('returns transfer instrument IDs ', () => {
        expect(getTransferInstrumentIds(ACTIVE_GRANT)).toEqual(['NL**INGB******8101', 'NL**INGB******4151']);
    });

    test('returns an empty array when there are no transfer instruments', () => {
        expect(getTransferInstrumentIds(ACTIVE_GRANT_WITHOUT_TRANSFER_INSTRUMENTS)).toEqual([]);
    });
});

describe('getBankAccountFields', () => {
    test('returns bank account fields sorted by provided order, excluding unknown fields and duplicated entries', () => {
        expect(getBankAccountFields({ ...GRANT_GB_ACCOUNT, order: ['iban', 'iban', 'unknown', 'region'] })).toEqual(['iban', 'region']);
    });
});

describe('getBankAccountDetails', () => {
    test('returns formatted account details with their presentation metadata', () => {
        expect(getBankAccountDetails(GRANT_NL_ACCOUNT)).toEqual([
            {
                content: 'NL69 RABO 1319 7782 91',
                copyButtonLabel: 'capital.overview.repayment.actions.copyIban',
                field: 'iban',
                isPrimary: true,
                label: 'capital.overview.repayment.accountDetails.fields.iban',
                textToCopy: 'NL69RABO1319778291',
            },
            {
                content: 'Adyen N.V.',
                copyButtonLabel: 'capital.overview.repayment.actions.copyBeneficiaryName',
                field: 'beneficiaryName',
                isPrimary: false,
                label: 'capital.overview.repayment.accountDetails.fields.beneficiaryName',
                textToCopy: 'Adyen N.V.',
            },
            {
                content: 'NL',
                copyButtonLabel: undefined,
                field: 'region',
                isPrimary: false,
                label: 'capital.overview.repayment.accountDetails.fields.countryOrRegion',
                textToCopy: undefined,
            },
        ]);
    });
});

describe('isBankAccountFieldPrimary', () => {
    test.each([
        ['accountNumber', true],
        ['iban', true],
        ['routingNumber', true],
        ['sortCode', true],
        ['beneficiaryName', false],
        ['region', false],
        ['unknown', false],
    ])('identifies whether %s is a primary field', (field, expected) => {
        expect(isBankAccountFieldPrimary(field)).toBe(expected);
    });
});

describe('getBankAccountFieldFormattedValue', () => {
    test("returns the value in a human-readable format if it's an IBAN, or as-is otherwise", () => {
        expect(getBankAccountFieldFormattedValue('iban', 'NL69 RABO 1319 7782 91')).toBe('NL69 RABO 1319 7782 91');
        expect(getBankAccountFieldFormattedValue('accountNumber', '123')).toBe('123');
    });
});

describe('getBankAccountFieldTextToCopy', () => {
    test('return the value only if the field is copyable', () => {
        expect(getBankAccountFieldTextToCopy('iban', GRANT_NL_ACCOUNT.iban)).toBe(GRANT_NL_ACCOUNT.iban);
        expect(getBankAccountFieldTextToCopy('region', 'NL')).toBeUndefined();
    });
});

describe('getBankAccountFieldCopyButtonTranslationKey', () => {
    test.each([
        ['accountNumber', 'capital.overview.repayment.actions.copyAccountNumber'],
        ['beneficiaryName', 'capital.overview.repayment.actions.copyBeneficiaryName'],
        ['iban', 'capital.overview.repayment.actions.copyIban'],
        ['routingNumber', 'capital.overview.repayment.actions.copyRoutingNumber'],
        ['sortCode', 'capital.overview.repayment.actions.copySortCode'],
        ['region', undefined],
    ])('returns copy button translation key for %s', (field, expected) => {
        expect(getBankAccountFieldCopyButtonTranslationKey(field)).toBe(expected);
    });
});

describe('getBankAccountFieldTranslationKey', () => {
    test.each([
        ['accountNumber', 'capital.overview.repayment.accountDetails.fields.accountNumber'],
        ['beneficiaryName', 'capital.overview.repayment.accountDetails.fields.beneficiaryName'],
        ['iban', 'capital.overview.repayment.accountDetails.fields.iban'],
        ['region', 'capital.overview.repayment.accountDetails.fields.countryOrRegion'],
        ['routingNumber', 'capital.overview.repayment.accountDetails.fields.routingNumber'],
        ['sortCode', 'capital.overview.repayment.accountDetails.fields.sortCode'],
        ['unknown', 'unknown'],
    ])('returns translation key for %s', (field, expected) => {
        expect(getBankAccountFieldTranslationKey(field)).toBe(expected);
    });
});
