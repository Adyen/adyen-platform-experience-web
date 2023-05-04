const MOCK_TRANSFER_INSTRUMENT_OVERVIEW = {
    realLastFour: '8645',
    accountIdentifier: 'NL**RTBO******5428',
    id: 'SE322LZ223222D5F96LNL8WNX',
    trustedSource: false,
};
const MOCK_TRANSFER_INSTRUMENT = {
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
    type: 'bankAccount',
};

module.exports = { MOCK_TRANSFER_INSTRUMENT_OVERVIEW, MOCK_TRANSFER_INSTRUMENT };
