import { describe, expect, test } from 'vitest';
import { buildStepSchema, type StepSchemaI18n } from './schema';
import { getFormSteps, type FormFieldConfig, type FormStepConfig } from './formSteps';
import type { Localization } from '@integration-components/core';
import type { IPaymentLinkConfigurationElement } from '@integration-components/types';

type FormStepsI18n = Localization['i18n'];

const i18n = {
    get: (key: string, options?: { values?: Record<string, unknown> }) => {
        const values = options?.values;
        return values ? `${key}:${JSON.stringify(values)}` : key;
    },
};

const formStepsI18n = i18n as unknown as FormStepsI18n;
const schemaI18n = i18n as unknown as StepSchemaI18n;

const buildField = (overrides: Partial<FormFieldConfig> = {}): FormFieldConfig => ({
    fieldName: 'reference',
    required: false,
    visible: true,
    includeInApiPayload: true,
    ...overrides,
});

const buildStep = (fields: FormFieldConfig[]): FormStepConfig => ({
    id: 'payment',
    fields,
});

describe('buildStepSchema - merchantReference min length', () => {
    test('fails validation when reference is shorter than the minimum length', () => {
        const step = buildStep([buildField({ required: true })]);
        const schema = buildStepSchema(step, schemaI18n);

        const result = schema.safeParse({ reference: 'ab' });

        expect(result.success).toBe(false);
        if (!result.success) {
            const issue = result.error.issues.find(i => i.path.join('.') === 'reference');
            expect(issue?.message).toBe('payByLink.errors.minLength:{"minLength":3}');
        }
    });

    test('passes validation when reference meets the minimum length', () => {
        const step = buildStep([buildField({ required: true })]);
        const schema = buildStepSchema(step, schemaI18n);

        const result = schema.safeParse({ reference: 'abc' });

        expect(result.success).toBe(true);
    });

    test('does not flag an empty optional reference as too short', () => {
        const step = buildStep([buildField({ required: false })]);
        const schema = buildStepSchema(step, schemaI18n);

        const result = schema.safeParse({ reference: '' });

        expect(result.success).toBe(true);
    });
});

describe('buildStepSchema - link validity presets', () => {
    test('accepts a backend-configured fixed preset above the custom duration limit', () => {
        const linkValidity = {
            required: true,
            options: [{ durationUnit: 'day', quantity: 90, type: 'fixed' }],
        } satisfies IPaymentLinkConfigurationElement;
        const paymentStep = getFormSteps({
            i18n: formStepsI18n,
            getFieldConfig: field => (field === 'linkValidity' ? linkValidity : undefined),
        }).find(step => step.id === 'payment');

        expect(paymentStep).toBeDefined();
        const schema = buildStepSchema(paymentStep!, schemaI18n);

        expect(schema.safeParse({ 'linkValidity.quantity': '90', 'linkValidity.durationUnit': 'day' }).success).toBe(true);
    });
});
