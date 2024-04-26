import { ExistingLegalEntity } from '../../src/core/models/api/legal-entity';
import { MockEntry } from '../mockEntry';

export const getLegalEntityResponse_Trust_noProblems = {
    name: 'Trust (no problems)',
    value: {
        entityAssociations: [
            {
                name: 'Test Settlor',
                entityType: 'individual',
                legalEntityId: 'LE322LJ223222D5DMQQ7FFGT2',
                type: 'settlor',
                associatorId: 'LE_getLegalEntityResponse_Trust_noProblems',
            },
            {
                associatorId: 'LE_getLegalEntityResponse_Trust_noProblems',
                legalEntityId: 'LE_getLegalEntityResponse_Company_Missing_Data',
                type: 'protector',
                entityType: 'organization',
                name: 'Trust member company',
            },
            {
                associatorId: 'LE_getLegalEntityResponse_Trust_noProblems',
                entityType: 'individual',
                legalEntityId: 'LE_getLegalEntityResponse_Individual_noProblems',
                name: 'James Bond',
                settlorExemptionReason: ['contributionBelowThreshold', 'professionalServiceProvider'],
                type: 'settlor',
            },
        ],
        trust: {
            name: 'Example Trust',
            doingBusinessAs: 'Cool trust',
            type: 'fixedUnitTrust',
            countryOfGoverningLaw: 'AU',
            taxInformation: [
                {
                    country: 'AU',
                    type: 'ABN',
                    number: '12345678900',
                },
            ],
            registrationNumber: '12345678',
            registeredAddress: {
                street: 'My street',
                street2: '1',
                city: 'Sydney',
                postalCode: '2010',
                stateOrProvince: 'NSW',
                country: 'AU',
            },
            undefinedBeneficiaryInfo: [
                {
                    description: 'Not born yet',
                    reference: 'Undefined_Beneficiary_Reference_1',
                },
                {
                    description: 'Future Husband',
                    reference: 'Undefined_Beneficiary_Reference_2',
                },
            ],
        },
        type: 'trust',
        id: 'LE_getLegalEntityResponse_Trust_noProblems',
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

export const getLegalEntityResponse_TrustOfIndividual = {
    name: 'Trust of Individual',
    value: {
        ...getLegalEntityResponse_Trust_noProblems.value,
        id: 'LE_getLegalEntityResponse_TrustOfIndividual',
        entityAssociations: [
            {
                name: 'Test Settlor',
                entityType: 'individual',
                type: 'settlor',
                legalEntityId: 'LE_getLegalEntityResponse_Individual_Part_Of_Trust',
                associatorId: 'LE_getLegalEntityResponse_TrustOfIndividual',
            },
        ],
    } as unknown as ExistingLegalEntity,
};

export const getLegalEntityResponse_TrustOfCompany = {
    name: 'Trust of Company',
    value: {
        ...getLegalEntityResponse_Trust_noProblems.value,
        id: 'LE_getLegalEntityResponse_TrustOfCompany',
        entityAssociations: [
            {
                name: 'Test Company with Trust',
                entityType: 'organization',
                legalEntityId: 'LE_getLegalEntityResponse_TrustOfCompany',
                associatorId: 'LE_getLegalEntityResponse_Company_Part_Of_Trust',
                type: 'protector',
            },
        ],
    } as unknown as ExistingLegalEntity,
};

export const getLegalEntityResponse_TrustOfCompany_US = {
    name: 'Trust of Company (US)',
    value: {
        ...getLegalEntityResponse_Trust_noProblems.value,
        id: 'LE_getLegalEntityResponse_TrustOfCompany_US',
        entityAssociations: [
            {
                name: 'Test Company with Trust US',
                entityType: 'organization',
                legalEntityId: 'LE_getLegalEntityResponse_TrustOfCompany_US',
                associatorId: 'LE_getLegalEntityResponse_Company_Part_Of_Trust_US',
                type: 'protector',
            },
        ],
    } as unknown as ExistingLegalEntity,
};

export const getLegalEntityResponseCompanyWithTrustMember = {
    name: 'Company (with trust member)',
    value: {
        capabilities: {
            useCardInRestrictedIndustriesCommercial: {
                allowed: 'false',
                requested: 'true',
                requestedLevel: 'low',
                requestedSettings: {
                    amountPerIndustry: {
                        4814: {
                            currency: 'EUR',
                            value: 15000,
                        },
                    },
                },
                verificationStatus: 'pending',
            },
            issueCardCommercial: {
                allowed: 'false',
                requested: 'true',
                verificationStatus: 'pending',
            },
            authorisedPaymentInstrumentUser: {
                allowed: 'false',
                requested: 'true',
                verificationStatus: 'pending',
            },
            useCardCommercial: {
                allowed: 'false',
                requested: 'true',
                verificationStatus: 'pending',
            },
            withdrawFromAtmCommercial: {
                allowed: 'false',
                requested: 'true',
                requestedLevel: 'medium',
                requestedSettings: {
                    interval: 'daily',
                    maxAmount: {
                        currency: 'EUR',
                        value: 75000,
                    },
                },
                verificationStatus: 'pending',
            },
            sendToTransferInstrument: {
                allowed: 'false',
                requested: 'true',
                verificationStatus: 'pending',
            },
        },
        entityAssociations: [
            {
                associatorId: 'LE_getLegalEntityResponseCompanyWithTrustMember',
                legalEntityId: getLegalEntityResponse_Trust_noProblems.value.id,
                type: 'trust',
                entityType: 'trust',
                name: 'Bob Trust',
            },
            {
                name: 'Test Settlor',
                entityType: 'individual',
                legalEntityId: 'LE322LJ223222D5DMQQ7FFGT2',
                type: 'settlor',
                associatorId: 'LE_getLegalEntityResponse_Trust_noProblems',
            },
            {
                associatorId: 'LE_getLegalEntityResponse_Trust_noProblems',
                legalEntityId: 'LE_getLegalEntityResponse_Company_Missing_Data',
                type: 'protector',
                entityType: 'organization',
                name: 'Trust member company',
            },
        ],
        organization: {
            legalName: 'My company',
            doingBusinessAs: 'My company',
            registeredAddress: {
                city: 'city',
                country: 'AU',
                postalCode: '1111',
                street: 'My street 1',
                street2: 'L',
                stateOrProvince: 'ACT',
            },
            type: 'privateCompany',
        },
        type: 'organization',
        id: 'LE_getLegalEntityResponseCompanyWithTrustMember',
    } as unknown as ExistingLegalEntity,
};

export const getLegalEntityResponseCompanyWithOutTrust = {
    name: 'Company (without trust)',
    value: {
        capabilities: {
            useCardInRestrictedIndustriesCommercial: {
                allowed: 'false',
                requested: 'true',
                requestedLevel: 'low',
                requestedSettings: {
                    amountPerIndustry: {
                        4814: {
                            currency: 'EUR',
                            value: 15000,
                        },
                    },
                },
                verificationStatus: 'pending',
            },
            issueCardCommercial: {
                allowed: 'false',
                requested: 'true',
                verificationStatus: 'pending',
            },
            authorisedPaymentInstrumentUser: {
                allowed: 'false',
                requested: 'true',
                verificationStatus: 'pending',
            },
            useCardCommercial: {
                allowed: 'false',
                requested: 'true',
                verificationStatus: 'pending',
            },
            withdrawFromAtmCommercial: {
                allowed: 'false',
                requested: 'true',
                requestedLevel: 'medium',
                requestedSettings: {
                    interval: 'daily',
                    maxAmount: {
                        currency: 'EUR',
                        value: 75000,
                    },
                },
                verificationStatus: 'pending',
            },
            sendToTransferInstrument: {
                allowed: 'false',
                requested: 'true',
                verificationStatus: 'pending',
            },
        },
        organization: {
            legalName: 'My company',
            doingBusinessAs: 'My company',
            registeredAddress: {
                city: 'city',
                country: 'AU',
                postalCode: '1111',
                street: 'My street 1',
                street2: 'L',
                stateOrProvince: 'ACT',
            },
            type: 'privateCompany',
            registrationNumber: '123456789',
            taxInformation: [
                {
                    country: 'AU',
                    type: 'ABN',
                    number: '12345678900',
                },
            ],
        },
        type: 'organization',
        id: 'LE_getLegalEntityResponseCompanyWithOutTrustMember',
    } as unknown as ExistingLegalEntity,
};

export const getLegalEntityResponseIndividualWithOutTrust_AU = {
    name: 'Individual (without trust, AU)',
    value: {
        capabilities: {
            useCardInRestrictedIndustriesCommercial: {
                allowed: 'false',
                requested: 'true',
                requestedLevel: 'low',
                verificationStatus: 'pending',
            },
            issueCardCommercial: {
                allowed: 'false',
                requested: 'true',
                verificationStatus: 'pending',
            },
            authorisedPaymentInstrumentUser: {
                allowed: 'false',
                requested: 'true',
                verificationStatus: 'pending',
            },
            useCardCommercial: {
                allowed: 'false',
                requested: 'true',
                verificationStatus: 'pending',
            },
            withdrawFromAtmCommercial: {
                allowed: 'false',
                requested: 'true',
                requestedLevel: 'medium',
                verificationStatus: 'pending',
            },
            sendToTransferInstrument: {
                allowed: 'false',
                requested: 'true',
                verificationStatus: 'pending',
            },
        },
        individual: {
            name: {
                firstName: 'Test',
                lastName: 'Individual',
            },
            email: 'test@test.com',
            phone: {
                number: '+31612345678',
                type: 'mobile',
            },
            birthData: {
                dateOfBirth: '1970-01-01',
            },
            identificationData: {
                number: 'RA0123456',
                type: 'passport',
            },
            residentialAddress: {
                city: 'city',
                country: 'AU',
                postalCode: '1111',
                street: 'My street 1',
                street2: 'L',
                stateOrProvince: 'ACT',
            },
        },
        type: 'individual',
        id: 'LE_getLegalEntityResponseIndividualWithOutTrust',
    } as unknown as ExistingLegalEntity,
};

export const getLegalEntityResponse_Individual_Empty_AU = {
    name: 'Individual (empty, AU)',
    value: {
        capabilities: {
            receiveFromPlatformPayments: {
                enabled: 'true',
                requested: 'true',
                allowed: 'false',
                verificationStatus: 'invalid',
            },
            sendToTransferInstrument: {
                enabled: 'true',
                requested: 'true',
                allowed: 'false',
                verificationStatus: 'invalid',
            },
        },
        individual: {
            residentialAddress: {
                country: 'AU',
            },
        },
        type: 'individual',
        id: 'LE_getLegalEntityResponse_Individual_Empty_AU',
    } as unknown as ExistingLegalEntity,
};

export const mockCompaniesRelatedToTrusts = [getLegalEntityResponseCompanyWithTrustMember, getLegalEntityResponseCompanyWithOutTrust];

export const mockTrustLEs: MockEntry<ExistingLegalEntity>[] = [
    ...mockCompaniesRelatedToTrusts,
    getLegalEntityResponse_Trust_noProblems,
    getLegalEntityResponse_TrustOfIndividual,
    getLegalEntityResponse_TrustOfCompany,
    getLegalEntityResponse_TrustOfCompany_US,
    getLegalEntityResponseIndividualWithOutTrust_AU,
    getLegalEntityResponse_Individual_Empty_AU,
];
