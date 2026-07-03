import { z, type ZodType } from 'zod';
import type { Localization } from '@integration-components/core';
import { transformToMS } from '@integration-components/utils';
import type { FormFieldConfig, FormStepConfig } from './formSteps';
import type { PaymentLinkFieldName } from './types';
import { MAX_VALIDITY_DAYS, PAYMENT_LINK_CREATION_FIELD_LENGTHS } from './constants';

type I18n = Localization['i18n'];

type FlatValues = Record<string, unknown>;

const isEmpty = (value: unknown): boolean => value === undefined || value === null || value === '';

const addRequiredIssue = (ctx: z.RefinementCtx, field: PaymentLinkFieldName, message: string) => {
    ctx.addIssue({ code: 'custom', path: [field], message });
};

const BILLING_ADDRESS_FIELDS: PaymentLinkFieldName[] = [
    'billingAddress.street',
    'billingAddress.houseNumberOrName',
    'billingAddress.country',
    'billingAddress.city',
    'billingAddress.postalCode',
];

const DELIVERY_ADDRESS_FIELDS: PaymentLinkFieldName[] = [
    'deliveryAddress.street',
    'deliveryAddress.houseNumberOrName',
    'deliveryAddress.country',
    'deliveryAddress.city',
    'deliveryAddress.postalCode',
];

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validateAmount = (data: FlatValues, fields: FormFieldConfig[], i18n: I18n, ctx: z.RefinementCtx) => {
    const valueField = fields.find(f => f.fieldName === 'amount.value');
    if (!valueField?.visible) return;
    const currencyVisible = fields.some(f => f.fieldName === 'amount.currency' && f.visible);
    const rawValue = data['amount.value'];
    const numericValue = Number(rawValue);

    if (!isEmpty(rawValue) && numericValue < 0) {
        addRequiredIssue(ctx, 'amount.value', i18n.get('payByLink.creation.fields.amountValue.error.negativeNumber'));
        return;
    }
    if (currencyVisible && isEmpty(data['amount.currency'])) {
        addRequiredIssue(ctx, 'amount.value', i18n.get('payByLink.creation.fields.amountValue.error.currency'));
        return;
    }
    if (valueField.required && (isEmpty(rawValue) || numericValue === 0)) {
        addRequiredIssue(ctx, 'amount.value', i18n.get('common.errors.fieldRequired'));
    }
};

const validateValidity = (data: FlatValues, fields: FormFieldConfig[], i18n: I18n, ctx: z.RefinementCtx) => {
    const quantityField = fields.find(f => f.fieldName === 'linkValidity.quantity');
    const unitField = fields.find(f => f.fieldName === 'linkValidity.durationUnit');
    if (!quantityField?.visible && !unitField?.visible) return;
    if (!quantityField?.required && !unitField?.required) return;

    const durationUnit = data['linkValidity.durationUnit'] as string | undefined;
    const quantityRaw = data['linkValidity.quantity'];
    const quantity = parseInt(`${quantityRaw}`, 10);

    if (isEmpty(quantityRaw)) {
        addRequiredIssue(ctx, 'linkValidity.quantity', i18n.get('payByLink.creation.fields.validity.customDuration.error.missingDurationValue'));
        return;
    }
    if (isNaN(quantity) || quantity <= 0) {
        addRequiredIssue(ctx, 'linkValidity.quantity', i18n.get('payByLink.creation.fields.validity.customDuration.error.invalidDurationValue'));
        return;
    }
    if (isEmpty(durationUnit)) {
        addRequiredIssue(ctx, 'linkValidity.quantity', i18n.get('payByLink.creation.fields.validity.customDuration.error.missingDurationUnit'));
        return;
    }
    if (transformToMS(durationUnit as string, quantity) > transformToMS('day', MAX_VALIDITY_DAYS)) {
        addRequiredIssue(
            ctx,
            'linkValidity.quantity',
            i18n.get('payByLink.creation.fields.validity.customDuration.error.durationTooLong', { values: { maxDays: MAX_VALIDITY_DAYS } })
        );
    }
};

const validateAddressSection = (
    data: FlatValues,
    fields: FormFieldConfig[],
    sectionFields: PaymentLinkFieldName[],
    i18n: I18n,
    ctx: z.RefinementCtx
) => {
    const visibleSectionFields = sectionFields.filter(name => fields.some(f => f.fieldName === name && f.visible));
    if (!visibleSectionFields.length) return;

    const sectionRequired = sectionFields.some(name => fields.some(f => f.fieldName === name && f.required));
    const anyFilled = visibleSectionFields.some(name => !isEmpty(data[name]));

    if (!sectionRequired && !anyFilled) return;

    visibleSectionFields.forEach(name => {
        if (isEmpty(data[name])) addRequiredIssue(ctx, name, i18n.get('common.errors.fieldRequired'));
    });
};

const MAX_LENGTHS: Partial<Record<PaymentLinkFieldName, number>> = {
    reference: PAYMENT_LINK_CREATION_FIELD_LENGTHS.merchantReference.max,
    description: PAYMENT_LINK_CREATION_FIELD_LENGTHS.description.max,
    shopperReference: PAYMENT_LINK_CREATION_FIELD_LENGTHS.shopperReference.max,
    'shopperName.firstName': PAYMENT_LINK_CREATION_FIELD_LENGTHS.shopperName.firstName.max,
    'shopperName.lastName': PAYMENT_LINK_CREATION_FIELD_LENGTHS.shopperName.lastName.max,
    shopperEmail: PAYMENT_LINK_CREATION_FIELD_LENGTHS.emailAddress.max,
    telephoneNumber: PAYMENT_LINK_CREATION_FIELD_LENGTHS.telephoneNumber.max,
};

const MIN_LENGTHS: Partial<Record<PaymentLinkFieldName, number>> = {
    reference: PAYMENT_LINK_CREATION_FIELD_LENGTHS.merchantReference.min,
    shopperReference: PAYMENT_LINK_CREATION_FIELD_LENGTHS.shopperReference.min,
};

// Fields with bespoke validation handled separately from the generic required/length pass.
const SPECIAL_FIELDS: PaymentLinkFieldName[] = [
    'amount.value',
    'amount.currency',
    'linkValidity.quantity',
    'linkValidity.durationUnit',
    'sendLinkToShopper',
    'sendSuccessEmailToShopper',
    ...BILLING_ADDRESS_FIELDS,
    ...DELIVERY_ADDRESS_FIELDS,
];

const validateSimpleField = (data: FlatValues, field: FormFieldConfig, i18n: I18n, ctx: z.RefinementCtx) => {
    if (!field.visible || SPECIAL_FIELDS.includes(field.fieldName)) return;
    const value = data[field.fieldName];

    if (field.fieldName === 'shopperEmail' && !isEmpty(value) && !EMAIL_PATTERN.test(String(value))) {
        addRequiredIssue(ctx, 'shopperEmail', i18n.get('payByLink.creation.fields.shopperEmail.error.validEmail'));
        return;
    }

    if (field.required && isEmpty(value)) {
        addRequiredIssue(ctx, field.fieldName, i18n.get('common.errors.fieldRequired'));
        return;
    }

    const minLength = MIN_LENGTHS[field.fieldName];
    if (minLength && !isEmpty(value) && typeof value === 'string' && value.length < minLength) {
        addRequiredIssue(ctx, field.fieldName, i18n.get('common.errors.minLength', { values: { minLength } }));
        return;
    }

    const maxLength = MAX_LENGTHS[field.fieldName];
    if (maxLength && typeof value === 'string' && value.length > maxLength) {
        addRequiredIssue(ctx, field.fieldName, i18n.get('common.errors.fieldRequired'));
    }
};

export const buildStepSchema = (step: FormStepConfig, i18n: I18n): ZodType => {
    const visibleFields = step.fields.filter(field => field.visible);
    const shape: Record<string, ZodType> = {};
    visibleFields.forEach(field => {
        shape[field.fieldName] = z.any();
    });

    return z.object(shape).superRefine((data: FlatValues, ctx) => {
        step.fields.forEach(field => validateSimpleField(data, field, i18n, ctx));
        validateAmount(data, step.fields, i18n, ctx);
        validateValidity(data, step.fields, i18n, ctx);
        validateAddressSection(data, step.fields, BILLING_ADDRESS_FIELDS, i18n, ctx);
        validateAddressSection(data, step.fields, DELIVERY_ADDRESS_FIELDS, i18n, ctx);
    });
};
