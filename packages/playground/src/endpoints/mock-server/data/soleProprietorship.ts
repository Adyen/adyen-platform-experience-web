import { ExistingLegalEntity } from '../../src/core/models/api/legal-entity';
import { MockEntry } from '../mockEntry';

export const getLegalEntityResponse_SoleProp_NL = {
    name: 'Sole Prop (NL)',
    value: {
        soleProprietorship: {
            name: 'Example SoleProp',
            doingBusinessAs: 'Cool SoleProp',
            countryOfGoverningLaw: 'NL',
            vatNumber: 'NL000099998B57',
            vatAbsenceReason: '',
            registrationNumber: '12345678',
            registeredAddress: {
                street: 'My street',
                street2: '1',
                city: 'Sydney',
                postalCode: '1234AA',
                country: 'NL',
            },
        },
        type: 'soleProprietorship',
        id: 'LE_getLegalEntityResponse_SoleProp_NL',
    } as unknown as ExistingLegalEntity,
};

export const getLegalEntityResponse_SoleProp_AU = {
    name: 'Sole Prop (AU)',
    value: {
        soleProprietorship: {
            name: 'Example SoleProp',
            doingBusinessAs: 'Cool SoleProp',
            countryOfGoverningLaw: 'AU',
            registeredAddress: {
                country: 'AU',
            },
        },
        type: 'soleProprietorship',
        id: 'LE_getLegalEntityResponse_SoleProp_AU',
    } as unknown as ExistingLegalEntity,
};

// Mocks for Singapore SoleProp
export const getLegalEntityResponse_SoleProp_SG = {
    name: 'Sole Prop (SG)',
    value: {
        soleProprietorship: {
            countryOfGoverningLaw: 'SG',
            name: 'Sole Prop Test',
            principalPlaceOfBusiness: {
                city: 'Jurong',
                country: 'SG',
                postalCode: '111111',
                street: 'My street',
            },
            registeredAddress: {
                city: 'Jurong',
                country: 'SG',
                postalCode: '111111',
                street: 'My street',
            },
            registrationNumber: '20228888A',
        },
        type: 'soleProprietorship',
        id: 'getLegalEntityResponse_SoleProp_SG',
    } as unknown as ExistingLegalEntity,
};

export const getLegalEntityResponse_Individual_With_SoleProp_verificationError = (soleProp: ExistingLegalEntity) => {
    const country = soleProp.soleProprietorship!.countryOfGoverningLaw;
    const individualLegalEntityId = `LE_getLegalEntityResponse_Individual_With_SoleProp_verificationError_${country}`;

    return {
        capabilities: {
            issueCardCommercial: {
                allowed: false,
                problems: [
                    {
                        entity: {
                            id: soleProp.id,
                            type: 'LegalEntity',
                        },
                        verificationErrors: [
                            {
                                code: '1_60',
                                message: "soleProprietorship details couldn't be verified",
                                remediatingActions: [
                                    {
                                        code: '1_601',
                                        message: 'Upload a export constitutional document',
                                    },
                                ],
                                subErrors: [
                                    {
                                        code: '1_6000',
                                        message: "The soleProprietorship's name couldn't be verified.",
                                        remediatingActions: [
                                            {
                                                code: '1_600',
                                                message: 'Update soleProprietorship details',
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
                associatorId: individualLegalEntityId,
                entityType: 'soleProprietorship',
                legalEntityId: soleProp.id,
                type: 'soleProprietorship',
            },
        ],
        individual: {
            name: {
                firstName: 'James',
                lastName: 'Bond',
            },
            residentialAddress: {
                country: 'US',
            },
        },
        type: 'individual',
        id: individualLegalEntityId,
    } as unknown as ExistingLegalEntity;
};

export const getLegalEntityResponse_Individual_With_SoleProp_valid = (soleProp: ExistingLegalEntity) => {
    const country = soleProp.soleProprietorship!.countryOfGoverningLaw;
    const individualLegalEntityId = `LE_getLegalEntityResponse_Individual_With_SoleProp_valid_${country}`;

    return {
        capabilities: {
            sendToTransferInstrument: {
                allowed: false,
                requested: true,
                verificationStatus: 'valid',
            },
        },
        entityAssociations: [
            {
                associatorId: individualLegalEntityId,
                entityType: 'soleProprietorship',
                legalEntityId: soleProp.id,
                type: 'soleProprietorship',
            },
        ],
        individual: {
            birthData: {
                dateOfBirth: '1990-01-01',
            },
            email: 'angus@burger.com',
            identificationData: {
                nationalIdExempt: false,
                number: '1234',
                type: 'nationalIdNumber',
            },
            name: {
                firstName: 'Angus',
                lastName: 'McBeef',
            },
            phone: {
                number: '+12389124421',
                type: 'mobile',
            },
            residentialAddress: {
                country,
            },
        },
        type: 'individual',
        id: individualLegalEntityId,
    } as unknown as ExistingLegalEntity;
};

export const LE_Mock_Individual_with_Sole_Prop_NL_valid = {
    name: 'Individual with Sole Prop (NL, valid)',
    value: getLegalEntityResponse_Individual_With_SoleProp_valid(getLegalEntityResponse_SoleProp_NL.value),
};
export const LE_Mock_Individual_with_Sole_Prop_AU_valid = {
    name: 'Individual with Sole Prop (AU, valid)',
    value: getLegalEntityResponse_Individual_With_SoleProp_valid(getLegalEntityResponse_SoleProp_AU.value),
};
export const LE_Mock_Individual_with_Sole_Prop_SG_valid = {
    name: 'Individual with Sole Prop (SG, valid)',
    value: getLegalEntityResponse_Individual_With_SoleProp_valid(getLegalEntityResponse_SoleProp_SG.value),
};
export const LE_Mock_Individual_with_Sole_Prop_NL_verificationError = {
    name: 'Individual with Sole Prop (NL, verification error)',
    value: getLegalEntityResponse_Individual_With_SoleProp_verificationError(getLegalEntityResponse_SoleProp_NL.value),
};
export const LE_Mock_Individual_with_Sole_Prop_AU_verificationError = {
    name: 'Individual with Sole Prop (AU, verification error)',
    value: getLegalEntityResponse_Individual_With_SoleProp_verificationError(getLegalEntityResponse_SoleProp_AU.value),
};
export const LE_Mock_Individual_with_Sole_Prop_SG_verificationError = {
    name: 'Individual with Sole Prop (SG, verification error)',
    value: getLegalEntityResponse_Individual_With_SoleProp_verificationError(getLegalEntityResponse_SoleProp_SG.value),
};

export const mockSolePropLEs: MockEntry<ExistingLegalEntity>[] = [
    LE_Mock_Individual_with_Sole_Prop_AU_valid,
    LE_Mock_Individual_with_Sole_Prop_NL_valid,
    LE_Mock_Individual_with_Sole_Prop_SG_valid,
    LE_Mock_Individual_with_Sole_Prop_AU_verificationError,
    LE_Mock_Individual_with_Sole_Prop_NL_verificationError,
    LE_Mock_Individual_with_Sole_Prop_SG_verificationError,
    getLegalEntityResponse_SoleProp_NL,
    getLegalEntityResponse_SoleProp_AU,
    getLegalEntityResponse_SoleProp_SG,
];
