import type { Meta } from '@storybook/vue3';
import type { PaymentLinkSettingsExternalProps } from '../../src';
import { ElementProps, ElementStory } from '@integration-components/testing/storybook-helpers';
import { paymentLinkSettingsMeta } from './meta';
import {
    payByLinkOverviewMockedResponses,
    paymentLinkSettingsMockedResponses,
    paymentLinkThemesMockedResponses,
} from '../../../mocks/mock-server/payByLink';

const meta: Meta<ElementProps<PaymentLinkSettingsExternalProps>> = { ...paymentLinkSettingsMeta, title: 'Mocked/Pay by Link/Payment Link Settings' };

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
            ...payByLinkOverviewMockedResponses.storesMisconfiguration,
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
            ...paymentLinkThemesMockedResponses.themeError,
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
            ...paymentLinkThemesMockedResponses.saveThemesError,
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
            ...paymentLinkSettingsMockedResponses.termsAndConditionsError,
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
            ...paymentLinkSettingsMockedResponses.saveSettingsError,
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
            ...paymentLinkSettingsMockedResponses.permissionError,
        },
    },
};

export default meta;
