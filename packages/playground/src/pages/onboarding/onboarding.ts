import '../../utils/createPages.js';
import '../../assets/style/style.scss';
import KycSdk from '@adyen/adyen-kyc-components';
import '@adyen/adyen-kyc-components/styles.css';

import { enableServerInMockedMode } from '../../endpoints/mock-server/utils';
import { ExistingLegalEntity } from '@adyen/adyen-kyc-components/dist/types/core/models/api/legal-entity';

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

enableServerInMockedMode()
    .then(async () => {
        let locale: 'en-US' | 'es-ES' = 'en-US' as const;

        const kyc = new KycSdk({
            locale: 'en-US',
            environment: 'http://localhost:3030/',
            clientKey: 'this.clientKey',
            country: 'ES',
        });
        const individualKycDropin = kyc.create('companySearchDropin', {
            handleFindAddress: async () => ({} as any),
            handleCompanyIndexSearch: async () => ({} as any),
            handleAddressSearch: async () => ({} as any),
            handleCompanyDeepSearch: async () => ({} as any),
            handleGetCompanyDataset: async () => ({} as any),
            handleRefreshCompanyDataset: async () => ({} as any),
            handleGetDocument: async () => ({} as any),
            handleCreateDocument: async () => ({} as any),
            handleVerifyTin: async () => ({} as any),
            handleUpdateDocument: async () => ({} as any),
            handleUpdateLegalEntity: async () => ({} as any),
            country: 'US',
            legalEntityResponse: {
                ...getLegalEntityResponse_Company_Private_noProblems.value,
            },
        });

        individualKycDropin.mount('.onboarding-container');

        // new Theme({ primary: '#8b2f00', neutral: '#ffe6c9', label: '#1d1d1d', outline: '#ff0000' }).apply();
    })
    .catch(console.error);
