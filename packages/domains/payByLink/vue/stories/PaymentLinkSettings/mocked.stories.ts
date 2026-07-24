import type { Meta } from '@storybook/vue3';
import type { PaymentLinkSettingsExternalProps } from '../../src';
import { ElementProps, ElementStory } from '@integration-components/testing/storybook-helpers';
import { PaymentLinkSettingsMeta } from './meta';
import {
    PayByLinkOverviewMockedResponses,
    PaymentLinkSettingsMockedResponses,
    PaymentLinkThemesMockedResponses,
} from '../../../mocks/mock-server/payByLink';

const meta: Meta<ElementProps<PaymentLinkSettingsExternalProps>> = { ...PaymentLinkSettingsMeta, title: 'Mocked/Pay by Link/Payment Link Settings' };

export const Default: ElementStory<PaymentLinkSettingsExternalProps> = {
    name: 'Default',
    args: {
        mockedApi: true,
    },
};

export const EmptyStores: ElementStory<PaymentLinkSettingsExternalProps> = {
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

export const ThemeError: ElementStory<PaymentLinkSettingsExternalProps> = {
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

export const ThemesSaveError: ElementStory<PaymentLinkSettingsExternalProps> = {
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

export const SettingsError: ElementStory<PaymentLinkSettingsExternalProps> = {
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

export const SettingsSaveError: ElementStory<PaymentLinkSettingsExternalProps> = {
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

export const SettingsRoleNotAssigned: ElementStory<PaymentLinkSettingsExternalProps> = {
    name: 'Error - Role not assigned',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: {
            ...PaymentLinkSettingsMockedResponses.permissionError,
        },
    },
};

export default meta;
