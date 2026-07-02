import { Meta } from '@storybook/preact';
import { ElementProps, ElementStory, EMPTY_SESSION_OBJECT, SessionControls } from '@integration-components/testing/storybook-helpers';
import { capitalOfferMeta } from './meta';
import { CapitalOffer } from '@integration-components/capital/preact';

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
