import { ExistingLegalEntity } from '../../src/core/models/api/legal-entity';
import { MockEntry } from '../mockEntry';
import { getDocumentDetailForDocument, getDocumentResponse_Document_identityCard, getDocumentResponse_Document_proofOfResidency } from './document';
import { LE_Mock_Individual_with_Sole_Prop_NL_valid } from './soleProprietorship';
import { transferInstrumentDataMock_US_overview } from './transferInstrument';
import { getLegalEntityResponse_Individual_Empty_AU, getLegalEntityResponseIndividualWithOutTrust_AU } from './trust';

export const getLegalEntityResponse_Individual_Verification_Error = {
    name: 'Individual (Verification Error)',
    value: {
        capabilities: {
            issueCardCommercial: {
                allowed: 'false',
                problems: [
                    {
                        entity: {
                            id: 'LE_getLegalEntityResponse_Individual_Verification_Error',
                            type: 'LegalEntity',
                        },
                        verificationErrors: [
                            {
                                code: '1_30',
                                message: "Individual details couldn't be verified",
                                type: 'invalidInput',
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
                                    {
                                        code: '1_3000',
                                        message: "The user couldn't be verified",
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
                                    {
                                        code: '1_3002',
                                        message: "The name and national ID number couldn't be verified",
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
                                    {
                                        code: '1_3003',
                                        message: "The name and residence state couldn't be verified",
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
                            },
                        ],
                    },
                ],
                requested: 'true',
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
        individual: {
            phone: {
                number: '+15556661234',
                type: 'mobile',
            },
            birthData: {
                dateOfBirth: '1990-09-27',
            },
            identificationData: {
                number: '1234',
                type: 'nationalIdNumber',
            },
            name: {
                firstName: 'Hannibal',
                lastName: 'Lecter',
            },
            email: 'test@test.com',
            residentialAddress: {
                city: 'chicago',
                country: 'US',
                postalCode: '10814',
                stateOrProvince: 'AL',
                street: 'a street',
                street2: 'street2',
            },
        },
        type: 'individual',
        documentDetails: [
            getDocumentDetailForDocument(getDocumentResponse_Document_proofOfResidency('LE_getLegalEntityResponse_Individual_Verification_Error')),
        ],
        id: 'LE_getLegalEntityResponse_Individual_Verification_Error',
    } as unknown as ExistingLegalEntity,
};

export const getLegalEntityResponse_Individual_SSN_Verification_Error = {
    name: 'Individual (SSN Verification Error)',
    value: {
        capabilities: {
            issueCardCommercial: {
                allowed: 'false',
                problems: [
                    {
                        entity: {
                            id: 'getLegalEntityResponse_Individual_SSN_Verification_Error',
                            type: 'LegalEntity',
                        },
                        verificationErrors: [
                            {
                                code: '1_30',
                                message: "Individual details couldn't be verified",
                                type: 'invalidInput',
                                remediatingActions: [
                                    {
                                        code: '1_300',
                                        message: 'Update individual details',
                                    },
                                ],
                                subErrors: [
                                    {
                                        code: '1_3062',
                                        message: 'Update your personal details or provide a 9 digit SSN',
                                        remediatingActions: [
                                            {
                                                code: '1_316',
                                                message:
                                                    'Provide complete 9-digits Social Security Number number or upload an ID document if you don’t have SSN.',
                                            },
                                        ],
                                        type: 'invalidInput',
                                    },
                                ],
                            },
                        ],
                    },
                ],
                requested: 'true',
                verificationStatus: 'pending',
            },
        },
        individual: {
            phone: {
                number: '+15556661234',
                type: 'mobile',
            },
            birthData: {
                dateOfBirth: '1990-09-27',
            },
            identificationData: {
                type: 'nationalIdNumber',
                number: '1234',
            },
            name: {
                firstName: 'Hannibal',
                lastName: 'Lecter',
            },
            email: 'test@test.com',
            residentialAddress: {
                city: 'chicago',
                country: 'US',
                postalCode: '10814',
                stateOrProvince: 'AL',
                street: 'a street',
                street2: 'street2',
            },
        },
        type: 'individual',
        id: 'getLegalEntityResponse_Individual_SSN_Verification_Error',
    } as unknown as ExistingLegalEntity,
};

export const getLegalEntityResponse_Individual_Missing_Data = {
    name: 'Individual (Missing Data)',
    value: {
        capabilities: {
            receiveFromPlatformPayments: {
                enabled: 'true',
                requested: 'true',
                allowed: 'false',
                problems: [
                    {
                        entity: {
                            id: 'LE_getLegalEntityResponse_Individual_Missing_Data',
                            type: 'Documents',
                        },
                        verificationErrors: [
                            {
                                code: '2_8079',
                                message: 'No ID card available to perform verification.',
                                remediatingActions: [
                                    {
                                        code: '1_301',
                                        message: 'Upload an ID document',
                                    },
                                ],
                                type: 'dataMissing',
                            },
                        ],
                    },
                ],
                verificationStatus: 'invalid',
            },
            sendToTransferInstrument: {
                enabled: 'true',
                requested: 'true',
                allowed: 'false',
                problems: [
                    {
                        entity: {
                            id: 'LE_getLegalEntityResponse_Individual_Missing_Data',
                            type: 'LegalEntity',
                        },
                        verificationErrors: [
                            {
                                code: '2_8079',
                                message: 'No ID card available to perform verification.',
                                remediatingActions: [
                                    {
                                        code: '1_301',
                                        message: 'Upload an ID document',
                                    },
                                ],
                                type: 'dataMissing',
                            },
                        ],
                    },
                ],
                verificationStatus: 'invalid',
            },
        },
        individual: {
            residentialAddress: {
                country: 'US',
            },
        },
        type: 'individual',
        id: 'LE_getLegalEntityResponse_Individual_Missing_Data',
    } as unknown as ExistingLegalEntity,
};

export const getLegalEntityResponse_Individual_noProblems_without_payout = {
    name: 'Individual (No problems, without payout)',
    value: {
        individual: {
            email: 'test@test.com',
            phone: {
                number: '+31612345678',
                type: 'mobile',
            },
            birthData: {
                dateOfBirth: '1970-01-01',
            },
            identificationData: {
                number: '*****6789',
                type: 'nationalIdNumber',
                nationalIdExempt: false,
            },
            name: {
                firstName: 'James',
                lastName: 'Bond',
            },
            nationality: 'NL',
            residentialAddress: {
                city: 'City',
                country: 'US',
                postalCode: '11111',
                stateOrProvince: 'AK',
                street: 'My street',
                street2: '1',
            },
        },
        type: 'individual',
        id: 'getLegalEntityResponse_Individual_noProblems_without_payout',
        capabilities: {
            sendToTransferInstrument: {
                allowed: 'true',
                problems: [],
                requested: 'true',
                requestedLevel: 'notApplicable',
                verificationStatus: 'valid',
                enabled: 'true',
            },
            issueCard: {
                allowed: 'true',
                problems: [],
                requested: 'true',
                requestedLevel: 'medium',
                verificationStatus: 'valid',
                enabled: 'true',
            },
            withdrawFromAtm: {
                allowed: 'true',
                problems: [],
                requested: 'true',
                requestedLevel: 'medium',
                verificationStatus: 'valid',
                enabled: 'true',
            },
        },
    } as unknown as ExistingLegalEntity,
};

export const getLegalEntityResponse_Individual_noProblems = {
    name: 'Individual (No problems)',
    value: {
        ...getLegalEntityResponse_Individual_noProblems_without_payout.value,
        id: 'LE_getLegalEntityResponse_Individual_noProblems',
        transferInstruments: [transferInstrumentDataMock_US_overview],
    } as ExistingLegalEntity,
};

export const getLegalEntityResponse_Individual_Processing = {
    name: 'Individual (Processing)',
    value: {
        capabilities: {
            receiveFromPlatformPayments: {
                enabled: 'true',
                requested: 'true',
                allowed: 'false',
                verificationStatus: 'processing',
            },
            sendToTransferInstrument: {
                enabled: 'true',
                requested: 'true',
                allowed: 'false',
                verificationStatus: 'processing',
            },
        },
        individual: getLegalEntityResponse_Individual_noProblems.value.individual,
        type: 'individual',
        id: 'LE_getLegalEntityResponse_Individual_Processing',
    } as unknown as ExistingLegalEntity,
};

export const getLegalEntityResponse_Individual_noProblems_NL = {
    name: 'Individual (No problems, NL)',
    value: {
        individual: {
            email: 'test@test.com',
            phone: {
                number: '+31612345678',
                type: 'mobile',
            },
            birthData: {
                dateOfBirth: '1970-01-01',
            },
            identificationData: {
                number: '*****6789',
                type: 'nationalIdNumber',
                nationalIdExempt: false,
            },
            name: {
                firstName: 'James',
                lastName: 'Bond',
            },
            nationality: 'NL',
            residentialAddress: {
                city: 'City',
                country: 'NL',
                postalCode: '1111AA',
                street: 'My street',
                street2: '1',
            },
        },
        type: 'individual',
        documentDetails: [
            getDocumentDetailForDocument(getDocumentResponse_Document_identityCard('LE_getLegalEntityResponse_Individual_noProblems_NL')),
        ],
        id: 'LE_getLegalEntityResponse_Individual_noProblems_NL',
        capabilities: {
            sendToTransferInstrument: {
                allowed: 'false',
                problems: [],
                reason: 'Risk classification not completed',
                requested: 'true',
                requestedLevel: 'notApplicable',
                verificationStatus: 'pending',
                enabled: 'false',
            },
            issueCard: {
                allowed: 'false',
                problems: [],
                reason: 'Risk classification not completed',
                requested: 'true',
                requestedLevel: 'medium',
                verificationStatus: 'pending',
                enabled: 'false',
            },
            withdrawFromAtm: {
                allowed: 'false',
                problems: [],
                reason: 'Risk classification not completed',
                requested: 'true',
                requestedLevel: 'medium',
                verificationStatus: 'pending',
                enabled: 'false',
            },
        },
    } as unknown as ExistingLegalEntity,
};

export const getLegalEntityResponse_Individual_Part_Of_Trust = {
    name: 'Individual (Part of Trust)',
    value: {
        ...getLegalEntityResponse_Individual_noProblems.value,
        id: 'LE_getLegalEntityResponse_Individual_Part_Of_Trust',
        entityAssociations: [
            {
                legalEntityId: 'LE_getLegalEntityResponse_TrustOfIndividual',
                type: 'trust',
                associatorId: 'LE_getLegalEntityResponse_Individual_Part_Of_Trust',
                entityType: 'trust',
            },
        ],
    } as ExistingLegalEntity,
};

export const getLegalEntityResponse_Individual_With_SoleProp = {
    name: 'Individual (with Sole Prop)',
    value: {
        ...getLegalEntityResponse_Individual_noProblems_NL.value,
        id: 'LE_getLegalEntityResponse_Individual_With_SoleProp',
        entityAssociations: [
            {
                legalEntityId: 'LE_getLegalEntityResponse_SoleProp_NL',
                type: 'soleProprietorship',
                associatorId: 'LE_getLegalEntityResponse_Individual_With_SoleProp',
                entityType: 'soleProprietorship',
                name: 'Bob SoleProp',
            },
        ],
    } as ExistingLegalEntity,
};

export const getLegalEntityResponse_Individual_With_Pending_RiskClassification = {
    name: 'Individual (with pending risk classification)',
    value: {
        individual: {
            email: 'test@test.com',
            phone: {
                number: '+31612345678',
                type: 'mobile',
            },
            birthData: {
                dateOfBirth: '1990-08-27',
            },
            identificationData: {
                number: '*****1234',
                type: 'nationalIdNumber',
            },
            name: {
                firstName: 'Richard',
                lastName: 'Smith',
            },
            residentialAddress: {
                city: 'City',
                country: 'US',
                postalCode: '11111',
                street: 'My street',
                street2: '1',
            },
        },
        type: 'individual',
        documents: [
            {
                id: 'SE322LJ223222D5DSFC542JPM',
            },
            {
                id: 'SE322LJ223222D5DQZHX52JP2',
            },
        ],
        id: 'LE_getLegalEntityResponse_Individual_With_Pending_RiskClassification',
        capabilities: {
            sendToTransferInstrument: {
                allowed: 'false',
                problems: [],
                reason: 'Risk classification not completed',
                requested: 'true',
                requestedLevel: 'notApplicable',
                verificationStatus: 'pending',
            },
        },
    } as unknown as ExistingLegalEntity,
};
export const getLegalEntityResponse_Individual_With_Pending_RiskClassification_2 = {
    name: 'Individual (with pending risk classification)',
    value: {
        individual: {
            email: 'test@test.com',
            phone: {
                number: '+31612345678',
                type: 'mobile',
            },
            birthData: {
                dateOfBirth: '1990-08-27',
            },
            identificationData: {
                number: '*****1234',
                type: 'nationalIdNumber',
                issuerState: 'US',
            },
            name: {
                firstName: 'Richard',
                lastName: 'Smith',
            },
            nationality: 'NL',
            residentialAddress: {
                city: 'City',
                country: 'US',
                postalCode: '11111',
                stateOrProvince: 'AK',
                street: 'My street',
                street2: '1',
            },
        },
        type: 'individual',
        documents: [
            {
                id: 'SE322LJ223222D5DSFC542JPM',
            },
            {
                id: 'SE322LJ223222D5DQZHX52JP2',
            },
        ],
        id: 'LE_getLegalEntityResponse_Individual_With_Pending_RiskClassification_2',
        capabilities: {
            sendToTransferInstrument: {
                allowed: 'false',
                problems: [],
                reason: 'Risk classification not completed',
                requested: 'true',
                requestedLevel: 'notApplicable',
                verificationStatus: 'pending',
            },
        },
    } as unknown as ExistingLegalEntity,
};

export const mockIndividualLEs: MockEntry<ExistingLegalEntity>[] = [
    getLegalEntityResponse_Individual_noProblems_NL,
    getLegalEntityResponse_Individual_noProblems,
    getLegalEntityResponse_Individual_noProblems_without_payout,
    getLegalEntityResponse_Individual_Verification_Error,
    getLegalEntityResponse_Individual_SSN_Verification_Error,
    getLegalEntityResponse_Individual_Missing_Data,
    getLegalEntityResponse_Individual_Processing,
    getLegalEntityResponse_Individual_Part_Of_Trust,
    getLegalEntityResponse_Individual_With_SoleProp,
    getLegalEntityResponse_Individual_With_Pending_RiskClassification,
    getLegalEntityResponse_Individual_With_Pending_RiskClassification_2,
    getLegalEntityResponse_Individual_Empty_AU,
    getLegalEntityResponseIndividualWithOutTrust_AU,
    LE_Mock_Individual_with_Sole_Prop_NL_valid,
];
