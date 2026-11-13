// @vitest-environment jsdom

import { afterEach, describe, expect, test, vi } from 'vitest';
import { computed, createApp, h, nextTick, provide, ref, type App, type Component } from 'vue';
import { Localization } from '@integration-components/core';
import type { FormStepConfig, PaymentLinkFieldName } from '../../../../../domain/src';
import translations from '../../../../translations/en-US.json';
import { PAYMENT_LINK_WIZARD_KEY } from '../../composables/wizardContext';
import { usePaymentLinkWizard } from '../PaymentLinkCreationFormContainer/usePaymentLinkWizard';
import CountryField from '../Form/CustomerDetailsForm/fields/CountryField.vue';
import SelectField from './SelectField.vue';

vi.mock('@adyen/bento-vue3', async () => {
    const { h } = await import('vue');
    return {
        BentoDropdown: {
            props: ['modelValue'],
            setup: (props: { modelValue?: string }) => () => h('span', props.modelValue ?? ''),
        },
    };
});

const i18n = new Localization('en-US', '', { defaultTranslations: translations, localeTranslations: {} }).i18n;
let app: App | undefined;
let target: HTMLDivElement;

afterEach(() => {
    app?.unmount();
    app = undefined;
});

function mountField(
    component: Component,
    name: PaymentLinkFieldName,
    options: { visible?: boolean; value?: string; props?: Record<string, unknown> } = {}
) {
    const visible = ref(options.visible ?? true);
    const props = ref<Record<string, unknown>>({ name, label: name, ...options.props });
    let wizard!: ReturnType<typeof usePaymentLinkWizard>;
    app = createApp({
        setup() {
            const steps = computed<FormStepConfig[]>(() => [
                {
                    id: 'customer',
                    fields: [{ fieldName: name, visible: visible.value, required: false, includeInApiPayload: true }],
                },
            ]);
            wizard = usePaymentLinkWizard({ i18n, steps });
            if (options.value !== undefined) wizard.setValue(name, options.value);
            provide(PAYMENT_LINK_WIZARD_KEY, { i18n, ...wizard });
            return () => h(component, props.value);
        },
    });
    target = document.createElement('div');
    app.mount(target);
    return { visible, props, wizard };
}

describe.each([
    { component: CountryField, name: 'countryCode' as const, title: 'CountryField' },
    { component: SelectField, name: 'shopperLocale' as const, title: 'SelectField' },
])('$title single-option preselection', ({ component, name }) => {
    const items = [{ id: 'single', name: 'Single option' }];

    test('preselects the single option when visible and loaded', () => {
        const { wizard } = mountField(component, name, { props: { items } });

        expect(wizard.getValue(name)).toBe('single');
        expect(wizard.displayValues.value[name]).toBe('Single option');
        expect(target.textContent).toBe('single');
    });

    test('preselects when a hidden field becomes visible without changing its items', async () => {
        const { visible, wizard } = mountField(component, name, { visible: false, props: { items } });

        expect(wizard.getValue(name)).toBe('');
        visible.value = true;
        await nextTick();

        expect(wizard.getValue(name)).toBe('single');
        expect(target.textContent).toBe('single');
    });

    test('waits for loading to finish without changing its items', async () => {
        const { props, wizard } = mountField(component, name, { props: { items, loading: true } });

        expect(wizard.getValue(name)).toBe('');
        props.value.loading = false;
        await nextTick();

        expect(wizard.getValue(name)).toBe('single');
        expect(target.textContent).toBe('single');
    });

    test('does not preselect when visibility changes while still loading', async () => {
        const { visible, props, wizard } = mountField(component, name, { visible: false, props: { items, loading: true } });

        visible.value = true;
        await nextTick();
        expect(wizard.getValue(name)).toBe('');

        props.value.loading = false;
        await nextTick();
        expect(wizard.getValue(name)).toBe('single');
    });

    test('preserves an existing value when visibility and loading change', async () => {
        const { visible, props, wizard } = mountField(component, name, {
            visible: false,
            value: 'existing',
            props: { items, loading: true },
        });

        visible.value = true;
        props.value.loading = false;
        await nextTick();

        expect(wizard.getValue(name)).toBe('existing');
    });

    test.each([{ items: [] }, { items: [...items, { id: 'another', name: 'Another option' }] }])(
        'does not preselect from $items',
        async ({ items: availableItems }) => {
            const { visible, wizard } = mountField(component, name, { visible: false, props: { items: availableItems } });

            visible.value = true;
            await nextTick();

            expect(wizard.getValue(name)).toBe('');
        }
    );
});
