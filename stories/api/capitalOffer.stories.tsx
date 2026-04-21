import { Meta } from '@storybook/preact';
import { ElementProps, ElementStory, SessionControls } from '@integration-components/testing/storybook-helpers';
import { EMPTY_SESSION_OBJECT } from '@integration-components/testing/storybook-helpers';
import { capitalOfferMeta } from '../components/capitalOffer';
import { CapitalOffer } from '../../src';

const meta: Meta<ElementProps<typeof CapitalOffer>> = { ...capitalOfferMeta, title: 'API-connected/Capital/Capital Offer' };

export const Default: ElementStory<typeof CapitalOffer, SessionControls> = {
    name: 'Default',
    argTypes: {
        session: { control: 'object' },
    },
    args: {
        session: EMPTY_SESSION_OBJECT,
    },
};

export default meta;
