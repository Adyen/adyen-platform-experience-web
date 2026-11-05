import { describe, expect, it } from 'vitest';
import type Core from '../Core';
import type { CoreInstance, UIElementProps } from './types';

type CustomTranslations = { 'en-US': { 'transactions.common.actions.copy.labels.default': string } };

// These assertions are checked by `types:check`: a regression fails type-checking, not the test run.
const toCoreInstance = (core: Core): CoreInstance => core;
const toCoreInstanceWithCustomTranslations = (core: Core<CustomTranslations>): CoreInstance => core;
const toComponentProps = (core: Core<CustomTranslations>): UIElementProps => ({ core });

describe('CoreInstance', () => {
    it('accepts a core created with or without custom translations', () => {
        expect([toCoreInstance, toCoreInstanceWithCustomTranslations, toComponentProps]).toHaveLength(3);
    });
});
