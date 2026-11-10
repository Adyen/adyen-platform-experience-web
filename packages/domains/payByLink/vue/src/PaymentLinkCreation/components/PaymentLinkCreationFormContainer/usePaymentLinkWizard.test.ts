import { computed, effectScope, nextTick, ref } from 'vue';
import { describe, expect, test } from 'vitest';
import { usePaymentLinkWizard } from './usePaymentLinkWizard';
import type { I18n } from '@integration-components/core/vue';
import type { IPaymentLinkValidity } from '@integration-components/types';
import type { FormFieldConfig, FormStepConfig, PaymentLinkFieldName } from '../../../../../domain/src';

const i18n = { get: (key: string) => key } as unknown as I18n;

const steps = computed<FormStepConfig[]>(() => [
    {
        id: 'customer',
        fields: [
            { fieldName: 'billingAddress.country', required: false, visible: true, includeInApiPayload: true },
            { fieldName: 'deliveryAddress.country', required: false, visible: true, includeInApiPayload: true },
        ],
    },
]);

describe('usePaymentLinkWizard - setValue', () => {
    test('clears a stale display value when a field is reset without one', () => {
        const wizard = effectScope().run(() => usePaymentLinkWizard({ i18n, steps }))!;

        wizard.setValue('deliveryAddress.country', 'NL', 'Netherlands');
        wizard.setValue('deliveryAddress.country', '');

        expect(wizard.getValue('deliveryAddress.country')).toBe('');
        expect(wizard.displayValues.value['deliveryAddress.country']).toBeUndefined();
    });
});

describe('usePaymentLinkWizard - allowed options', () => {
    type WizardParams = Parameters<typeof usePaymentLinkWizard>[0];

    const field = (fieldName: PaymentLinkFieldName, options?: FormFieldConfig['options']): FormFieldConfig => ({
        fieldName,
        required: false,
        visible: true,
        includeInApiPayload: true,
        options,
    });

    const createWizard = (fields: FormFieldConfig[], params: Pick<WizardParams, 'defaults' | 'allowedOptions'>) => {
        const stepFields = ref(fields);
        const wizardSteps = computed<FormStepConfig[]>(() => [{ id: 'payment', fields: stepFields.value }]);
        const wizard = effectScope().run(() => usePaymentLinkWizard({ i18n, steps: wizardSteps, ...params }))!;
        return { wizard, stepFields };
    };

    test('does not send prefilled values that are not among the configuration options', () => {
        const { wizard } = createWizard(
            [field('linkType', ['singleUse']), field('amount.currency', ['EUR', 'USD']), field('shopperLocale', ['es-ES'])],
            {
                defaults: () => ({ linkType: 'open', amount: { currency: 'EUR' }, shopperLocale: 'en-US' }),
            }
        );

        expect(wizard.getApiPayload().payload).toEqual({ amount: { currency: 'EUR' } });
    });

    test('keeps prefilled values for fields whose options are not plain values', () => {
        const options = [{ quantity: 24, durationUnit: 'hour', type: 'fixed' }] as IPaymentLinkValidity[];
        const { wizard } = createWizard([field('linkValidity.quantity', options), field('linkValidity.durationUnit')], {
            defaults: () => ({ linkValidity: { quantity: 3, durationUnit: 'week' } }),
        });

        expect(wizard.getApiPayload().payload).toEqual({ linkValidity: { quantity: 3, durationUnit: 'week' } });
    });

    test('falls back to the provided allowed options when the configuration has none for a field', () => {
        const { wizard } = createWizard([field('countryCode', ['ES']), field('billingAddress.country'), field('deliveryAddress.country')], {
            defaults: () => ({ countryCode: 'ES', billingAddress: { country: 'ES' }, deliveryAddress: { country: 'US' } }),
            allowedOptions: () => ({ countryCode: ['US'], 'billingAddress.country': ['US'], 'deliveryAddress.country': ['US'] }),
        });

        expect(wizard.getApiPayload().payload).toEqual({ countryCode: 'ES', deliveryAddress: { country: 'US' } });
    });

    test('clears a value once the configuration options no longer include it', async () => {
        const { wizard, stepFields } = createWizard([field('linkType', ['singleUse', 'open'])], { defaults: () => ({ linkType: 'open' }) });

        expect(wizard.getValue('linkType')).toBe('open');
        stepFields.value = [field('linkType', ['singleUse'])];
        await nextTick();

        expect(wizard.getValue('linkType')).toBe('');
    });

    test('clears a prefilled value once the configuration loads after the defaults', async () => {
        const { wizard, stepFields } = createWizard([], { defaults: () => ({ linkType: 'open' }) });

        expect(wizard.getValue('linkType')).toBe('open');
        stepFields.value = [field('linkType', ['singleUse'])];
        await nextTick();

        expect(wizard.getValue('linkType')).toBe('');
    });

    test('ignores a default value that is not allowed when the defaults change after the configuration loads', async () => {
        const defaults = ref<ReturnType<NonNullable<WizardParams['defaults']>>>();
        const { wizard } = createWizard([field('linkType', ['singleUse'])], { defaults: () => defaults.value });

        defaults.value = { linkType: 'open' };
        await nextTick();

        expect(wizard.getValue('linkType')).toBe('');
    });
});
