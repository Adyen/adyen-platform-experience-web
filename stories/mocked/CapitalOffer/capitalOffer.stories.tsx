import { Meta } from '@storybook/preact';
import { ElementProps, ElementStory, SetupControls } from '../../utils/types';
import { capitalOfferWithSetupMeta } from '../../components/capitalOffer';
import { CapitalOffer, CapitalOverview, ILegalEntity } from '../../../src';
import { CapitalOfferMockedResponses } from '../../../mocks/mock-server/capital';

const meta: Meta<ElementProps<typeof CapitalOffer> & SetupControls> = { ...capitalOfferWithSetupMeta, title: 'Mocked/Capital Offer' };

export const Default: ElementStory<typeof CapitalOffer> = {
    name: 'Default',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: {
            handlers: CapitalOfferMockedResponses.default,
        },
    },
};

export const UnsupportedRegion: ElementStory<typeof CapitalOverview, { mountIfInUnsupportedRegion: boolean; legalEntity: ILegalEntity }> = {
    name: 'Unsupported region',
    args: {
        mockedApi: true,
        skipDecorators: true,
        mountIfInUnsupportedRegion: true,
        legalEntity: {
            countryCode: 'TR',
            region: 'Middle East',
        },
    },
};

export default meta;
