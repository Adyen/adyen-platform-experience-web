import { Meta } from '@storybook/preact';
import { Story } from '../utils/story';
import LegalEntityDetails from '@adyen/adyen-fp-web/components/LegalEntityDetails/components/LegalEntityDetails/LegalEntityDetails';
import { LEGAL_ENTITY_INDIVIDUAL, LEGAL_ENTITY_ORGANIZATION, LEGAL_ENTITY_ORGANIZATION_WITH_TI } from '../../../../../mocks';

const DEFAULT_LEGAL_ENTITY_ID = 'LE322KH223222Q5J3VPCHFH82';

export default {
    component: LegalEntityDetails,
} satisfies Meta<typeof LegalEntityDetails>;

export const OrganizationNoTI: Story<typeof LegalEntityDetails> = {
    args: {
        legalEntity: LEGAL_ENTITY_ORGANIZATION,
    },
    /* loaders: [
        async () => ({
            data: await getLegalEntityById(DEFAULT_LEGAL_ENTITY_ID),
        }),
    ], */
};

export const OrganizationWithTI = {
    args: {
        legalEntity: LEGAL_ENTITY_ORGANIZATION_WITH_TI,
    },
};

export const Individual = {
    args: {
        legalEntity: LEGAL_ENTITY_INDIVIDUAL,
    },
};
