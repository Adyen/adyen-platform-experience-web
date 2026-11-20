import { describe, expect, it } from 'vitest';
import type Core from '../Core';
import type { CoreInstance, UIElementProps } from './types';

type CustomTranslations = { 'en-US': { 'transactions.common.actions.copy.labels.default': string; _button: string } };

// These assertions are checked by `types:check`: a regression fails type-checking, not the test run.
const toCoreInstance = (core: Core): CoreInstance => core;
const toCoreInstanceWithCustomTranslations = (core: Core<CustomTranslations>): CoreInstance => core;
const toComponentProps = (core: Core<CustomTranslations>): UIElementProps => ({ core });
const updatesLocale = (core: CoreInstance) => core.update({ locale: 'en-US' });
const updatesTranslations = (core: CoreInstance) =>
    core.update({ translations: { 'en-US': { 'transactions.common.actions.copy.labels.default': 'Copy', _button: 'Go' } } });
const updatesSomeTranslations = (core: Core<CustomTranslations>) => core.update({ translations: { 'es-ES': { _button: 'Ir' } } });
const acceptsUnknownKey = (core: CoreInstance) => core.update({ translations: { 'en-US': { wrongKey: 'x' } } });
// @ts-expect-error translations must be an object of locales
const rejectsNonObject = (core: CoreInstance) => core.update({ translations: 'string' });
// @ts-expect-error translation values must be strings
const rejectsNonString = (core: CoreInstance) => core.update({ translations: { 'en-US': { _button: 42 } } });

describe('CoreInstance', () => {
    it('accepts a core created with or without custom translations', () => {
        expect([toCoreInstance, toCoreInstanceWithCustomTranslations, toComponentProps]).toHaveLength(3);
    });

    it('can update the locale', () => {
        expect(updatesLocale).toBeTypeOf('function');
    });

    it('can update translations, including custom keys, but only with locale objects of strings', () => {
        expect([updatesTranslations, updatesSomeTranslations, acceptsUnknownKey, rejectsNonObject, rejectsNonString]).toHaveLength(5);
    });
});
