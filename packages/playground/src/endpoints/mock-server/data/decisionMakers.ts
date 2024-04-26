import { ExistingLegalEntity } from '../../src/core/models/api/legal-entity';
import { MockEntry } from '../mockEntry';
import { getLegalEntityResponse_Company_Private_noProblems } from './organization';

export const getLegalEntityResponse_Company_Decision_Maker_Verification_Error = {
    name: 'Company (With decision makers, verification errors)',
    value: {
        capabilities: {
            receiveFromThirdParty: {
                allowed: false,
                requested: true,
                verificationStatus: 'pending',
            },
            useCardInRestrictedIndustriesCommercial: {
                allowed: false,
                problems: [
                    {
                        entity: {
                            id: 'LE322KT223222D5FMZMW2FNFD',
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
                                ],
                                type: 'invalidInput',
                            },
                        ],
                    },
                ],
                requested: true,
                requestedLevel: 'low',
                verificationStatus: 'invalid',
            },
            issueBankAccount: {
                allowed: false,
                problems: [
                    {
                        entity: {
                            id: 'LE322KT223222D5FMZMW2FNFD',
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
                                        code: '1_3000',
                                        message: "The user couldn't be verified",
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
                ],
                requested: true,
                verificationStatus: 'invalid',
            },
            receiveFromTransferInstrument: {
                allowed: false,
                problems: [
                    {
                        entity: {
                            id: 'LE322KT223222D5FMZMW2FNFD',
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
                                        code: '1_3000',
                                        message: "The user couldn't be verified",
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
                ],
                requested: true,
                verificationStatus: 'invalid',
            },
            issueCardCommercial: {
                allowed: false,
                problems: [
                    {
                        entity: {
                            id: 'LE322KT223222D5FMZMW2FNFD',
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
                                ],
                                type: 'invalidInput',
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
            sendToTransferInstrument: {
                allowed: true,
                requested: true,
                verificationStatus: 'valid',
            },
            sendToThirdParty: {
                allowed: false,
                requested: true,
                verificationStatus: 'pending',
            },
            receiveFromPlatformPayments: {
                allowed: true,
                requested: true,
                verificationStatus: 'valid',
            },
        },
        entityAssociations: [
            {
                legalEntityId: 'LE322KT223222D5FMZMW2FNFD',
                type: 'uboThroughOwnership',
                associatorId: 'LE_getLegalEntityResponse_Company_Decision_Maker_Verification_Error',
            },
        ],
        organization: {
            doingBusinessAs: 'Trading name',
            legalName: 'Baisc Company',
            registeredAddress: {
                city: 'asd',
                country: 'NL',
                postalCode: '1087AB',
                street: '2',
                street2: '2',
            },
            registrationNumber: '00000000',
            vatAbsenceReason: 'belowTaxThreshold',
            type: 'privateCompany',
        },
        type: 'organization',
        id: 'LE_getLegalEntityResponse_Company_Decision_Maker_Verification_Error',
    } as unknown as ExistingLegalEntity,
};

export const getLegalEntityResponse_Company_All_DecisionMakers = {
    name: 'Company (All decision makers)',
    value: {
        ...getLegalEntityResponse_Company_Private_noProblems.value,
        id: 'LE_getLegalEntityResponse_Company_All_DecisionMakers',
        entityAssociations: [
            {
                jobTitle: 'CFO1',
                legalEntityId: 'LE322LJ223222D5DMQQ7FFGT1',
                type: 'signatory',
                associatorId: 'LE_getLegalEntityResponse_Company_All_DecisionMakers',
            },
            {
                jobTitle: 'CFO2',
                legalEntityId: 'LE322LJ223222D5DMQQ7FFGT2',
                type: 'signatory',
                associatorId: 'LE_getLegalEntityResponse_Company_All_DecisionMakers',
            },
            {
                jobTitle: 'CFO3',
                legalEntityId: 'LE322LJ223222D5DMQQ7FFGT3',
                type: 'signatory',
                associatorId: 'LE_getLegalEntityResponse_Company_All_DecisionMakers',
            },
            {
                jobTitle: 'CFO4',
                legalEntityId: 'LE322LJ223222D5DMQQ7FFGT4',
                type: 'signatory',
                associatorId: 'LE_getLegalEntityResponse_Company_All_DecisionMakers',
            },
            {
                jobTitle: 'Owner1',
                legalEntityId: 'LE322LJ223222D5DMQQ7FFGT5',
                type: 'uboThroughOwnership',
                associatorId: 'LE_getLegalEntityResponse_Company_All_DecisionMakers',
            },
            {
                jobTitle: 'Owner2',
                legalEntityId: 'LE322LJ223222D5DMQQ7FFGT6',
                type: 'uboThroughOwnership',
                associatorId: 'LE_getLegalEntityResponse_Company_All_DecisionMakers',
            },
            {
                jobTitle: 'Owner3',
                legalEntityId: 'LE322LJ223222D5DMQQ7FFGT7',
                type: 'uboThroughOwnership',
                associatorId: 'LE_getLegalEntityResponse_Company_All_DecisionMakers',
            },
            {
                jobTitle: 'Owner4',
                legalEntityId: 'LE322LJ223222D5DMQQ7FFGT8',
                type: 'uboThroughOwnership',
                associatorId: 'LE_getLegalEntityResponse_Company_All_DecisionMakers',
            },
            {
                jobTitle: 'Controller1',
                legalEntityId: 'LE322LJ223222D5DMQQ7FFGA1',
                type: 'uboThroughControl',
                associatorId: 'LE_getLegalEntityResponse_Company_All_DecisionMakers',
            },
            {
                jobTitle: 'Controller2',
                legalEntityId: 'LE322LJ223222D5DMQQ7FFGA2',
                type: 'uboThroughControl',
                associatorId: 'LE_getLegalEntityResponse_Company_All_DecisionMakers',
            },
            {
                jobTitle: 'Controller3',
                legalEntityId: 'LE322LJ223222D5DMQQ7FFGA3',
                type: 'uboThroughControl',
                associatorId: 'LE_getLegalEntityResponse_Company_All_DecisionMakers',
            },
            {
                jobTitle: 'Controller4',
                legalEntityId: 'LE322LJ223222D5DMQQ7FFGA4',
                type: 'uboThroughControl',
                associatorId: 'LE_getLegalEntityResponse_Company_All_DecisionMakers',
            },
        ],
    } as ExistingLegalEntity,
};

export const getLegalEntityResponse_Company_Verification_Errors_Decision_Makers = {
    name: 'Company (Some decision makers have verification errors)',
    value: {
        capabilities: {
            receiveFromBalanceAccount: {
                allowed: true,
                requested: true,
                verificationStatus: 'valid',
            },
            issueCardConsumer: {
                allowed: false,
                problems: [
                    {
                        entity: {
                            id: 'LE3224M223222D5FW63B4FSLQ',
                            type: 'LegalEntity',
                        },
                        verificationErrors: [
                            {
                                code: '1_34',
                                message: "Image of the ID document didn't meet requirements",
                                remediatingActions: [
                                    {
                                        code: '1_303',
                                        message: 'Upload a different image of the ID document',
                                    },
                                ],
                                subErrors: [
                                    {
                                        code: '1_3016',
                                        message: 'The ID document image was of too low quality',
                                        remediatingActions: [
                                            {
                                                code: '1_303',
                                                message: 'Upload a different image of the ID document',
                                            },
                                        ],
                                        type: 'invalidInput',
                                    },
                                ],
                                type: 'invalidInput',
                            },
                            {
                                code: '1_10',
                                message: "Information couldn't be verified",
                                remediatingActions: [
                                    {
                                        code: '1_101',
                                        message: 'Contact Support',
                                    },
                                ],
                                subErrors: [
                                    {
                                        code: '1_1002',
                                        message: 'There are more questions about the submitted information',
                                        remediatingActions: [
                                            {
                                                code: '1_101',
                                                message: 'Contact Support',
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
                            id: 'LE322F8223222D5FW9Z6N99GL',
                            type: 'LegalEntity',
                        },
                        verificationErrors: [
                            {
                                code: '2_8139',
                                message: 'No proof of national ID number available to perform verification',
                                remediatingActions: [
                                    {
                                        code: '1_307',
                                        message: 'Upload a proof of national ID number',
                                    },
                                ],
                                type: 'dataMissing',
                            },
                            {
                                code: '2_8060',
                                message: 'No identification data available to perform verification',
                                remediatingActions: [
                                    {
                                        code: '2_101',
                                        message: "Add 'individual.identificationData' to legal entity",
                                    },
                                ],
                                type: 'dataMissing',
                            },
                            {
                                code: '1_33',
                                message: "ID document didn't meet requirements",
                                remediatingActions: [
                                    {
                                        code: '1_302',
                                        message: 'Upload a different ID document',
                                    },
                                ],
                                subErrors: [
                                    {
                                        code: '1_3027',
                                        message: "The ID document wasn't valid",
                                        remediatingActions: [
                                            {
                                                code: '1_302',
                                                message: 'Upload a different ID document',
                                            },
                                        ],
                                        type: 'invalidInput',
                                    },
                                    {
                                        code: '1_3031',
                                        message: "The ID document wasn't valid",
                                        remediatingActions: [
                                            {
                                                code: '1_302',
                                                message: 'Upload a different ID document',
                                            },
                                        ],
                                        type: 'invalidInput',
                                    },
                                ],
                                type: 'invalidInput',
                            },
                            {
                                code: '2_8082',
                                message: 'No ID number available to perform verification',
                                remediatingActions: [
                                    {
                                        code: '2_101',
                                        message: "Add 'individual.identificationData' to legal entity",
                                    },
                                ],
                                type: 'dataMissing',
                            },
                        ],
                    },
                    {
                        entity: {
                            id: 'LE_getLegalEntityResponse_Company_Verification_Errors_Decision_Makers',
                            type: 'LegalEntity',
                        },
                        verificationErrors: [
                            {
                                code: '1_50',
                                message: "Organization details couldn't be verified",
                                subErrors: [
                                    {
                                        code: '1_5015',
                                        message: "The registration number didn't match the legal business name",
                                        remediatingActions: [
                                            {
                                                code: '1_501',
                                                message: 'Upload a registration document',
                                            },
                                            {
                                                code: '1_500',
                                                message: 'Update organization details',
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
            issueCardCommercial: {
                allowed: false,
                problems: [
                    {
                        entity: {
                            id: 'LE3224M223222D5FW63B4FSLQ',
                            type: 'LegalEntity',
                        },
                        verificationErrors: [
                            {
                                code: '1_34',
                                message: "Image of the ID document didn't meet requirements",
                                remediatingActions: [
                                    {
                                        code: '1_303',
                                        message: 'Upload a different image of the ID document',
                                    },
                                ],
                                subErrors: [
                                    {
                                        code: '1_3016',
                                        message: 'The ID document image was of too low quality',
                                        remediatingActions: [
                                            {
                                                code: '1_303',
                                                message: 'Upload a different image of the ID document',
                                            },
                                        ],
                                        type: 'invalidInput',
                                    },
                                ],
                                type: 'invalidInput',
                            },
                            {
                                code: '1_10',
                                message: "Information couldn't be verified",
                                remediatingActions: [
                                    {
                                        code: '1_101',
                                        message: 'Contact Support',
                                    },
                                ],
                                subErrors: [
                                    {
                                        code: '1_1002',
                                        message: 'There are more questions about the submitted information',
                                        remediatingActions: [
                                            {
                                                code: '1_101',
                                                message: 'Contact Support',
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
                            id: 'LE322F8223222D5FW9Z6N99GL',
                            type: 'LegalEntity',
                        },
                        verificationErrors: [
                            {
                                code: '2_8139',
                                message: 'No proof of national ID number available to perform verification',
                                remediatingActions: [
                                    {
                                        code: '1_307',
                                        message: 'Upload a proof of national ID number',
                                    },
                                ],
                                type: 'dataMissing',
                            },
                            {
                                code: '2_8060',
                                message: 'No identification data available to perform verification',
                                remediatingActions: [
                                    {
                                        code: '2_101',
                                        message: "Add 'individual.identificationData' to legal entity",
                                    },
                                ],
                                type: 'dataMissing',
                            },
                            {
                                code: '1_33',
                                message: "ID document didn't meet requirements",
                                remediatingActions: [
                                    {
                                        code: '1_302',
                                        message: 'Upload a different ID document',
                                    },
                                ],
                                subErrors: [
                                    {
                                        code: '1_3027',
                                        message: "The ID document wasn't valid",
                                        remediatingActions: [
                                            {
                                                code: '1_302',
                                                message: 'Upload a different ID document',
                                            },
                                        ],
                                        type: 'invalidInput',
                                    },
                                    {
                                        code: '1_3031',
                                        message: "The ID document wasn't valid",
                                        remediatingActions: [
                                            {
                                                code: '1_302',
                                                message: 'Upload a different ID document',
                                            },
                                        ],
                                        type: 'invalidInput',
                                    },
                                ],
                                type: 'invalidInput',
                            },
                            {
                                code: '2_8082',
                                message: 'No ID number available to perform verification',
                                remediatingActions: [
                                    {
                                        code: '2_101',
                                        message: "Add 'individual.identificationData' to legal entity",
                                    },
                                ],
                                type: 'dataMissing',
                            },
                        ],
                    },
                    {
                        entity: {
                            id: 'LE_getLegalEntityResponse_Company_Verification_Errors_Decision_Makers',
                            type: 'LegalEntity',
                        },
                        verificationErrors: [
                            {
                                code: '1_50',
                                message: "Organization details couldn't be verified",
                                subErrors: [
                                    {
                                        code: '1_5015',
                                        message: "The registration number didn't match the legal business name",
                                        remediatingActions: [
                                            {
                                                code: '1_501',
                                                message: 'Upload a registration document',
                                            },
                                            {
                                                code: '1_500',
                                                message: 'Update organization details',
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
        entityAssociations: [
            {
                associatorId: 'LE_getLegalEntityResponse_Company_Verification_Errors_Decision_Makers',
                jobTitle: 'Tester',
                legalEntityId: 'LE3224M223222D5FW63B4FSLQ',
                type: 'signatory',
            },
            {
                associatorId: 'LE_getLegalEntityResponse_Company_Verification_Errors_Decision_Makers',
                jobTitle: 'tester',
                legalEntityId: 'LE322F8223222D5FW9Z6N99GL',
                type: 'uboThroughControl',
            },
        ],
        organization: {
            doingBusinessAs: 'test',
            legalName: 'Eduarda test',
            registeredAddress: {
                city: 'AMS',
                country: 'NL',
                postalCode: '1052AA',
                street: 'My street',
                street2: '1',
            },
            registrationNumber: '12345678',
            vatAbsenceReason: 'belowTaxThreshold',
            type: 'privateCompany',
        },
        type: 'organization',
        id: 'LE_getLegalEntityResponse_Company_Verification_Errors_Decision_Makers',
    } as unknown as ExistingLegalEntity,
};

export const mockOrganizationsWithDecisionMakersLEs: MockEntry<ExistingLegalEntity>[] = [
    getLegalEntityResponse_Company_Decision_Maker_Verification_Error,
    getLegalEntityResponse_Company_All_DecisionMakers,
    getLegalEntityResponse_Company_Verification_Errors_Decision_Makers,
];
