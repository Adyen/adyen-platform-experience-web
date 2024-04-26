import { ExistingLegalEntity } from '../../src/core/models/api/legal-entity';
import { LegalEntityType } from '../../src/core/models/api/legal-entity-type';
import { MockEntry } from '../mockEntry';
import { getDocumentDetailForDocument, getDocumentResponse_Document_companyRegistrationDocument } from './document';

export const getLegalEntityResponse_Company_With_State_And_EIN = {
    name: 'Company (With State & EIN)',
    value: {
        id: 'LE_getLegalEntityResponse_Company_With_State_And_EIN',
        type: 'organization',
        organization: {
            legalName: 'Apple',
            registeredAddress: {
                country: 'US',
                stateOrProvince: 'CA',
            },
            taxInformation: [{ number: '123456789', country: 'US', type: 'EIN' }],
        },
        capabilities: {
            sendToTransferInstrument: {
                allowed: 'false',
                problems: [],
                reason: 'Risk classification not completed',
                requested: 'true',
                requestedLevel: 'notApplicable',
                verificationStatus: 'pending',
            },
            issueCard: {
                allowed: 'false',
                problems: [],
                reason: 'Risk classification not completed',
                requested: 'true',
                requestedLevel: 'medium',
                verificationStatus: 'pending',
            },
            withdrawFromAtm: {
                allowed: 'false',
                problems: [],
                reason: 'Risk classification not completed',
                requested: 'true',
                requestedLevel: 'medium',
                verificationStatus: 'pending',
            },
        },
    } as unknown as ExistingLegalEntity,
};

export const getLegalEntityResponse_Company_Private_noProblems = {
    name: 'Company (Private, no problems)',
    value: {
        entityAssociations: [
            {
                jobTitle: 'CFO',
                legalEntityId: 'LE322LJ223222D5DMQQ7FFGT2',
                type: 'signatory',
                associatorId: 'LE_getLegalEntityResponse_Company_Private_noProblems',
                name: 'Jess Bezos',
            },
            {
                jobTitle: 'Owner',
                legalEntityId: 'LE322LJ223222D5DMQQ7FFGT1',
                type: 'uboThroughOwnership',
                associatorId: 'LE_getLegalEntityResponse_Company_Private_noProblems',
                name: 'Jim Cook',
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
        id: 'LE_getLegalEntityResponse_Company_Private_noProblems',
        capabilities: {
            sendToTransferInstrument: {
                allowed: 'false',
                problems: [],
                reason: 'Risk classification not completed',
                requested: 'true',
                requestedLevel: 'notApplicable',
                verificationStatus: 'pending',
            },
            issueCard: {
                allowed: 'false',
                problems: [],
                reason: 'Risk classification not completed',
                requested: 'true',
                requestedLevel: 'medium',
                verificationStatus: 'pending',
            },
            withdrawFromAtm: {
                allowed: 'false',
                problems: [],
                reason: 'Risk classification not completed',
                requested: 'true',
                requestedLevel: 'medium',
                verificationStatus: 'pending',
            },
        },
    } as unknown as ExistingLegalEntity,
};

export const getLegalEntityResponse_Company_Private_noProblems_US = {
    name: 'Company (Private, no problems, US)',
    value: {
        entityAssociations: [
            {
                jobTitle: 'CFO',
                legalEntityId: 'LE322LJ223222D5DMQQ7FFGT2',
                type: 'signatory',
                associatorId: 'LE_getLegalEntityResponse_Company_Private_noProblems_US',
                name: 'Jess Bezos',
            },
            {
                jobTitle: 'Owner',
                legalEntityId: 'LE322LJ223222D5DMQQ7FFGT1',
                type: 'uboThroughOwnership',
                associatorId: 'LE_getLegalEntityResponse_Company_Private_noProblems_US',
                name: 'Jim Cook',
            },
        ],
        organization: {
            legalName: 'My company',
            registeredAddress: {
                city: 'City',
                country: 'US',
                stateOrProvince: 'IL',
                postalCode: '60614',
                street: 'My street 1',
                street2: 'L',
            },
            type: 'privateCompany',
            doingBusinessAs: 'My cool company',
            taxInformation: [{ country: 'US', type: 'EIN', number: '123456789' }],
        },
        type: 'organization',
        id: 'LE_getLegalEntityResponse_Company_Private_noProblems_US',
        capabilities: {
            sendToTransferInstrument: {
                allowed: 'false',
                problems: [],
                reason: 'Risk classification not completed',
                requested: 'true',
                requestedLevel: 'notApplicable',
                verificationStatus: 'pending',
            },
            issueCard: {
                allowed: 'false',
                problems: [],
                reason: 'Risk classification not completed',
                requested: 'true',
                requestedLevel: 'medium',
                verificationStatus: 'pending',
            },
            withdrawFromAtm: {
                allowed: 'false',
                problems: [],
                reason: 'Risk classification not completed',
                requested: 'true',
                requestedLevel: 'medium',
                verificationStatus: 'pending',
            },
        },
    } as unknown as ExistingLegalEntity,
};

export const getLegalEntityResponse_Company_Private_noProblems_RegDoc = {
    name: 'Company (Private, no problems w/ reg doc)',
    value: {
        ...getLegalEntityResponse_Company_Private_noProblems.value,
        documentDetails: [
            getDocumentDetailForDocument(
                getDocumentResponse_Document_companyRegistrationDocument('LE_getLegalEntityResponse_Company_Private_noProblems')
            ),
        ],
    } as unknown as ExistingLegalEntity,
};

export const getLegalEntityResponse_Company_Private_bankProblems = {
    name: '',
    value: {
        entityAssociations: [
            {
                jobTitle: 'CFO',
                legalEntityId: 'LE322LJ223222D5DMQQ7FFGT2',
                type: 'signatory',
                associatorId: 'LE_getLegalEntityResponse_Company_Private_bankProblems',
            },
            {
                jobTitle: 'Owner',
                legalEntityId: 'LE322LJ223222D5DMQQ7FFGT1',
                type: 'uboThroughOwnership',
                associatorId: 'LE_getLegalEntityResponse_Company_Private_bankProblems',
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
            doingBusinessAs: 'Not great company but still good',
            registrationNumber: '12345678',
            vatNumber: 'NL000099998B57',
        },
        type: 'organization',
        id: 'LE_getLegalEntityResponse_Company_Private_bankProblems',
        capabilities: {
            sendToTransferInstrument: {
                allowed: false,
                problems: [
                    {
                        entity: {
                            documents: ['SE_DOCU_getLegalEntityResponse_Company_Private_bankProblems'],
                            id: 'transferInstrumentDataMock_NL_Missing_Data',
                            type: 'BankAccount',
                        },
                        verificationErrors: [
                            {
                                code: '1_75',
                                message: "Bank document didn't meet requirements",
                                remediatingActions: [
                                    {
                                        code: '1_704',
                                        message: 'Upload a different bank document',
                                    },
                                ],
                                subErrors: [
                                    {
                                        code: '1_7012',
                                        message: "The account owner name and the legal business name didn't match",
                                        remediatingActions: [
                                            {
                                                code: '1_704',
                                                message: 'Upload a different bank document',
                                            },
                                        ],
                                        type: 'invalidInput',
                                    },
                                    {
                                        code: '1_7019',
                                        message: "The bank document wasn't issued in the past 12 months",
                                        remediatingActions: [
                                            {
                                                code: '1_704',
                                                message: 'Upload a different bank document',
                                            },
                                        ],
                                        type: 'invalidInput',
                                    },
                                ],
                                type: 'invalidInput',
                            },
                        ],
                    },
                ],
                requested: true,
                verificationStatus: 'invalid',
            },
        },
    } as unknown as ExistingLegalEntity,
};

export const getLegalEntityResponseCompany_ReviewError = {
    name: 'Company (Review Error)',
    value: {
        capabilities: {
            receiveFromBalanceAccount: {
                allowed: false,
                problems: [
                    {
                        entity: {
                            id: 'LE_getLegalEntityResponseCompany_ReviewError',
                            type: 'LegalEntity',
                        },
                        verificationErrors: [
                            {
                                code: '3_10',
                                message: 'Review of data is required',
                                remediatingActions: [
                                    {
                                        code: '3_100',
                                        message: 'Use legalEntities{id}confirmDataReview to indicate that the data is confirmed',
                                    },
                                ],
                                type: 'dataReview',
                            },
                        ],
                    },
                ],
                requested: true,
                verificationStatus: 'rejected',
            },
            sendToTransferInstrument: {
                allowed: false,
                problems: [
                    {
                        entity: {
                            id: 'LE_getLegalEntityResponseCompany_ReviewError',
                            type: 'LegalEntity',
                        },
                        verificationErrors: [
                            {
                                code: '3_10',
                                message: 'Review of data is required',
                                remediatingActions: [
                                    {
                                        code: '3_100',
                                        message: 'Use legalEntities{id}confirmDataReview to indicate that the data is confirmed',
                                    },
                                ],
                                type: 'dataReview',
                            },
                        ],
                    },
                ],
                requested: true,
                verificationStatus: 'invalid',
            },
            sendToBalanceAccount: {
                allowed: false,
                problems: [
                    {
                        entity: {
                            id: 'LE_getLegalEntityResponseCompany_ReviewError',
                            type: 'LegalEntity',
                        },
                        verificationErrors: [
                            {
                                code: '3_10',
                                message: 'Review of data is required',
                                remediatingActions: [
                                    {
                                        code: '3_100',
                                        message: 'Use legalEntities{id}confirmDataReview to indicate that the data is confirmed',
                                    },
                                ],
                                type: 'dataReview',
                            },
                        ],
                    },
                ],
                requested: true,
                verificationStatus: 'invalid',
            },
            receiveFromPlatformPayments: {
                allowed: false,
                problems: [
                    {
                        entity: {
                            id: 'LE_getLegalEntityResponseCompany_ReviewError',
                            type: 'LegalEntity',
                        },
                        verificationErrors: [
                            {
                                code: '3_10',
                                message: 'Review of data is required',
                                remediatingActions: [
                                    {
                                        code: '3_100',
                                        message: 'Use legalEntities{id}confirmDataReview to indicate that the data is confirmed',
                                    },
                                ],
                                type: 'dataReview',
                            },
                        ],
                    },
                ],
                requested: true,
                verificationStatus: 'invalid',
            },
        },
        organization: getLegalEntityResponse_Company_Private_noProblems.value.organization,
        type: 'organization',
        id: 'LE_getLegalEntityResponseCompany_ReviewError',
    } as unknown as ExistingLegalEntity,
};

export const getLegalEntityResponse_Company_Public_noProblems = {
    name: 'Company (Public, no problems)',
    value: {
        ...getLegalEntityResponse_Company_Private_noProblems.value,
        id: 'LE_getLegalEntityResponse_Company_Public_noProblems',
        organization: {
            ...getLegalEntityResponse_Company_Private_noProblems.value.organization,
            type: 'listedPublicCompany',
            stockData: {
                marketIdentifier: 'NVDA',
                stockNumber: '123456789021',
            },
        },
    } as ExistingLegalEntity,
};

export const getLegalEntityResponse_Company_Minimum = {
    name: 'Company (Minimum)',
    value: {
        organization: {
            legalName: 'Cookie Monster Inc.',
            registeredAddress: {
                country: 'NO',
            },
        },
        type: 'organization',
        id: 'LE_getLegalEntityResponse_Company_Missing_Data',
        capabilities: {
            sendToTransferInstrument: {
                allowed: 'false',
                problems: [],
                requested: 'true',
                requestedLevel: 'notApplicable',
                verificationStatus: 'pending',
            },
            issueCard: {
                allowed: 'false',
                problems: [],
                requested: 'true',
                requestedLevel: 'medium',
                verificationStatus: 'invalid',
            },
            withdrawFromAtm: {
                allowed: 'false',
                problems: [],
                reason: 'Risk classification not completed',
                requested: 'true',
                requestedLevel: 'medium',
                verificationStatus: 'pending',
            },
        },
    } as unknown as ExistingLegalEntity,
};

export const getLegalEntityResponse_Company_with_pendingStatus = {
    name: 'Company (Pending status)',
    value: {
        capabilities: {
            issueCardCommercial: {
                allowed: 'false',
                problems: [
                    {
                        entity: {
                            id: 'LE322LZ223222D5FBGKWK7V5D',
                            type: 'LegalEntity',
                        },
                        verificationErrors: [
                            {
                                code: '1_77',
                                message: 'Verification pending',
                                type: 'pendingStatus',
                            },
                            {
                                code: '1_30',
                                message: "Individual details couldn't be verified",
                                remediatingActions: [
                                    {
                                        code: '1_300',
                                        message: 'Update individual details',
                                    },
                                ],
                                subErrors: [
                                    {
                                        code: '1_3001',
                                        message: "The name and date of birth couldn't be verified",
                                        remediatingActions: [
                                            {
                                                code: '1_300',
                                                message: 'Update individual details',
                                            },
                                            {
                                                code: '1_301',
                                                message: 'Upload an ID document',
                                            },
                                        ],
                                        type: 'invalidInput',
                                    },
                                ],
                                type: 'invalidInput',
                            },
                        ],
                    },
                    {
                        entity: {
                            id: 'LE_getLegalEntityResponse_Company_with_pendingStatus',
                            type: 'LegalEntity',
                        },
                        verificationErrors: [
                            {
                                code: '1_77',
                                message: 'Verification pending',
                                type: 'pendingStatus',
                            },
                        ],
                    },
                ],
                requested: 'true',
                verificationStatus: 'pending',
            },
            withdrawFromAtmCommercial: {
                allowed: 'false',
                problems: [
                    {
                        entity: {
                            id: 'LE_getLegalEntityResponse_Company_with_pendingStatus',
                            type: 'LegalEntity',
                        },
                        verificationErrors: [
                            {
                                code: '1_77',
                                message: 'Verification pending',
                                type: 'pendingStatus',
                            },
                        ],
                    },
                    {
                        entity: {
                            id: 'LE322LZ223222D5FBGKWK7V5D',
                            type: 'LegalEntity',
                        },
                        verificationErrors: [
                            {
                                code: '1_77',
                                message: 'Verification pending',
                                type: 'pendingStatus',
                            },
                            {
                                code: '1_30',
                                message: "Individual details couldn't be verified",
                                remediatingActions: [
                                    {
                                        code: '1_300',
                                        message: 'Update individual details',
                                    },
                                ],
                                subErrors: [
                                    {
                                        code: '1_3001',
                                        message: "The name and date of birth couldn't be verified",
                                        remediatingActions: [
                                            {
                                                code: '1_301',
                                                message: 'Upload an ID document',
                                            },
                                            {
                                                code: '1_300',
                                                message: 'Update individual details',
                                            },
                                        ],
                                        type: 'invalidInput',
                                    },
                                ],
                                type: 'invalidInput',
                            },
                        ],
                    },
                    {
                        entity: {
                            id: 'LE322LZ223222D5FBGKVV7TZZ',
                            type: 'LegalEntity',
                        },
                        verificationErrors: [
                            {
                                code: '1_77',
                                message: 'Verification pending',
                                type: 'pendingStatus',
                            },
                            {
                                code: '1_30',
                                message: "Individual details couldn't be verified",
                                remediatingActions: [
                                    {
                                        code: '1_300',
                                        message: 'Update individual details',
                                    },
                                ],
                                subErrors: [
                                    {
                                        code: '1_3006',
                                        message: "The name didn't match the national ID number",
                                        remediatingActions: [
                                            {
                                                code: '1_307',
                                                message: 'Upload a proof of national ID number',
                                            },
                                            {
                                                code: '1_300',
                                                message: 'Update individual details',
                                            },
                                        ],
                                        type: 'invalidInput',
                                    },
                                ],
                                type: 'invalidInput',
                            },
                        ],
                    },
                ],
                requested: 'true',
                requestedLevel: 'medium',
                verificationStatus: 'pending',
            },
            sendToTransferInstrument: {
                allowed: 'false',
                problems: [
                    {
                        entity: {
                            id: 'LE322LZ223222D5FBGKWK7V5D',
                            type: 'LegalEntity',
                        },
                        verificationErrors: [
                            {
                                code: '1_30',
                                message: "Individual details couldn't be verified",
                                remediatingActions: [
                                    {
                                        code: '1_300',
                                        message: 'Update individual details',
                                    },
                                ],
                                subErrors: [
                                    {
                                        code: '1_3006',
                                        message: "The name didn't match the national ID number",
                                        remediatingActions: [
                                            {
                                                code: '1_300',
                                                message: 'Update individual details',
                                            },
                                            {
                                                code: '1_307',
                                                message: 'Upload a proof of national ID number',
                                            },
                                        ],
                                        type: 'invalidInput',
                                    },
                                ],
                                type: 'invalidInput',
                            },
                            {
                                code: '1_77',
                                message: 'Verification pending',
                                type: 'pendingStatus',
                            },
                        ],
                    },
                    {
                        entity: {
                            id: 'LE_getLegalEntityResponse_Company_with_pendingStatus',
                            type: 'LegalEntity',
                        },
                        verificationErrors: [
                            {
                                code: '1_77',
                                message: 'Verification pending',
                                type: 'pendingStatus',
                            },
                        ],
                    },
                    {
                        entity: {
                            id: 'LE322LZ223222D5FBGKVV7TZZ',
                            type: 'LegalEntity',
                        },
                        verificationErrors: [
                            {
                                code: '1_30',
                                message: "Individual details couldn't be verified",
                                remediatingActions: [
                                    {
                                        code: '1_300',
                                        message: 'Update individual details',
                                    },
                                ],
                                subErrors: [
                                    {
                                        code: '1_3002',
                                        message: "The name and national ID number couldn't be verified",
                                        remediatingActions: [
                                            {
                                                code: '1_307',
                                                message: 'Upload a proof of national ID number',
                                            },
                                            {
                                                code: '1_300',
                                                message: 'Update individual details',
                                            },
                                        ],
                                        type: 'invalidInput',
                                    },
                                ],
                                type: 'invalidInput',
                            },
                            {
                                code: '1_77',
                                message: 'Verification pending',
                                type: 'pendingStatus',
                            },
                        ],
                    },
                ],
                requested: 'true',
                verificationStatus: 'pending',
            },
            useCardInRestrictedIndustriesCommercial: {
                allowed: 'false',
                problems: [
                    {
                        entity: {
                            id: 'LE_getLegalEntityResponse_Company_with_pendingStatus',
                            type: 'LegalEntity',
                        },
                        verificationErrors: [
                            {
                                code: '1_77',
                                message: 'Verification pending',
                                type: 'pendingStatus',
                            },
                        ],
                    },
                    {
                        entity: {
                            id: 'LE322LZ223222D5FBGKVV7TZZ',
                            type: 'LegalEntity',
                        },
                        verificationErrors: [
                            {
                                code: '1_77',
                                message: 'Verification pending',
                                type: 'pendingStatus',
                            },
                            {
                                code: '1_30',
                                message: "Individual details couldn't be verified",
                                remediatingActions: [
                                    {
                                        code: '1_300',
                                        message: 'Update individual details',
                                    },
                                ],
                                subErrors: [
                                    {
                                        code: '1_3006',
                                        message: "The name didn't match the national ID number",
                                        remediatingActions: [
                                            {
                                                code: '1_307',
                                                message: 'Upload a proof of national ID number',
                                            },
                                            {
                                                code: '1_300',
                                                message: 'Update individual details',
                                            },
                                        ],
                                        type: 'invalidInput',
                                    },
                                ],
                                type: 'invalidInput',
                            },
                        ],
                    },
                    {
                        entity: {
                            id: 'LE322LZ223222D5FBGKWK7V5D',
                            type: 'LegalEntity',
                        },
                        verificationErrors: [
                            {
                                code: '1_30',
                                message: "Individual details couldn't be verified",
                                remediatingActions: [
                                    {
                                        code: '1_300',
                                        message: 'Update individual details',
                                    },
                                ],
                                subErrors: [
                                    {
                                        code: '1_3004',
                                        message: "The name and residence country couldn't be verified",
                                        remediatingActions: [
                                            {
                                                code: '1_300',
                                                message: 'Update individual details',
                                            },
                                            {
                                                code: '1_305',
                                                message: 'Upload a different proof of residency',
                                            },
                                        ],
                                        type: 'invalidInput',
                                    },
                                ],
                                type: 'invalidInput',
                            },
                            {
                                code: '1_77',
                                message: 'Verification pending',
                                type: 'pendingStatus',
                            },
                        ],
                    },
                ],
                requested: 'true',
                requestedLevel: 'low',
                verificationStatus: 'pending',
            },
            useCardCommercial: {
                allowed: 'false',
                requested: 'true',
                verificationStatus: 'pending',
            },
            authorisedPaymentInstrumentUser: {
                allowed: 'false',
                requested: 'true',
                verificationStatus: 'pending',
            },
        },
        entityAssociations: [
            {
                jobTitle: 'CEO and CTO',
                legalEntityId: 'LE322LZ223222D5FBGKVV7TZZ',
                type: 'signatory',
                associatorId: 'LE_getLegalEntityResponse_Company_with_pendingStatus',
            },
            {
                jobTitle: 'CFO',
                legalEntityId: 'LE322LZ223222D5FBGKWK7V5D',
                type: 'signatory',
                associatorId: 'LE_getLegalEntityResponse_Company_with_pendingStatus',
            },
        ],
        organization: getLegalEntityResponse_Company_Private_noProblems.value.organization,
        type: 'organization',
        id: 'LE_getLegalEntityResponse_Company_with_pendingStatus',
    } as unknown as ExistingLegalEntity,
};

export const getLegalEntityResponse_Company_Verification_Error = {
    name: 'Company (Verification Error)',
    value: {
        entityAssociations: [
            {
                jobTitle: 'CFO',
                name: 'Signatory',
                legalEntityId: 'LE322LJ223222D5DMQQ7FFGT2',
                type: 'signatory',
                associatorId: 'LE_getLegalEntityResponse_Company_Verification_Error',
            },
            {
                jobTitle: 'Owner',
                name: 'Owner',
                legalEntityId: 'LE322LJ223222D5DMQQ7FFGT1',
                type: 'uboThroughOwnership',
                associatorId: 'LE_getLegalEntityResponse_Company_Verification_Error',
            },
        ],
        organization: getLegalEntityResponse_Company_Private_noProblems.value.organization,
        type: 'organization',
        id: 'LE_getLegalEntityResponse_Company_Verification_Error',
        capabilities: {
            sendToTransferInstrument: {
                allowed: 'false',
                problems: [],
                reason: 'Risk classification not completed',
                requested: 'true',
                requestedLevel: 'notApplicable',
                verificationStatus: 'pending',
            },
            issueCard: {
                allowed: 'false',
                problems: [
                    {
                        entity: {
                            id: 'LE_getLegalEntityResponse_Company_Verification_Error',
                            type: 'LegalEntity',
                        },
                        verificationErrors: [
                            {
                                code: '1_50',
                                type: 'invalidInput',
                                message: 'Organization details couldn’t be verified',
                                subErrors: [
                                    {
                                        code: '1_5015',
                                        type: 'invalidInput',
                                        message: "The registration number didn't match the legal business name",
                                        remediatingActions: [
                                            { code: '1_501', message: 'Upload a registration document' },
                                            { code: '1_500', message: 'Update organization details' },
                                        ],
                                    },
                                ],
                            },
                        ],
                    },
                ],
                requested: 'true',
                requestedLevel: 'medium',
                verificationStatus: 'invalid',
            },
            withdrawFromAtm: {
                allowed: 'false',
                problems: [],
                reason: 'Risk classification not completed',
                requested: 'true',
                requestedLevel: 'medium',
                verificationStatus: 'pending',
            },
        },
    } as unknown as ExistingLegalEntity,
};

export const getLegalEntityResponse_With_State_And_EIN_Verification_Error = {
    name: 'Company (With State & EIN, Verification Error)',
    value: {
        entityAssociations: [
            {
                jobTitle: 'CFO',
                name: 'Signatory',
                legalEntityId: 'LE322LJ223222D5DMQQ7FFGT2',
                type: 'signatory',
                associatorId: 'LE_getLegalEntityResponse_With_State_And_EIN_Verification_Error',
            },
            {
                jobTitle: 'Owner',
                name: 'Owner',
                legalEntityId: 'LE322LJ223222D5DMQQ7FFGT1',
                type: 'uboThroughOwnership',
                associatorId: 'LE_getLegalEntityResponse_With_State_And_EIN_Verification_Error',
            },
        ],
        organization: getLegalEntityResponse_Company_With_State_And_EIN.value.organization,
        type: 'organization',
        id: 'LE_getLegalEntityResponse_With_State_And_EIN_Verification_Error',
        capabilities: {
            sendToTransferInstrument: {
                allowed: 'false',
                problems: [],
                reason: 'Risk classification not completed',
                requested: 'true',
                requestedLevel: 'notApplicable',
                verificationStatus: 'pending',
            },
            issueCard: {
                allowed: 'false',
                problems: [
                    {
                        entity: {
                            id: 'LE_getLegalEntityResponse_With_State_And_EIN_Verification_Error',
                            type: 'LegalEntity',
                        },
                        verificationErrors: [
                            {
                                code: '1_50',
                                type: 'invalidInput',
                                message: 'Organization details couldn’t be verified',
                                subErrors: [
                                    {
                                        code: '1_5013',
                                        message: 'The company was not found in the database',
                                        remediatingActions: [
                                            { code: '1_501', message: 'Upload a registration document' },
                                            { code: '1_500', message: 'Update organization details' },
                                        ],
                                        type: 'invalidInput',
                                    },
                                    {
                                        code: '1_5015',
                                        message: "The registration number didn't match the legal business name",
                                        remediatingActions: [
                                            { code: '1_501', message: 'Upload a registration document' },
                                            { code: '1_500', message: 'Update organization details' },
                                        ],
                                        type: 'invalidInput',
                                    },
                                ],
                            },
                        ],
                    },
                ],
                requested: 'true',
                requestedLevel: 'medium',
                verificationStatus: 'invalid',
            },
            withdrawFromAtm: {
                allowed: 'false',
                problems: [],
                reason: 'Risk classification not completed',
                requested: 'true',
                requestedLevel: 'medium',
                verificationStatus: 'pending',
            },
        },
    } as unknown as ExistingLegalEntity,
};

export const getLegalEntityResponse_Company_Verification_Error_Single_Child_Single_Remediation = {
    name: 'Company (Verification Error, single child remediation)',
    value: {
        entityAssociations: [
            {
                jobTitle: 'CFO',
                legalEntityId: 'LE322LJ223222D5DMQQ7FFGT2',
                type: 'signatory',
                associatorId: 'LE_getLegalEntityResponse_Company_Verification_Error_Single_Child_Single_Remediation',
            },
            {
                jobTitle: 'Owner',
                legalEntityId: 'LE322LJ223222D5DMQQ7FFGT1',
                type: 'uboThroughOwnership',
                associatorId: 'LE_getLegalEntityResponse_Company_Verification_Error_Single_Child_Single_Remediation',
            },
        ],
        organization: getLegalEntityResponse_Company_Private_noProblems.value.organization,
        type: 'organization',
        documentDetails: [
            getDocumentDetailForDocument(
                getDocumentResponse_Document_companyRegistrationDocument(
                    'LE_getLegalEntityResponse_Company_Verification_Error_Single_Child_Single_Remediation'
                )
            ),
        ],
        id: 'LE_getLegalEntityResponse_Company_Verification_Error_Single_Child_Single_Remediation',
        capabilities: {
            sendToTransferInstrument: {
                allowed: 'false',
                problems: [],
                reason: 'Risk classification not completed',
                requested: 'true',
                requestedLevel: 'notApplicable',
                verificationStatus: 'pending',
            },
            issueCard: {
                allowed: 'false',
                problems: [
                    {
                        entity: {
                            id: 'LE_getLegalEntityResponse_Company_Verification_Error_Single_Child_Single_Remediation',
                            type: 'LegalEntity',
                        },
                        verificationErrors: [
                            {
                                code: '1_50',
                                type: 'invalidInput',
                                message: 'Organization details couldn’t be verified',
                                subErrors: [
                                    {
                                        code: '1_5021',
                                        type: 'invalidInput',
                                        message: 'The registration document was too low quality.',
                                        remediatingActions: [{ code: '1_502', message: 'Upload a different registration document' }],
                                    },
                                ],
                            },
                        ],
                    },
                ],
                requested: 'true',
                requestedLevel: 'medium',
                verificationStatus: 'invalid',
            },
            withdrawFromAtm: {
                allowed: 'false',
                problems: [],
                reason: 'Risk classification not completed',
                requested: 'true',
                requestedLevel: 'medium',
                verificationStatus: 'pending',
            },
        },
    } as unknown as ExistingLegalEntity,
};

export const getLegalEntityResponse_Company_Verification_Errors_Two = {
    name: 'Company (Verification Errors, two)',
    value: {
        entityAssociations: [
            {
                jobTitle: 'CFO',
                legalEntityId: 'LE322LJ223222D5DMQQ7FFGT2',
                type: 'signatory',
                associatorId: 'LE_getLegalEntityResponse_Company_Verification_Errors_Two',
            },
            {
                jobTitle: 'Owner',
                legalEntityId: 'LE322LJ223222D5DMQQ7FFGT1',
                type: 'uboThroughOwnership',
                associatorId: 'LE_getLegalEntityResponse_Company_Verification_Errors_Two',
            },
        ],
        organization: getLegalEntityResponse_Company_Private_noProblems.value.organization,
        type: 'organization',
        id: 'LE_getLegalEntityResponse_Company_Verification_Errors_Two',
        capabilities: {
            sendToTransferInstrument: {
                allowed: 'false',
                problems: [],
                reason: 'Risk classification not completed',
                requested: 'true',
                requestedLevel: 'notApplicable',
                verificationStatus: 'pending',
            },
            issueCard: {
                allowed: 'false',
                problems: [
                    {
                        entity: {
                            id: 'LE_getLegalEntityResponse_Company_Verification_Errors_Two',
                            type: 'LegalEntity',
                        },
                        verificationErrors: [
                            {
                                code: '1_50',
                                type: 'invalidInput',
                                message: 'Organization details couldn’t be verified',
                                subErrors: [
                                    {
                                        code: '1_5015',
                                        type: 'invalidInput',
                                        message: "The registration number didn't match the legal business name",
                                        remediatingActions: [
                                            { code: '1_501', message: 'Upload a registration document' },
                                            { code: '1_500', message: 'Update organization details' },
                                        ],
                                    },
                                    {
                                        code: '1_5001',
                                        type: 'invalidInput',
                                        message: "The tax ID number couldn't be verified",
                                        remediatingActions: [
                                            { code: '1_503', message: 'Upload a tax document' },
                                            { code: '1_500', message: 'Update organization details' },
                                        ],
                                    },
                                ],
                            },
                        ],
                    },
                ],
                requested: 'true',
                requestedLevel: 'medium',
                verificationStatus: 'invalid',
            },
            withdrawFromAtm: {
                allowed: 'false',
                problems: [],
                reason: 'Risk classification not completed',
                requested: 'true',
                requestedLevel: 'medium',
                verificationStatus: 'pending',
            },
        },
    } as unknown as ExistingLegalEntity,
};

export const getLegalEntityResponse_Company_Verification_Errors_Max = {
    name: 'Company (Verification Errors, max)',
    value: {
        entityAssociations: [
            {
                jobTitle: 'CFO',
                legalEntityId: 'LE322LJ223222D5DMQQ7FFGT2',
                type: 'signatory',
                associatorId: 'LE_getLegalEntityResponse_Company_Verification_Errors_Max',
            },
            {
                jobTitle: 'Owner',
                legalEntityId: 'LE322LJ223222D5DMQQ7FFGT1',
                type: 'uboThroughOwnership',
                associatorId: 'LE_getLegalEntityResponse_Company_Verification_Errors_Max',
            },
        ],
        organization: getLegalEntityResponse_Company_Private_noProblems.value.organization,
        type: 'organization',
        id: 'LE_getLegalEntityResponse_Company_Verification_Errors_Max',
        capabilities: {
            sendToTransferInstrument: {
                allowed: 'false',
                problems: [],
                reason: 'Risk classification not completed',
                requested: 'true',
                requestedLevel: 'notApplicable',
                verificationStatus: 'pending',
            },
            issueCard: {
                allowed: 'false',
                problems: [
                    {
                        entity: {
                            id: 'LE_getLegalEntityResponse_Company_Verification_Errors_Max',
                            type: 'LegalEntity',
                        },
                        verificationErrors: [
                            {
                                code: '1_50',
                                type: 'invalidInput',
                                message: 'Organization details couldn’t be verified',
                                subErrors: [
                                    {
                                        code: '1_5015',
                                        type: 'invalidInput',
                                        message: "The registration number didn't match the legal business name",
                                        remediatingActions: [
                                            { code: '1_501', message: 'Upload a registration document' },
                                            { code: '1_500', message: 'Update organization details' },
                                        ],
                                    },
                                    {
                                        code: '1_5001',
                                        type: 'invalidInput',
                                        message: "The tax ID number couldn't be verified",
                                        remediatingActions: [
                                            { code: '1_501', message: 'Upload a registration document' },
                                            { code: '1_500', message: 'Update organization details' },
                                        ],
                                    },
                                    {
                                        code: '1_5000',
                                        type: 'invalidInput',
                                        message: "The legal business name couldn't be verified.",
                                        remediatingActions: [
                                            { code: '1_501', message: 'Upload a registration document' },
                                            { code: '1_500', message: 'Update organization details' },
                                        ],
                                    },
                                ],
                            },
                        ],
                    },
                ],
                requested: 'true',
                requestedLevel: 'medium',
                verificationStatus: 'invalid',
            },
            withdrawFromAtm: {
                allowed: 'false',
                problems: [],
                reason: 'Risk classification not completed',
                requested: 'true',
                requestedLevel: 'medium',
                verificationStatus: 'pending',
            },
        },
    } as unknown as ExistingLegalEntity,
};

export const getLegalEntityResponse_Company_All_EntityAssociations = {
    name: 'Company (All entity associations)',
    value: {
        ...getLegalEntityResponse_Company_Private_noProblems.value,
        id: 'LE_getLegalEntityResponse_Company_All_EntityAssociations',
        entityAssociations: [
            {
                jobTitle: 'CFO1',
                legalEntityId: 'LE_DECISION_MAKER_ID_1',
                type: 'signatory',
                associatorId: 'LE_getLegalEntityResponse_Company_All_EntityAssociations',
                name: 'test1',
                entityType: 'individual',
            },
            {
                jobTitle: 'CFO2',
                legalEntityId: 'LE_DECISION_MAKER_ID_2',
                type: 'signatory',
                associatorId: 'LE_getLegalEntityResponse_Company_All_EntityAssociations',
                name: 'test2',
                entityType: 'individual',
            },
            {
                legalEntityId: 'LE_TRUST_MEMBER_ID_1',
                type: 'protector',
                associatorId: 'LE_TRUST_ID',
                name: 'test3',
                entityType: 'individual',
            },
            {
                legalEntityId: 'LE_TRUST_ID',
                type: 'trust',
                associatorId: 'LE_getLegalEntityResponse_Company_All_EntityAssociations',
                name: 'test4',
                entityType: 'trust',
            },
            {
                legalEntityId: 'LE_TRUST_MEMBER_ID_2',
                type: 'uboThroughOwnership',
                associatorId: 'LE_TRUST_ID',
                name: 'test5',
                entityType: 'individual',
            },
        ],
    } as ExistingLegalEntity,
};

export const getLegalEntityResponse_Company_Part_Of_Trust = {
    name: 'Company (Part of trust)',
    value: {
        ...getLegalEntityResponse_Company_Private_noProblems.value,
        id: 'LE_getLegalEntityResponse_Company_Part_Of_Trust',
        entityAssociations: [
            {
                legalEntityId: 'LE_getLegalEntityResponse_TrustOfCompany',
                type: 'trust',
                entityType: LegalEntityType.TRUST,
                associatorId: 'LE_getLegalEntityResponse_Company_Part_Of_Trust',
            },
        ],
    } as ExistingLegalEntity,
};

export const getLegalEntityResponse_Company_Part_Of_Trust_US = {
    name: 'Company (Part of trust, US)',
    value: {
        ...getLegalEntityResponse_Company_Private_noProblems_US.value,
        id: 'LE_getLegalEntityResponse_Company_Part_Of_Trust_US',
        entityAssociations: [
            {
                legalEntityId: 'LE_getLegalEntityResponse_TrustOfCompany_US',
                type: 'trust',
                entityType: LegalEntityType.TRUST,
                associatorId: 'LE_getLegalEntityResponse_Company_Part_Of_Trust_US',
            },
        ],
    } as ExistingLegalEntity,
};

export const getLegalEntityResponse_Company_Part_Of_Trust_With_Trust_Doc_Error = {
    name: 'Company (Part of trust, trust doc error)',
    value: {
        ...getLegalEntityResponse_Company_Private_noProblems.value,
        id: 'LE_getLegalEntityResponse_Company_Part_Of_Trust_With_Trust_Doc_Error',
        entityAssociations: [
            {
                legalEntityId: 'LE322LJ223222D5DNKV645CJY',
                type: 'trust',
                entityType: LegalEntityType.TRUST,
                associatorId: 'LE_getLegalEntityResponse_Company_Part_Of_Trust_With_Trust_Doc_Error',
            },
        ],
        capabilities: {
            sendToTransferInstrument: {
                allowed: 'false',
                problems: [],
                reason: 'Risk classification not completed',
                requested: 'true',
                requestedLevel: 'notApplicable',
                verificationStatus: 'pending',
            },
            issueCard: {
                allowed: 'false',
                problems: [
                    {
                        entity: { id: 'LE322LJ223222D5DNKV645CJY', type: 'LegalEntity' },
                        verificationErrors: [
                            {
                                code: '1_60',
                                type: 'invalidInput',
                                message: "Legal entity details couldn't be verified",
                                subErrors: [
                                    {
                                        code: '1_6000',
                                        message: "The legal name couldn't be verified",
                                        remediatingActions: [{ code: '1_601', message: 'Upload a export constitutional document' }],
                                    },
                                ],
                            },
                        ],
                    },
                ],
                requested: 'true',
                requestedLevel: 'medium',
                verificationStatus: 'invalid',
            },
            withdrawFromAtm: {
                allowed: 'false',
                problems: [],
                reason: 'Risk classification not completed',
                requested: 'true',
                requestedLevel: 'medium',
                verificationStatus: 'pending',
            },
        },
    } as unknown as ExistingLegalEntity,
};

export const getLegalEntityResponse_Company_DataMissing_VatNumber_Errors = {
    name: 'Company (Data missing: VAT number)',
    value: {
        capabilities: {
            receiveFromBalanceAccount: {
                allowed: true,
                requested: true,
                verificationStatus: 'valid',
            },
            sendToTransferInstrument: {
                allowed: false,
                problems: [
                    {
                        entity: {
                            id: 'getLegalEntityResponse_Company_DataMissing_VatNumber_Errors',
                            type: 'LegalEntity',
                        },
                        verificationErrors: [
                            {
                                code: '2_8179',
                                message: "'vatNumber' or 'vatAbsenceReason' was missing",
                                remediatingActions: [
                                    {
                                        code: '2_158',
                                        message: "Add 'organization.vatNumber' to legal entity.",
                                    },
                                ],
                                type: 'dataMissing',
                            },
                        ],
                    },
                ],
                requested: true,
                transferInstruments: [
                    {
                        allowed: false,
                        id: 'SE3222Z223222Q5J65G9L6GVT',
                        requested: true,
                        verificationStatus: 'pending',
                    },
                ],
                verificationStatus: 'pending',
            },
        },
        entityAssociations: [
            {
                associatorId: 'getLegalEntityResponse_Company_DataMissing_VatNumber_Errors',
                entityType: 'individual',
                jobTitle: 'CEO',
                legalEntityId: 'LE3222Z223222Q5HX5D3G3QRS',
                name: 'Eran Test',
                type: 'uboThroughControl',
            },
            {
                associatorId: 'getLegalEntityResponse_Company_DataMissing_VatNumber_Errors',
                entityType: 'individual',
                jobTitle: 'CEO',
                legalEntityId: 'LE3222Z223222Q5HX5D3G3QRS',
                name: 'Eran Test',
                type: 'signatory',
            },
        ],
        organization: {
            phone: {
                number: '+36204349712',
                type: 'mobile',
            },
            doingBusinessAs: 'The best around',
            legalName: 'My company',
            principalPlaceOfBusiness: {
                city: 'SJC',
                country: 'GB',
                postalCode: 'IG11 7RY',
                street: 'Luiz Fernandes',
                street2: '135',
            },
            registeredAddress: {
                city: 'City',
                country: 'GB',
                postalCode: 'IG11 7RY',
                street: 'My street 1',
                street2: 'L',
            },
            registrationNumber: '12345678',
            type: 'privateCompany',
        },
        type: 'organization',
        id: 'getLegalEntityResponse_Company_DataMissing_VatNumber_Errors',
        transferInstruments: [
            {
                id: 'SE3222Z223222Q5J65G9L6GVT',
                accountIdentifier: 'NL**ABNA******3619',
                trustedSource: false,
            },
        ],
    } as unknown as ExistingLegalEntity,
};

export const getLegalEntityResponse_Company_DataMissing_RegDoc_Errors = {
    name: 'Company (Data missing: Reg doc)',
    value: {
        capabilities: {
            receiveFromBalanceAccount: {
                allowed: true,
                requested: true,
                verificationStatus: 'valid',
            },
            sendToTransferInstrument: {
                allowed: false,
                problems: [
                    {
                        entity: {
                            id: 'getLegalEntityResponse_Company_DataMissing_RegDoc_Errors',
                            type: 'LegalEntity',
                        },
                        verificationErrors: [
                            {
                                code: '2_8141',
                                message: "'Registration document' was missing.",
                                remediatingActions: [
                                    {
                                        code: '1_501',
                                        message: 'Upload a registration document',
                                    },
                                ],
                                type: 'dataMissing',
                            },
                        ],
                    },
                ],
                requested: true,
                transferInstruments: [
                    {
                        allowed: false,
                        id: 'SE3222Z223222Q5J65G9L6GVT',
                        requested: true,
                        verificationStatus: 'pending',
                    },
                ],
                verificationStatus: 'pending',
            },
        },
        entityAssociations: [
            {
                associatorId: 'getLegalEntityResponse_Company_DataMissing_RegDoc_Errors',
                entityType: 'individual',
                jobTitle: 'CEO',
                legalEntityId: 'LE3222Z223222Q5HX5D3G3QRS',
                name: 'Eran Test',
                type: 'uboThroughControl',
            },
            {
                associatorId: 'getLegalEntityResponse_Company_DataMissing_RegDoc_Errors',
                entityType: 'individual',
                jobTitle: 'CEO',
                legalEntityId: 'LE3222Z223222Q5HX5D3G3QRS',
                name: 'Eran Test',
                type: 'signatory',
            },
        ],
        organization: {
            doingBusinessAs: 'Rader Test Company',
            legalName: 'Rader Test Company',
            registeredAddress: {
                city: 'Toronto',
                country: 'CA',
                postalCode: 'M5J2P1',
                stateOrProvince: 'ON',
                street: '123 Fake St',
                street2: '8th Floor',
            },
            registrationNumber: '123456',
            type: 'privateCompany',
        },
        type: 'organization',
        id: 'getLegalEntityResponse_Company_DataMissing_RegDoc_Errors',
        transferInstruments: [
            {
                id: 'SE3222Z223222Q5J65G9L6GVT',
                accountIdentifier: 'NL**ABNA******3619',
                trustedSource: false,
            },
        ],
    } as unknown as ExistingLegalEntity,
};

export const getLegalEntityResponse_Company_DataMissing_RegDoc_Errors_US = {
    name: 'Company (Data missing: Reg doc US)',
    value: {
        capabilities: {
            receiveFromBalanceAccount: {
                allowed: true,
                requested: true,
                verificationStatus: 'valid',
            },
            sendToTransferInstrument: {
                allowed: false,
                problems: [
                    {
                        entity: {
                            id: 'LE_getLegalEntityResponse_Company_DataMissing_RegDoc_Errors_US',
                            type: 'LegalEntity',
                        },
                        verificationErrors: [
                            {
                                code: '2_8141',
                                message: "'Registration document' was missing.",
                                remediatingActions: [
                                    {
                                        code: '1_501',
                                        message: 'Upload a registration document',
                                    },
                                ],
                                type: 'dataMissing',
                            },
                        ],
                    },
                ],
                requested: true,
                transferInstruments: [
                    {
                        allowed: false,
                        id: 'SE3222Z223222Q5J65G9L6GVT',
                        requested: true,
                        verificationStatus: 'pending',
                    },
                ],
                verificationStatus: 'pending',
            },
        },
        entityAssociations: [
            {
                associatorId: 'LE_getLegalEntityResponse_Company_DataMissing_RegDoc_Errors_US',
                entityType: 'individual',
                jobTitle: 'CEO',
                legalEntityId: 'LE3222Z223222Q5HX5D3G3QRS',
                name: 'Test CEO',
                type: 'uboThroughControl',
            },
            {
                associatorId: 'LE_getLegalEntityResponse_Company_DataMissing_RegDoc_Errors_US',
                entityType: 'individual',
                jobTitle: 'CEO',
                legalEntityId: 'LE3222Z223222Q5HX5D3G3QRS',
                name: 'Test CEO',
                type: 'signatory',
            },
        ],
        organization: {
            doingBusinessAs: 'Test Company',
            legalName: 'Test Company',
            registeredAddress: {
                city: 'Chicago',
                country: 'US',
                postalCode: '60614',
                stateOrProvince: 'IL',
                street: '123 Fake St',
                street2: '8th Floor',
            },
            taxInformation: [{ country: 'US', number: '123456789', type: 'EIN' }],
            type: 'privateCompany',
        },
        type: 'organization',
        id: 'LE_getLegalEntityResponse_Company_DataMissing_RegDoc_Errors_US',
        transferInstruments: [
            {
                id: 'SE3222Z223222Q5J65G9L6GVT',
                accountIdentifier: 'NL**ABNA******3619',
                trustedSource: false,
            },
        ],
    } as unknown as ExistingLegalEntity,
};

export const getLegalEntityResponse_Company_DataMissing_DecisionMakers = {
    name: 'Company (Data missing: decision makers)',
    value: {
        entityAssociations: [
            {
                jobTitle: 'Owner',
                name: 'Owner',
                legalEntityId: 'LE322LJ223222D5DMQQ7FFGT1',
                type: 'uboThroughOwnership',
                associatorId: 'LE_getLegalEntityResponse_Company_DataMissing_DecisionMakers',
            },
        ],
        capabilities: {
            receiveFromPlatformPayments: {
                allowed: true,
                requested: true,
                verificationStatus: 'valid',
            },
            receiveFromTransferInstrument: {
                allowed: false,
                problems: [
                    {
                        entity: {
                            id: 'LE_getLegalEntityResponse_Company_DataMissing_DecisionMakers',
                            type: 'LegalEntity',
                        },
                        verificationErrors: [
                            {
                                code: '2_8189',
                                message: "'UBO through control' was missing.",
                                remediatingActions: [
                                    {
                                        code: '2_151',
                                        message: "Add 'organization.entityAssociations' of type 'uboThroughControl' to legal entity",
                                    },
                                ],
                                type: 'dataMissing',
                            },
                            {
                                code: '2_8067',
                                message: "'Signatory' was missing.",
                                remediatingActions: [
                                    {
                                        code: '2_124',
                                        message: "Add 'organization.entityAssociations' of type 'signatory' to legal entity",
                                    },
                                ],
                                type: 'dataMissing',
                            },
                        ],
                    },
                ],
                requested: true,
                verificationStatus: 'invalid',
            },
            sendToTransferInstrument: {
                allowed: false,
                problems: [
                    {
                        entity: {
                            id: 'LE_getLegalEntityResponse_Company_DataMissing_DecisionMakers',
                            type: 'LegalEntity',
                        },
                        verificationErrors: [
                            {
                                code: '2_8189',
                                message: "'UBO through control' was missing.",
                                remediatingActions: [
                                    {
                                        code: '2_151',
                                        message: "Add 'organization.entityAssociations' of type 'uboThroughControl' to legal entity",
                                    },
                                ],
                                type: 'dataMissing',
                            },
                            {
                                code: '2_8067',
                                message: "'Signatory' was missing.",
                                remediatingActions: [
                                    {
                                        code: '2_124',
                                        message: "Add 'organization.entityAssociations' of type 'signatory' to legal entity",
                                    },
                                ],
                                type: 'dataMissing',
                            },
                        ],
                    },
                ],
                requested: true,
                requestedSettings: {
                    interval: 'daily',
                    maxAmount: {
                        currency: 'EUR',
                        value: 0,
                    },
                },
                verificationStatus: 'invalid',
            },
            issueCardCommercial: {
                allowed: false,
                problems: [
                    {
                        entity: {
                            id: 'LE_getLegalEntityResponse_Company_DataMissing_DecisionMakers',
                            type: 'LegalEntity',
                        },
                        verificationErrors: [
                            {
                                code: '2_8189',
                                message: "'UBO through control' was missing.",
                                remediatingActions: [
                                    {
                                        code: '2_151',
                                        message: "Add 'organization.entityAssociations' of type 'uboThroughControl' to legal entity",
                                    },
                                ],
                                type: 'dataMissing',
                            },
                            {
                                code: '2_8067',
                                message: "'Signatory' was missing.",
                                remediatingActions: [
                                    {
                                        code: '2_124',
                                        message: "Add 'organization.entityAssociations' of type 'signatory' to legal entity",
                                    },
                                ],
                                type: 'dataMissing',
                            },
                        ],
                    },
                ],
                requested: true,
                verificationStatus: 'invalid',
            },
            sendToBalanceAccount: {
                allowed: false,
                problems: [
                    {
                        entity: {
                            id: 'LE_getLegalEntityResponse_Company_DataMissing_DecisionMakers',
                            type: 'LegalEntity',
                        },
                        verificationErrors: [
                            {
                                code: '2_8189',
                                message: "'UBO through control' was missing.",
                                remediatingActions: [
                                    {
                                        code: '2_151',
                                        message: "Add 'organization.entityAssociations' of type 'uboThroughControl' to legal entity",
                                    },
                                ],
                                type: 'dataMissing',
                            },
                            {
                                code: '2_8067',
                                message: "'Signatory' was missing.",
                                remediatingActions: [
                                    {
                                        code: '2_124',
                                        message: "Add 'organization.entityAssociations' of type 'signatory' to legal entity",
                                    },
                                ],
                                type: 'dataMissing',
                            },
                        ],
                    },
                ],
                requested: true,
                verificationStatus: 'invalid',
            },
            receiveFromBalanceAccount: {
                allowed: true,
                requested: true,
                verificationStatus: 'valid',
            },
        },
        organization: {
            type: 'privateCompany',
            legalName: 'Rader Test Company',
            registeredAddress: {
                country: 'US',
                stateOrProvince: 'IL',
                city: 'Chicago',
                postalCode: '60614',
                street: '123 Fake St',
            },
            taxInformation: [{ number: '123456789', country: 'US', type: 'EIN' }],
        },
        type: 'organization',
        id: 'LE_getLegalEntityResponse_Company_DataMissing_DecisionMakers',
    } as unknown as ExistingLegalEntity,
};

export const companyStockNumberServerValidationError = {
    type: 'https://docs.adyen.com/errors/validation',
    title: 'The request is missing required fields or contains invalid data.',
    status: 422,
    detail: 'Invalid legal entity information provided',
    requestId: 'TCG586Q767MKDM92',
    invalidFields: [
        {
            InvalidField: {
                name: 'stockData.stockNumber',
                value: '123456789012',
                message: 'The value is invalid: ISIN check digit validation failed',
            },
        },
    ],
    errorCode: '30_102',
};

export const usCompanyBranchCodeServerValidationError = {
    type: 'https://docs.adyen.com/errors/validation',
    title: 'The request is missing required fields or contains invalid data.',
    status: 422,
    detail: 'Invalid legal entity information provided',
    requestId: 'NNR8H4GHT3T48ZJ2',
    invalidFields: [
        {
            name: 'bankAccount.branchCode',
            message: 'unknown ABA/routing transit number (wire transfer)',
        },
    ],
    errorCode: '30_102',
};

export const mockOrganizationLEs: MockEntry<ExistingLegalEntity>[] = [
    getLegalEntityResponse_Company_With_State_And_EIN,
    getLegalEntityResponse_Company_Private_noProblems,
    getLegalEntityResponse_Company_Private_noProblems_US,
    getLegalEntityResponse_Company_Private_noProblems_RegDoc,
    getLegalEntityResponseCompany_ReviewError,
    getLegalEntityResponse_Company_Public_noProblems,
    getLegalEntityResponse_Company_Minimum,
    getLegalEntityResponse_Company_with_pendingStatus,
    getLegalEntityResponse_Company_Verification_Error,
    getLegalEntityResponse_With_State_And_EIN_Verification_Error,
    getLegalEntityResponse_Company_Verification_Error_Single_Child_Single_Remediation,
    getLegalEntityResponse_Company_Verification_Errors_Two,
    getLegalEntityResponse_Company_Verification_Errors_Max,
    getLegalEntityResponse_Company_All_EntityAssociations,
    getLegalEntityResponse_Company_Part_Of_Trust,
    getLegalEntityResponse_Company_Part_Of_Trust_US,
    getLegalEntityResponse_Company_Part_Of_Trust_With_Trust_Doc_Error,
    getLegalEntityResponse_Company_DataMissing_VatNumber_Errors,
    getLegalEntityResponse_Company_DataMissing_RegDoc_Errors,
    getLegalEntityResponse_Company_DataMissing_RegDoc_Errors_US,
    getLegalEntityResponse_Company_DataMissing_DecisionMakers,
];
