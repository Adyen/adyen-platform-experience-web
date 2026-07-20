import { inject, type ComputedRef, type InjectionKey, type Ref } from 'vue';
import type { Localization } from '@integration-components/core';
import type { FormStepConfig, PaymentLinkFieldName } from '../../../../domain/src';
import type { IPaymentLinkConfigurationElement } from '@integration-components/types';

export interface FieldRuntimeConfig {
    visible: boolean;
    required: boolean;
    readOnly: boolean;
    includeInApiPayload: boolean;
    label?: string;
    options?: IPaymentLinkConfigurationElement['options'];
}

export interface PaymentLinkWizardContext {
    i18n: Localization['i18n'];
    values: Ref<Record<string, unknown>>;
    errors: Ref<Record<string, string>>;
    displayValues: Ref<Record<string, string>>;
    steps: ComputedRef<ReadonlyArray<FormStepConfig>>;
    fieldConfig: ComputedRef<Record<string, FieldRuntimeConfig>>;
    getFieldConfig: (name: PaymentLinkFieldName) => FieldRuntimeConfig;
    getValue: (name: PaymentLinkFieldName) => unknown;
    setValue: (name: PaymentLinkFieldName, value: unknown, displayValue?: string) => void;
    getError: (name: PaymentLinkFieldName) => string | undefined;
    validateField: (name: PaymentLinkFieldName) => boolean;
}

export const PAYMENT_LINK_WIZARD_KEY: InjectionKey<PaymentLinkWizardContext> = Symbol('paymentLinkWizard');

export function useWizard(): PaymentLinkWizardContext {
    const context = inject(PAYMENT_LINK_WIZARD_KEY);
    if (!context) throw new Error('useWizard must be used within PaymentLinkCreationForm');
    return context;
}
