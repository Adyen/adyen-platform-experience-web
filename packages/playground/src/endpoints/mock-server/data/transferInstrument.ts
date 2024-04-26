import { BankAccount, TransferInstrument, TransferInstrumentOverview, TransferInstrumentType } from '../../src/core/models/api/transfer-instrument';
import { getDocumentDetailForDocument, getDocumentResponse_Document_bankStatement } from './document';

export const transferInstrumentDataMock_NL: TransferInstrument = {
    bankAccount: {
        countryCode: 'NL',
        currencyCode: 'EUR',
        iban: 'NL91ABNA0417164300',
    } as BankAccount,
    legalEntityId: 'LE322LZ223222D5F96G2X8WKK',
    type: TransferInstrumentType.BANK_ACCOUNT,
    id: 'transferInstrumentDataMock_NL',
    documentDetails: [getDocumentDetailForDocument(getDocumentResponse_Document_bankStatement('transferInstrumentDataMock_NL'))],
};

export const transferInstrumentDataMock_NL_Missing_Data: TransferInstrument = {
    bankAccount: {
        countryCode: 'NL',
        currencyCode: 'EUR',
        iban: 'NL91ABNA0417164300',
    } as BankAccount,
    legalEntityId: 'LE_getLegalEntityResponse_Company_Private_bankProblems',
    type: TransferInstrumentType.BANK_ACCOUNT,
    id: 'transferInstrumentDataMock_NL_Missing_Data',
    documentDetails: [getDocumentDetailForDocument(getDocumentResponse_Document_bankStatement('transferInstrumentDataMock_NL_Missing_Data'))],
};

export const transferInstrumentDataMock_NL_overview: TransferInstrumentOverview = {
    id: transferInstrumentDataMock_NL.id,
    accountIdentifier: `*******${transferInstrumentDataMock_NL.bankAccount.iban?.slice(-4)}`,
};

export const transferInstrumentDataMock_US = {
    bankAccount: {
        countryCode: 'US',
        currencyCode: 'USD',
        accountNumber: '********1234',
        branchCode: '123456789',
    } as BankAccount,
    legalEntityId: 'LE322LZ223222D5F96G2X8WKK',
    type: TransferInstrumentType.BANK_ACCOUNT,
    id: 'transferInstrumentDataMock_US',
    documentDetails: [getDocumentDetailForDocument(getDocumentResponse_Document_bankStatement('transferInstrumentDataMock_US'))],
} satisfies TransferInstrument;

export const transferInstrumentDataMock_US_overview: TransferInstrumentOverview = {
    id: transferInstrumentDataMock_US.id,
    accountIdentifier: `**${transferInstrumentDataMock_US.bankAccount.accountNumber!.slice(-4)}`,
};

export const transferInstrumentDataMock_US_fromTrustly = {
    bankAccount: {
        accountNumber: '987654321',
        accountType: 'CHECKING',
        bankBicSwift: 'PBNKUS11XXX',
        bankName: 'Demo Bank',
        branchCode: '1240031116',
        countryCode: 'US',
        currencyCode: 'USD',
        virtualAccountNumber: true,
        realLastFour: '6576',
        trustedSource: true,
    },
    id: 'bankAccount:1a2b3c4d5f',
    legalEntityId: 'LE322LZ223222D5F96G2X8WKK',
    type: TransferInstrumentType.BANK_ACCOUNT,
} satisfies TransferInstrument;

export const transferInstrumentDataMock_US_fromTrustly_overview: TransferInstrumentOverview = {
    id: transferInstrumentDataMock_US_fromTrustly.id,
    accountIdentifier: `*******${transferInstrumentDataMock_US_fromTrustly.bankAccount.accountNumber.slice(-4)}`,
    realLastFour: '6576',
    trustedSource: true,
};
