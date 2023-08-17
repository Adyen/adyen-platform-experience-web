import { getLegalEntityById } from '../../utils/services';
import { Meta, StoryObj } from '@storybook/preact';
import { LEGAL_ENTITY_INDIVIDUAL, LEGAL_ENTITY_ORGANIZATION, LEGAL_ENTITY_ORGANIZATION_WITH_TI } from '../../../../../mocks';
import { Container } from '../utils/Container';
import { LegalEntityDetailsProps } from '@adyen/adyen-fp-web';

const LEGAL_ENTITY = {
    Organization: process.env.VITE_ORG_LEGAL_ENTITY_ID,
    Individual: process.env.VITE_IND_LEGAL_ENTITY_ID,
    ['Sole Proprietorship']: process.env.VITE_SOLE_PROPRIETORSHIP_LEGAL_ENTITY_ID,
};

interface ILegalEntityScreen {
    customId?: string;
    legalEntityType?: string;
    legalEntityProps: LegalEntityDetailsProps;
}

const meta: Meta<ILegalEntityScreen> = {
    title: 'screens/LegalEntity',
    render: (args, context) => {
        return <Container type={'legalEntityDetails'} componentConfiguration={args.legalEntityProps} context={context} />;
    },
};
export default meta;

export const OrganizationNoTI: StoryObj<ILegalEntityScreen> = {
    args: {
        legalEntityProps: { legalEntity: LEGAL_ENTITY_ORGANIZATION },
    },
};

export const OrganizationWithTI: StoryObj<ILegalEntityScreen> = {
    args: {
        legalEntityProps: { legalEntity: LEGAL_ENTITY_ORGANIZATION_WITH_TI },
    },
};

export const Individual: StoryObj<ILegalEntityScreen> = {
    args: {
        legalEntityProps: { legalEntity: LEGAL_ENTITY_INDIVIDUAL },
    },
};
export const ApiIntegration: StoryObj<ILegalEntityScreen> = {
    argTypes: {
        customId: { control: 'text' },
        legalEntityType: {
            control: 'select',
            options: Object.keys(LEGAL_ENTITY),
            mapping: LEGAL_ENTITY,
        },
    },
    args: {
        legalEntityType: Object.keys(LEGAL_ENTITY)[0],
    },
    loaders: [
        async context => ({
            data: await getLegalEntityById(context.args.customId || context.args.legalEntityType),
        }),
    ],
    render: (args, context) => {
        const props: LegalEntityDetailsProps = {
            ...args.legalEntityProps,
            legalEntity: context.loaded.data,
        };
        return <Container type={'legalEntityDetails'} componentConfiguration={props} context={context} />;
    },
};
