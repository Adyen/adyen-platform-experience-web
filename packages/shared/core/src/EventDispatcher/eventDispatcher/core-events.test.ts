/**
 * @vitest-environment jsdom
 */
import { describe, expect, it, vi } from 'vitest';
import { decodeAnalyticsEvent as decodePayload } from '@integration-components/testing';
import type { GlobalAppearance, WithDataGridAppearance } from '@integration-components/types';
import {
    CORE_EVENT_NAMES,
    getComponentEventSubCategory,
    getCustomizedComponentDataEventProperties,
    getCustomizedComponentEventPayloads,
    getCustomizedComponentStyleEventProperties,
    getInitiatedCoreEventPayload,
    getInitiatedCoreEventProperties,
    getUpdatedThemeEventPayload,
    getUpdatedThemeEventProperties,
} from './core-events';

describe('getInitiatedCoreEventProperties', () => {
    it('reports the defaults of an unconfigured core', () => {
        expect(getInitiatedCoreEventProperties({ onSessionCreate: vi.fn() })).toEqual({
            label: 'core',
            hasCustomTheme: false,
        });
    });

    it('snapshots the theme and appearance configuration', () => {
        expect(
            getInitiatedCoreEventProperties({
                onSessionCreate: vi.fn(),
                themeMode: 'dark',
                customTheme: {
                    light: { primary: '#0050b3' },
                    dark: { primary: '#84adff', roundness: 'medium' },
                },
                appearance: { titles: 'hidden', illustrations: 'visible' },
            })
        ).toEqual({
            label: 'core',
            themeMode: 'dark',
            hasCustomTheme: true,
            // Token names only — brand values must never reach analytics.
            customThemeVariables: ['primary', 'roundness'],
            appearance: ['titles', 'illustrations'],
            appearanceTitles: 'hidden',
            appearanceIllustrations: 'visible',
        });
    });

    it('ignores an empty custom theme', () => {
        const properties = getInitiatedCoreEventProperties({ onSessionCreate: vi.fn(), customTheme: { light: {}, dark: {} } });

        expect(properties).toMatchObject({ hasCustomTheme: false });
        expect(properties).not.toHaveProperty('customThemeVariables');
    });
});

describe('getComponentEventSubCategory', () => {
    it('maps each component to its Overview / Details / Offer section', () => {
        expect(getComponentEventSubCategory('transactions')).toBe('Overview');
        expect(getComponentEventSubCategory('transactionDetails')).toBe('Details');
        expect(getComponentEventSubCategory('capitalOverview')).toBe('Overview');
        expect(getComponentEventSubCategory('capitalOffer')).toBe('Offer');
        expect(getComponentEventSubCategory('payouts')).toBe('Overview');
        expect(getComponentEventSubCategory('payoutDetails')).toBe('Details');
    });

    it('falls back to Overview for untyped integrations', () => {
        expect(getComponentEventSubCategory('unknown' as any)).toBe('Overview');
    });
});

describe('getCustomizedComponentStyleEventProperties', () => {
    it('reports the component and its resolved appearance', () => {
        const appearance: GlobalAppearance & WithDataGridAppearance = { titles: 'hidden', dataGrid: { density: 'condensed' } };

        expect(
            getCustomizedComponentStyleEventProperties({
                componentName: 'transactions',
                appearance,
                componentProps: {},
            })
        ).toEqual({
            label: 'transactions',
            subCategory: 'Overview',
            appearance: ['titles', 'dataGrid'],
            appearanceTitles: 'hidden',
        });
    });
});

describe('getCustomizedComponentDataEventProperties', () => {
    it.each([undefined, {}, { defaultLimit: 50 }, { disableLimitSelection: undefined }])(
        'omits limit selection analytics when the option is not configured: %j',
        pagination => {
            const properties = getCustomizedComponentDataEventProperties({
                componentName: 'transactions',
                componentProps: { pagination },
            });

            expect(properties).not.toHaveProperty('allowLimitSelection');
        }
    );

    it.each([
        { disableLimitSelection: false, allowLimitSelection: true },
        { disableLimitSelection: true, allowLimitSelection: false },
    ])('tracks explicit limit selection configuration: %j', ({ disableLimitSelection, allowLimitSelection }) => {
        const properties = getCustomizedComponentDataEventProperties({
            componentName: 'transactions',
            componentProps: { pagination: { disableLimitSelection } },
        });

        expect(properties).toHaveProperty('allowLimitSelection', allowLimitSelection);
    });

    it('reports the defaults of a minimally wired component', () => {
        const properties = getCustomizedComponentDataEventProperties({
            componentName: 'transactions',
            componentProps: {},
        });

        expect(properties).toMatchObject({
            label: 'transactions',
            subCategory: 'Overview',
            hasOnContactSupport: false,
            hasOnRecordSelection: false,
            hasPreferredLimit: false,
        });
        expect(properties).not.toHaveProperty('appearance');
        expect(properties).not.toHaveProperty('appearanceTitles');
        expect(properties).not.toHaveProperty('appearanceIllustrations');
        expect(properties).not.toHaveProperty('hasOnDismiss');
        expect(properties).not.toHaveProperty('hasShowDetails');
        expect(properties).not.toHaveProperty('dataCustomColumns');
        expect(properties).not.toHaveProperty('hiddenDetailFields');
        expect(properties).not.toHaveProperty('fieldsPrefilled');
        expect(properties).not.toHaveProperty('allowLimitSelection');
    });

    it('does not track internal props absent from external capabilities', () => {
        const properties = getCustomizedComponentDataEventProperties({
            componentName: 'capitalOffer',
            componentProps: { hideTitle: true },
        });

        expect(properties).not.toHaveProperty('hideTitle');
    });

    it('tracks callback utilization for keep/kill decisions', () => {
        const properties = getCustomizedComponentDataEventProperties({
            componentName: 'paymentLinkCreation',
            componentProps: {
                onContactSupport: () => {},
                onShowDetails: () => {},
            },
        });

        expect(properties).toMatchObject({
            hasOnContactSupport: true,
            hasShowDetails: true,
        });
        expect(properties).not.toHaveProperty('hasOnRecordSelection');
    });

    it('tracks custom columns and hidden detail fields by key', () => {
        const properties = getCustomizedComponentDataEventProperties({
            componentName: 'transactions',
            componentProps: {
                dataCustomization: {
                    dataGrid: {
                        fields: [{ key: 'merchantReference' }, { key: 'paymentPspReference' }],
                    },
                    details: {
                        fields: [
                            { key: 'merchantReference', visibility: 'hidden' },
                            { key: 'amount', visibility: 'visible' },
                        ],
                    },
                },
            },
        });

        expect(properties).toMatchObject({
            dataCustomColumns: ['merchantReference', 'paymentPspReference'],
            hiddenDetailFields: ['merchantReference'],
        });
    });

    it('flattens the payment link field configuration into prefilled, read-only, and hidden keys', () => {
        const properties = getCustomizedComponentDataEventProperties({
            componentName: 'paymentLinkCreation',
            componentProps: {
                fieldsConfig: {
                    data: { amount: { value: 1000 }, shopperEmail: 'shopper@example.com' },
                    visibility: {
                        amount: { currency: 'readOnly' },
                        billingAddress: 'hidden',
                        shopperName: { firstName: 'hidden' },
                    },
                },
            },
        });

        expect(properties).toMatchObject({
            fieldsPrefilled: ['amount', 'shopperEmail'],
            fieldsReadOnly: ['amount.currency'],
            fieldsHidden: ['billingAddress', 'shopperName.firstName'],
        });
    });

    it('tracks pagination options', () => {
        const properties = getCustomizedComponentDataEventProperties({
            componentName: 'transactions',
            componentProps: {
                pagination: { defaultLimit: 50, disableLimitSelection: true },
            },
        });

        expect(properties).toMatchObject({
            allowLimitSelection: false,
            hasPreferredLimit: true,
        });
    });

    it('omits properties unsupported by the component', () => {
        const properties = getCustomizedComponentDataEventProperties({
            componentName: 'capitalOverview',
            componentProps: {
                onDismiss: () => {},
                onRecordSelection: () => {},
                onShowDetails: () => {},
                dataCustomization: { dataGrid: { fields: [] } },
                fieldsConfig: { data: { shopperEmail: 'shopper@example.com' } },
                pagination: { defaultLimit: 50, disableLimitSelection: true },
                balanceAccountId: 'BA322KH22322DKGJ4',
            },
        });

        expect(properties).toEqual({
            label: 'capitalOverview',
            subCategory: 'Overview',
            hasOnContactSupport: false,
        });
    });
});

describe('getUpdatedThemeEventProperties', () => {
    it('records the previous and new theme plus the live components', () => {
        expect(
            getUpdatedThemeEventProperties({
                previousThemeMode: 'light',
                themeMode: 'dark',
                components: ['transactions', 'capitalOffer'],
            })
        ).toEqual({
            label: 'core',
            theme: 'dark',
            previousTheme: 'light',
            components: ['transactions', 'capitalOffer'],
        });
    });

    it('reports unset themes as default', () => {
        expect(getUpdatedThemeEventProperties({ previousThemeMode: undefined, themeMode: undefined, components: [] })).toEqual({
            label: 'core',
            theme: 'default',
            previousTheme: 'default',
            components: [],
        });
    });
});

describe('core event payloads', () => {
    it('encodes "Initiated core" with the PIE / Core base properties', () => {
        const payload = getInitiatedCoreEventPayload({ onSessionCreate: vi.fn(), locale: 'nl-NL' });
        if (!payload) throw new Error('Expected an encoded payload');

        const { event, properties } = decodePayload(payload);

        expect(event).toBe(CORE_EVENT_NAMES.initiatedCore);
        expect(properties).toMatchObject({
            category: 'PIE',
            subCategory: 'Core',
            locale: 'nl-NL',
        });
        expect(typeof properties.time).toBe('number');
    });

    it('encodes the style and data component events with their funnel section', () => {
        const payloads = getCustomizedComponentEventPayloads({
            componentName: 'transactionDetails',
            locale: 'en-US',
            appearance: { illustrations: 'hidden' },
            componentProps: {},
        });

        expect(payloads).toHaveLength(2);

        const styleEvent = decodePayload(payloads[0]!);
        expect(styleEvent.event).toBe(CORE_EVENT_NAMES.customizedComponentStyle);
        expect(styleEvent.properties).toMatchObject({
            category: 'PIE',
            subCategory: 'Details',
            label: 'transactionDetails',
            locale: 'en-US',
            appearanceIllustrations: 'hidden',
        });

        const dataEvent = decodePayload(payloads[1]!);
        expect(dataEvent.event).toBe(CORE_EVENT_NAMES.customizedComponentData);
        expect(dataEvent.properties).toMatchObject({
            category: 'PIE',
            subCategory: 'Details',
            label: 'transactionDetails',
        });
    });

    it('encodes "Updated theme (runtime)" with the previous and new theme', () => {
        const payload = getUpdatedThemeEventPayload({
            previousThemeMode: 'light',
            themeMode: 'dark',
            components: ['transactions'],
            locale: 'en-US',
        });
        if (!payload) throw new Error('Expected an encoded payload');

        const { event, properties } = decodePayload(payload);

        expect(event).toBe(CORE_EVENT_NAMES.updatedTheme);
        expect(properties).toMatchObject({
            category: 'PIE',
            subCategory: 'Core',
            theme: 'dark',
            previousTheme: 'light',
            components: ['transactions'],
        });
    });
});
