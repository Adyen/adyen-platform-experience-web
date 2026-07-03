import { describe, expect, test } from 'vitest';
import { buildStepSchema } from './schema';
import type { FormFieldConfig, FormStepConfig } from './formSteps';
import type { Localization } from '@integration-components/core';

type I18n = Localization['i18n'];

const i18n = {
    get: (key: string, options?: { values?: Record<string, unknown> }) => {
        const values = options?.values;
        return values ? `${key}:${JSON.stringify(values)}` : key;
    },
} as unknown as I18n;

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
        const schema = buildStepSchema(step, i18n);

        const result = schema.safeParse({ reference: 'ab' });

        expect(result.success).toBe(false);
        if (!result.success) {
            const issue = result.error.issues.find(i => i.path.join('.') === 'reference');
            expect(issue?.message).toBe('common.errors.minLength:{"minLength":3}');
        }
    });

    test('passes validation when reference meets the minimum length', () => {
        const step = buildStep([buildField({ required: true })]);
        const schema = buildStepSchema(step, i18n);

        const result = schema.safeParse({ reference: 'abc' });

        expect(result.success).toBe(true);
    });

    test('does not flag an empty optional reference as too short', () => {
        const step = buildStep([buildField({ required: false })]);
        const schema = buildStepSchema(step, i18n);

        const result = schema.safeParse({ reference: '' });

        expect(result.success).toBe(true);
    });
});
