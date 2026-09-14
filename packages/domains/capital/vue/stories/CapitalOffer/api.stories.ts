import { ElementProps, ElementStory, EMPTY_SESSION_OBJECT, SessionControls } from '@integration-components/testing/storybook-helpers';
import type { Meta } from '@storybook/vue3';
import { CapitalOfferElement } from '../../src';
import { capitalOfferMeta } from './meta';

const meta: Meta<ElementProps<typeof CapitalOfferElement>> = { ...capitalOfferMeta, title: 'API-connected/Capital/Capital Offer' };

export const Default: ElementStory<typeof CapitalOfferElement, SessionControls> = {
    name: 'Default',
    argTypes: {
        session: { control: 'object' },
    },
    args: {
        session: EMPTY_SESSION_OBJECT,
    },
};

export default meta;
