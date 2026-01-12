import { Meta } from '@storybook/preact';
import { PaymentLinksOverview, PaymentLinkSettings } from '../../src';
import { ElementProps, ElementStory } from '../utils/types';
import { PaymentLinkSettingsMeta } from '../components/paymentLinkSettings';
import {
    PayByLinkOverviewMockedResponses,
    PaymentLinkSettingsMockedResponses,
    PaymentLinkThemesMockedResponses,
} from '../../mocks/mock-server/payByLink';

const meta: Meta<ElementProps<typeof PaymentLinkSettings>> = { ...PaymentLinkSettingsMeta, title: 'Mocked/Pay By Link/Payment Link Settings' };

export const Default: ElementStory<typeof PaymentLinkSettings> = {
    name: 'Default',
    args: {
        mockedApi: true,
    },
};

export const EmptyStores: ElementStory<typeof PaymentLinksOverview> = {
    name: 'Error - Stores Not Configured',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: {
            ...PayByLinkOverviewMockedResponses.storesMisconfiguration,
        },
    },
};

export const ThemeError: ElementStory<typeof PaymentLinksOverview> = {
    name: 'Error - Theme Error',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: {
            ...PaymentLinkThemesMockedResponses.themeError,
        },
    },
};

export const ThemesSaveError: ElementStory<typeof PaymentLinksOverview> = {
    name: 'Error - Themes Save Error',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: {
            ...PaymentLinkThemesMockedResponses.saveThemesError,
        },
    },
};

export const SettingsError: ElementStory<typeof PaymentLinksOverview> = {
    name: 'Error - Terms and Conditions Error',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: {
            ...PaymentLinkSettingsMockedResponses.termsAndConditionsError,
        },
    },
};

export const SettingsSaveError: ElementStory<typeof PaymentLinksOverview> = {
    name: 'Error - Terms and Conditions Save Error',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: {
            ...PaymentLinkSettingsMockedResponses.saveSettingsError,
        },
    },
};

export default meta;
