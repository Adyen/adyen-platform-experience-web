import { computed, ref, watch, type ComputedRef } from 'vue';
import type { Localization } from '@integration-components/core';
import type { DeepPartial } from '@integration-components/types';
import {
    buildApiPayload,
    buildStepSchema,
    flattenValues,
    type FormStepConfig,
    type PaymentLinkCreationFormValues,
    type PaymentLinkFieldName,
} from '../../../../../domain/src';
import { type FieldRuntimeConfig } from '../../composables/wizardContext';

interface UsePaymentLinkWizardParams {
    i18n: Localization['i18n'];
    steps: ComputedRef<ReadonlyArray<FormStepConfig>>;
    defaults?: () => DeepPartial<PaymentLinkCreationFormValues> | undefined;
}

export function usePaymentLinkWizard({ i18n, steps, defaults }: UsePaymentLinkWizardParams) {
    const values = ref<Record<string, unknown>>({});
    const errors = ref<Record<string, string>>({});
    const displayValues = ref<Record<string, string>>({});
    const currentIndex = ref(0);

    const fieldConfig = computed<Record<string, FieldRuntimeConfig>>(() => {
        const map: Record<string, FieldRuntimeConfig> = {};
        steps.value.forEach(step => {
            step.fields.forEach(field => {
                map[field.fieldName] = {
                    visible: field.visible,
                    required: field.required,
                    readOnly: !!field.readOnly,
                    includeInApiPayload: field.includeInApiPayload,
                    label: field.label,
                    options: field.options,
                };
            });
        });
        return map;
    });

    const getFieldConfig = (name: PaymentLinkFieldName): FieldRuntimeConfig =>
        fieldConfig.value[name] ?? { visible: false, required: false, readOnly: false, includeInApiPayload: false };

    const getValue = (name: PaymentLinkFieldName) => values.value[name];
    const setValue = (name: PaymentLinkFieldName, value: unknown, displayValue?: string) => {
        values.value[name] = value;
        if (displayValue !== undefined) displayValues.value[name] = displayValue;
        if (errors.value[name]) {
            const next = { ...errors.value };
            delete next[name];
            errors.value = next;
        }
    };
    const getError = (name: PaymentLinkFieldName) => errors.value[name];

    // Seed flat values from default values once (and whenever the defaults reference changes).
    watch(
        () => defaults?.(),
        defaultValues => {
            if (!defaultValues) return;
            const flat = flattenValues(defaultValues);
            Object.entries(flat).forEach(([key, value]) => {
                if (values.value[key] === undefined) values.value[key] = value;
            });
        },
        { immediate: true }
    );

    // Ensure every visible field has an entry so v-model bindings stay reactive.
    watch(
        fieldConfig,
        config => {
            Object.keys(config).forEach(name => {
                if (values.value[name] === undefined) values.value[name] = '';
            });
        },
        { immediate: true }
    );

    const currentStep = computed<FormStepConfig | undefined>(() => steps.value[currentIndex.value]);
    const isFirstStep = computed(() => currentIndex.value === 0);
    const isLastStep = computed(() => currentIndex.value === steps.value.length - 1);

    const getTelephoneNumberError = (step: FormStepConfig): string | undefined => {
        const telephoneNumberField = step.fields.find(({ fieldName }) => fieldName === 'telephoneNumber');
        const telephoneNumber = values.value['telephoneNumber'];
        if (!telephoneNumberField?.visible || !telephoneNumber) return;

        const [, ...numberParts] = (displayValues.value['telephoneNumber'] ?? '').split(' ');
        return numberParts.join(' ').trim() ? undefined : i18n.get('payByLink.creation.fields.phoneNumber.errors.requiredPhoneNumber');
    };

    const validateStep = (index = currentIndex.value): boolean => {
        const step = steps.value[index];
        if (!step) return true;
        const schema = buildStepSchema(step, i18n);
        const result = schema.safeParse(values.value);

        const next = { ...errors.value };
        step.fields.forEach(field => {
            delete next[field.fieldName];
        });

        if (!result.success) {
            result.error.issues.forEach(issue => {
                const key = issue.path.join('.');
                if (!next[key]) next[key] = issue.message;
            });
        }

        const telephoneNumberError = getTelephoneNumberError(step);
        if (telephoneNumberError) next['telephoneNumber'] = telephoneNumberError;

        errors.value = next;
        return result.success && !telephoneNumberError;
    };

    const validateField = (name: PaymentLinkFieldName): boolean => {
        const step = steps.value.find(({ fields }) => fields.some(field => field.fieldName === name));
        if (!step) return true;

        const result = buildStepSchema(step, i18n).safeParse(values.value);
        const issue = result.success ? undefined : result.error.issues.find(({ path }) => path.join('.') === name);
        const telephoneNumberError = name === 'telephoneNumber' ? getTelephoneNumberError(step) : undefined;
        const next = { ...errors.value };

        if (telephoneNumberError) {
            next[name] = telephoneNumberError;
        } else if (issue) {
            next[name] = issue.message;
        } else {
            delete next[name];
        }
        errors.value = next;
        return !issue && !telephoneNumberError;
    };

    const next = () => {
        if (!isLastStep.value) currentIndex.value += 1;
    };
    const prev = () => {
        if (!isFirstStep.value) currentIndex.value -= 1;
    };
    const goToStep = (index: number) => {
        if (index >= 0 && index < steps.value.length) currentIndex.value = index;
    };

    const getApiPayload = () => {
        const includedFields = Object.entries(fieldConfig.value)
            .filter(([, config]) => config.includeInApiPayload)
            .map(([name]) => name as PaymentLinkFieldName);
        return buildApiPayload(values.value, includedFields);
    };

    return {
        values,
        errors,
        displayValues,
        currentIndex,
        currentStep,
        isFirstStep,
        isLastStep,
        steps,
        fieldConfig,
        getFieldConfig,
        getValue,
        setValue,
        getError,
        validateField,
        validateStep,
        next,
        prev,
        goToStep,
        getApiPayload,
    };
}
