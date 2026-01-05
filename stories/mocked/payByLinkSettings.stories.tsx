import { Meta } from '@storybook/preact';
import { PayByLinkOverview, PayByLinkSettings } from '../../src';
import { ElementProps, ElementStory } from '../utils/types';
import { PayByLinkSettingsMeta } from '../components/payByLinkSettings';
import {
    PayByLinkOverviewMockedResponses,
    PaymentLinkSettingsMockedResponses,
    PaymentLinkThemesMockedResponses,
} from '../../mocks/mock-server/payByLink';

const meta: Meta<ElementProps<typeof PayByLinkSettings>> = { ...PayByLinkSettingsMeta, title: 'Mocked/Pay by link Settings' };

export const Default: ElementStory<typeof PayByLinkSettings> = {
    name: 'Default',
    args: {
        mockedApi: true,
    },
};

export const EmptyStores: ElementStory<typeof PayByLinkOverview> = {
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

export const ThemeError: ElementStory<typeof PayByLinkOverview> = {
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

export const ThemesSaveError: ElementStory<typeof PayByLinkOverview> = {
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

export const SettingsError: ElementStory<typeof PayByLinkOverview> = {
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

export const SettingsSaveError: ElementStory<typeof PayByLinkOverview> = {
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
