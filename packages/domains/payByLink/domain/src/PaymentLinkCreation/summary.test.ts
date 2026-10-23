import { describe, expect, test } from 'vitest';
import Localization from '@integration-components/core/Localization';
import { getSummaryFieldValue } from './summary';

const { i18n } = new Localization();

const render = (
    fieldName: string,
    values: Record<string, unknown> = {},
    displayValues: Record<string, string> = {},
    countries?: { id: string; name: string }[]
) => getSummaryFieldValue(fieldName, { i18n, values, displayValues, countries });

describe('getSummaryFieldValue', () => {
    describe('link validity quantity', () => {
        test('combines the quantity with its unit', () => {
            expect(render('linkValidity.quantity', { 'linkValidity.quantity': 3, 'linkValidity.durationUnit': 'day' })).toBe('3 days');
        });

        test('uses the singular form for one', () => {
            expect(render('linkValidity.quantity', { 'linkValidity.quantity': 1, 'linkValidity.durationUnit': 'day' })).toBe('1 day');
        });

        test('is empty without a quantity', () => {
            expect(render('linkValidity.quantity', { 'linkValidity.durationUnit': 'day' })).toBe('');
            expect(render('linkValidity.quantity', { 'linkValidity.quantity': 0, 'linkValidity.durationUnit': 'day' })).toBe('');
        });

        test('is empty without a unit', () => {
            expect(render('linkValidity.quantity', { 'linkValidity.quantity': 3 })).toBe('');
        });
    });

    describe('amount', () => {
        test('formats the amount with its currency', () => {
            expect(render('amount.value', { 'amount.value': 12.5, 'amount.currency': 'EUR' })).toBe(i18n.amount(12.5, 'EUR'));
        });

        test('formats an amount of zero', () => {
            expect(render('amount.value', { 'amount.value': 0, 'amount.currency': 'EUR' })).toBe(i18n.amount(0, 'EUR'));
        });

        test('converts a numeric string to a number', () => {
            expect(render('amount.value', { 'amount.value': '7', 'amount.currency': 'USD' })).toBe(i18n.amount(7, 'USD'));
        });

        test('is empty without an amount', () => {
            expect(render('amount.value', { 'amount.currency': 'EUR' })).toBe('');
            expect(render('amount.value', { 'amount.value': '', 'amount.currency': 'EUR' })).toBe('');
        });

        test('is empty without a currency', () => {
            expect(render('amount.value', { 'amount.value': 12.5 })).toBe('');
        });
    });

    describe('link type', () => {
        test('translates the link type', () => {
            expect(render('linkType', { linkType: 'singleUse' })).toBe(i18n.get('payByLink.creation.form.linkTypes.singleUse'));
        });

        test('is empty without a link type', () => {
            expect(render('linkType', {})).toBe('');
        });
    });

    describe.each(['countryCode', 'deliveryAddress.country', 'billingAddress.country'])('country field %s', fieldName => {
        const countries = [{ id: 'NL', name: 'Netherlands' }];

        test('shows the country name from the dataset', () => {
            expect(render(fieldName, { [fieldName]: 'NL' }, { [fieldName]: 'Display' }, countries)).toBe('Netherlands');
        });

        test('falls back to the display value when the country is not in the dataset', () => {
            expect(render(fieldName, { [fieldName]: 'BE' }, { [fieldName]: 'Belgium' }, countries)).toBe('Belgium');
        });

        test('falls back to the raw value when there is no dataset and no display value', () => {
            expect(render(fieldName, { [fieldName]: 'BE' })).toBe('BE');
        });

        test('is empty without any value', () => {
            expect(render(fieldName, {}, {}, countries)).toBe('');
        });
    });

    describe('other fields', () => {
        test('prefers the display value', () => {
            expect(render('store', { store: 'ST_1' }, { store: 'My store' })).toBe('My store');
        });

        test('converts the raw value to a string', () => {
            expect(render('reference', { reference: 'REF' })).toBe('REF');
            expect(render('count', { count: 5 })).toBe('5');
            expect(render('flag', { flag: false })).toBe('false');
        });

        test('is empty for missing values', () => {
            expect(render('reference', {})).toBe('');
            expect(render('reference', { reference: null })).toBe('');
        });

        test('keeps an empty display value', () => {
            expect(render('reference', { reference: 'REF' }, { reference: '' })).toBe('');
        });
    });
});
