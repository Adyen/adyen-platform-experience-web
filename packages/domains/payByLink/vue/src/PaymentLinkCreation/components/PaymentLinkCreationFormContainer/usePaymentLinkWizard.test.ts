import { computed, effectScope } from 'vue';
import { describe, expect, test } from 'vitest';
import { usePaymentLinkWizard } from './usePaymentLinkWizard';
import type { I18n } from '@integration-components/core/vue';
import type { FormStepConfig } from '../../../../../domain/src';

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
