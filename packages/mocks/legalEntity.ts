const transferInstruments = require('./transferInstrument.ts');

const LEGAL_ENTITY_ORGANIZATION = {
    transferInstruments: [transferInstruments.MOCK_TRANSFER_INSTRUMENT_OVERVIEW],
    entityAssociations: [
        {
            jobTitle: 'CFO',
            legalEntityId: 'LE322LJ223222D5DMQQ7FFGT2',
            type: 'signatory',
            associatorId: 'LE_getLegalEntityResponse_Company_Private_noProblems',
        },
        {
            jobTitle: 'Owner',
            legalEntityId: 'LE322LJ223222D5DMQQ7FFGT1',
            type: 'uboThroughOwnership',
            associatorId: 'LE_getLegalEntityResponse_Company_Private_noProblems',
        },
    ],
    organization: {
        legalName: 'My company',
        registeredAddress: {
            city: 'City',
            country: 'NL',
            postalCode: '1111AA',
            street: 'My street 1',
            street2: 'L',
        },
        type: 'privateCompany',
        doingBusinessAs: 'My cool company',
        registrationNumber: '12345678',
        vatNumber: 'NL000099998B57',
    },
    type: 'organization',
    documentDetails: [
        {
            id: 'SE322LJ223222D5DNKVB65CMP',
        },
    ],
    id: 'SE322LJ223222D5DNKVB65CMP',
    capabilities: {
        sendToTransferInstrument: {
            allowed: false,
            problems: [],
            requested: true,
            verificationStatus: 'pending',
        },
        issueCard: {
            allowed: false,
            problems: [],
            requested: true,
            verificationStatus: 'pending',
        },
        withdrawFromAtm: {
            allowed: false,
            problems: [],
            requested: true,
            verificationStatus: 'pending',
        },
    },
};

const LEGAL_ENTITY_INDIVIDUAL = {
    capabilities: {
        sendToTransferInstrument: {
            allowed: false,
            requested: true,
            verificationStatus: 'pending',
        },
        receivePayments: {
            allowed: false,
            requested: true,
            verificationStatus: 'pending',
        },
        sendToBalanceAccount: {
            allowed: false,
            requested: true,
            verificationStatus: 'pending',
        },
        receiveFromPlatformPayments: {
            allowed: false,
            requested: true,
            verificationStatus: 'pending',
        },
        receiveFromBalanceAccount: {
            allowed: false,
            requested: true,
            verificationStatus: 'pending',
        },
    },
    individual: {
        email: 'test@test.com',
        phone: {
            number: 61234567890,
            type: 'mobile',
        },
        birthData: {
            dateOfBirth: '1990-04-12',
        },
        name: {
            firstName: 'Simone',
            lastName: 'Hopper',
        },
        residentialAddress: {
            city: 'Amsterdam',
            country: 'NL',
            postalCode: '1011DJ',
            street: 'Simon Carmiggeltstraat',
            street2: '274',
        },
    },
    type: 'individual',
    id: 'LE3222Z223222P5HR37WNF3LJ',
};

const mockedIndividualLegalEntities = [LEGAL_ENTITY_INDIVIDUAL];
const mockedOrganizationLegalEntities = [LEGAL_ENTITY_ORGANIZATION];

const MOCKED_LEGAL_ENTITIES = [...mockedIndividualLegalEntities, ...mockedOrganizationLegalEntities];

module.exports = { LEGAL_ENTITY_ORGANIZATION, LEGAL_ENTITY_INDIVIDUAL, MOCKED_LEGAL_ENTITIES };
