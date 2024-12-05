import { Meta } from '@storybook/preact';
import { ElementProps, ElementStory, SessionControls as SessionControl } from '../utils/types';
import { EMPTY_SESSION_OBJECT } from '../utils/constants';
import { capitalOfferMeta } from '../components/capitalOffer';
import { CapitalOffer } from '../../src';

const meta: Meta<ElementProps<typeof CapitalOffer>> = { ...capitalOfferMeta, title: 'Integration/Capital Offer' };

export const Basic: ElementStory<typeof CapitalOffer, SessionControl> = {
    name: 'Basic',
    argTypes: {
        session: { control: 'object' },
    },
    args: {
        session: EMPTY_SESSION_OBJECT,
    },
};

export default meta;
