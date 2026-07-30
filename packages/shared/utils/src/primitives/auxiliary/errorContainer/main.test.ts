import { describe, expect, test } from 'vitest';
import { createErrorContainer } from './main';

describe('createErrorContainer', () => {
    test('should create error container', () => {
        const errorContainer = createErrorContainer();

        expect(errorContainer.error).toBeUndefined();
        expect(errorContainer.hasError).toBe(false);

        // set error as `undefined`
        errorContainer.set(undefined);
        expect(errorContainer.error).toBeUndefined();
        expect(errorContainer.hasError).toBe(true);

        // reset error
        errorContainer.reset();
        expect(errorContainer.error).toBeUndefined();
        expect(errorContainer.hasError).toBe(false);
    });

    test('should set specified error', () => {
        const errorString = 'uncaught_exception';
        const errorObject = new Error(errorString);
        const errorContainer = createErrorContainer<any>();

        errorContainer.set(errorString);
        expect(errorContainer.error).toBe(errorString);
        expect(errorContainer.hasError).toBe(true);

        errorContainer.set(errorObject);
        expect(errorContainer.error).toBe(errorObject);
        expect(errorContainer.error).not.toBe(new Error(errorString));
        expect(errorContainer.error).not.toBe(errorString);
        expect(errorContainer.error.message).toBe(errorString);
        expect(errorContainer.hasError).toBe(true);

        // reset error
        errorContainer.reset();
        expect(errorContainer.error).toBeUndefined();
        expect(errorContainer.hasError).toBe(false);
    });
});
