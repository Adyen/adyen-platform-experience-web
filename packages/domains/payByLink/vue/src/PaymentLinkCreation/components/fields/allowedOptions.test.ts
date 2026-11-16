// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { computed, createApp, h, nextTick, provide, ref, type App, type Component } from 'vue';
import { Localization } from '@integration-components/core';
import { useCoreContext } from '@integration-components/core/vue';
import type { DeepPartial, IPaymentLinkValidity } from '@integration-components/types';
import type { FormFieldConfig, PaymentLinkCreationFormValues, PaymentLinkFieldName } from '../../../../../domain/src';
import translations from '../../../../translations/en-US.json';
import { PAYMENT_LINK_WIZARD_KEY } from '../../composables/wizardContext';
import { usePaymentLinkWizard } from '../PaymentLinkCreationFormContainer/usePaymentLinkWizard';
import AmountField from '../Form/PaymentDetailsForm/fields/AmountField.vue';
import ValidityField from '../Form/PaymentDetailsForm/fields/ValidityField.vue';
import CountryField from '../Form/CustomerDetailsForm/fields/CountryField.vue';
import LanguageField from '../Form/CustomerDetailsForm/fields/LanguageField.vue';
import SelectField from './SelectField.vue';

vi.mock('@adyen/bento-vue3', async () => {
    const { defineComponent, h } = await import('vue');
    return {
        BentoDropdown: defineComponent({
            props: { modelValue: { type: String, default: '' } },
            setup: props => () => h('span', props.modelValue),
        }),
        BentoFormLayoutGroup: defineComponent({
            setup:
                (_props, { slots }) =>
                () =>
                    h('div', slots.default?.()),
        }),
        BentoInputField: defineComponent({
            props: { dropdown: { type: Object, default: () => ({}) } },
            setup: props => () => h('span', props.dropdown.modelValue ?? ''),
        }),
    };
});

vi.mock('@integration-components/core/vue', () => ({
    useCoreContext: vi.fn(),
}));

type FormValues = DeepPartial<PaymentLinkCreationFormValues>;

const i18n = new Localization('en-US', '', { defaultTranslations: translations, localeTranslations: {} }).i18n;
const LANGUAGES = [
    { text: 'English', value: 'en-US' },
    { text: 'Español', value: 'es-ES' },
    { text: 'Français', value: 'fr-FR' },
];

let app: App | undefined;
let target: HTMLDivElement;

beforeEach(() => {
    vi.mocked(useCoreContext).mockReturnValue({
        i18n,
        getCdnDataset: vi.fn().mockResolvedValue(LANGUAGES),
    } as unknown as ReturnType<typeof useCoreContext>);
});

afterEach(() => {
    app?.unmount();
    app = undefined;
});

const field = (fieldName: PaymentLinkFieldName, config: Partial<FormFieldConfig> = {}): FormFieldConfig => ({
    fieldName,
    visible: true,
    required: false,
    includeInApiPayload: true,
    ...config,
});

interface MountOptions {
    fields: FormFieldConfig[];
    data: FormValues;
    props?: Record<string, unknown>;
}

function mountField(component: Component, { fields, data, props = {} }: MountOptions) {
    const componentProps = ref(props);
    let wizard!: ReturnType<typeof usePaymentLinkWizard>;
    app = createApp({
        setup() {
            const steps = computed(() => [{ id: 'step', fields }]);
            wizard = usePaymentLinkWizard({ i18n, steps, defaults: () => data });
            provide(PAYMENT_LINK_WIZARD_KEY, { i18n, ...wizard });
            return () => h(component, componentProps.value);
        },
    });
    target = document.createElement('div');
    app.mount(target);
    return { wizard, props: componentProps };
}

describe.each([
    { component: CountryField, name: 'countryCode' as const, title: 'CountryField' },
    { component: SelectField, name: 'shopperLocale' as const, title: 'SelectField' },
])('$title prefilled values outside the items', ({ component, name }) => {
    const items = [
        { id: 'first', name: 'First option' },
        { id: 'second', name: 'Second option' },
    ];
    const mount = ({ value, visible = true, props = {} }: { value: string; visible?: boolean; props?: Record<string, unknown> }) =>
        mountField(component, {
            fields: [field(name, { visible })],
            data: { [name]: value } as FormValues,
            props: { name, label: name, items, ...props },
        });

    test('keeps a prefilled value that is one of the items', () => {
        const { wizard } = mount({ value: 'second' });

        expect(wizard.getValue(name)).toBe('second');
        expect(target.textContent).toBe('second');
    });

    test('clears a prefilled value that is not one of the items', () => {
        const { wizard } = mount({ value: 'unknown' });

        expect(wizard.getValue(name)).toBe('');
        expect(target.textContent).toBe('');
    });

    test('replaces a prefilled value that is not one of the items with the single item', () => {
        const { wizard } = mount({ value: 'unknown', props: { items: [items[0]] } });

        expect(wizard.getValue(name)).toBe('first');
        expect(wizard.displayValues.value[name]).toBe('First option');
        expect(target.textContent).toBe('first');
    });

    test('does not send a prefilled value that is not one of the items of a hidden field', () => {
        const { wizard } = mount({ value: 'unknown', visible: false, props: { items: [items[0]] } });

        expect(wizard.getValue(name)).toBe('');
        expect(wizard.getApiPayload().payload).not.toHaveProperty(name);
    });

    test('waits for the items to load before discarding a prefilled value', async () => {
        const { props, wizard } = mount({ value: 'unknown', props: { loading: true } });

        expect(wizard.getValue(name)).toBe('unknown');
        props.value.loading = false;
        await nextTick();

        expect(wizard.getValue(name)).toBe('');
    });

    test('keeps the prefilled value while there are no items to check it against', () => {
        const { wizard } = mount({ value: 'unknown', props: { items: [] } });

        expect(wizard.getValue(name)).toBe('unknown');
    });

    test('clears the value once the items no longer include it', async () => {
        const { props, wizard } = mount({ value: 'second' });

        props.value.items = [items[0], { id: 'third', name: 'Third option' }];
        await nextTick();

        expect(wizard.getValue(name)).toBe('');
    });
});

describe('LanguageField prefilled values outside the configuration options', () => {
    test('does not send a prefilled locale that is not allowed for a hidden field', async () => {
        const { wizard } = mountField(LanguageField, {
            fields: [field('shopperLocale', { visible: false, options: ['es-ES', 'fr-FR'] })],
            data: { shopperLocale: 'en-US' },
        });

        await vi.waitFor(() => expect(wizard.getValue('shopperLocale')).toBe(''));
        expect(wizard.getApiPayload().payload).not.toHaveProperty('shopperLocale');
    });
});

describe('AmountField prefilled currency outside the configuration options', () => {
    const mount = (currencyOptions: string[]) =>
        mountField(AmountField, {
            fields: [field('amount.value'), field('amount.currency', { options: currencyOptions })],
            data: { amount: { value: 12345, currency: 'EUR' } },
            props: { label: 'Amount', currencyOptions },
        });

    test.each([
        { currencyOptions: ['USD', 'EUR'], expected: 'EUR', description: 'keeps an allowed currency' },
        { currencyOptions: ['USD', 'GBP'], expected: '', description: 'clears a currency that is not allowed' },
        { currencyOptions: ['USD'], expected: 'USD', description: 'replaces a currency that is not allowed with the single option' },
    ])('$description', ({ currencyOptions, expected }) => {
        const { wizard } = mount(currencyOptions);

        expect(wizard.getValue('amount.currency')).toBe(expected);
        expect(wizard.getValue('amount.value')).toBe(12345);
        expect(target.textContent).toBe(expected);
    });
});

describe('ValidityField prefilled validity outside the configuration options', () => {
    const DAY: IPaymentLinkValidity = { quantity: 24, durationUnit: 'hour', type: 'fixed' };
    const MONTH: IPaymentLinkValidity = { quantity: 30, durationUnit: 'day', type: 'fixed' };
    const FLEXIBLE = { type: 'flexible' } as IPaymentLinkValidity;

    const mount = (options: IPaymentLinkValidity[], linkValidity: FormValues['linkValidity']) => {
        const { wizard } = mountField(ValidityField, {
            fields: [field('linkValidity.quantity', { options }), field('linkValidity.durationUnit')],
            data: { linkValidity },
            props: { options },
        });
        return { quantity: wizard.getValue('linkValidity.quantity'), durationUnit: wizard.getValue('linkValidity.durationUnit') };
    };

    test('keeps a prefilled validity that matches a preset', () => {
        expect(mount([DAY, MONTH], { quantity: 30, durationUnit: 'day' })).toEqual({ quantity: 30, durationUnit: 'day' });
    });

    test('keeps a custom prefilled validity when custom durations are allowed', () => {
        expect(mount([DAY, FLEXIBLE], { quantity: 3, durationUnit: 'week' })).toEqual({ quantity: 3, durationUnit: 'week' });
    });

    test('falls back to the first preset when custom durations are not allowed', () => {
        expect(mount([DAY, MONTH], { quantity: 3, durationUnit: 'week' })).toEqual({ quantity: '24', durationUnit: 'hour' });
    });

    test('clears a custom prefilled validity with an unknown duration unit', () => {
        expect(mount([FLEXIBLE], { quantity: 3, durationUnit: 'month' as IPaymentLinkValidity['durationUnit'] })).toEqual({
            quantity: '',
            durationUnit: '',
        });
    });
});
