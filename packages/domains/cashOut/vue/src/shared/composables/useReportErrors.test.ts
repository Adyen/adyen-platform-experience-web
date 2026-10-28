import { effectScope, ref } from 'vue';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { useReportErrors } from './useReportErrors';

const core: { externalErrorHandler?: ReturnType<typeof vi.fn> } = {};

vi.mock('@integration-components/core/vue', () => ({
    useCoreContext: () => core,
}));

const renderReportErrors = () => {
    const error = ref<Error>();
    const scope = effectScope();
    scope.run(() => useReportErrors(error));
    return { error, stop: () => scope.stop() };
};

describe('useReportErrors', () => {
    beforeEach(() => {
        core.externalErrorHandler = vi.fn();
    });

    test('should report an error to the onError of the SDK as soon as it happens', () => {
        const { error, stop } = renderReportErrors();
        const failure = new Error('failed');

        error.value = failure;

        expect(core.externalErrorHandler).toHaveBeenCalledExactlyOnceWith(failure);

        stop();
    });

    test('should report every new error, but not the error being cleared', () => {
        const { error, stop } = renderReportErrors();
        const first = new Error('first');
        const second = new Error('second');

        error.value = first;
        error.value = undefined;
        error.value = second;

        expect(core.externalErrorHandler).toHaveBeenCalledTimes(2);
        expect(core.externalErrorHandler).toHaveBeenNthCalledWith(1, first);
        expect(core.externalErrorHandler).toHaveBeenNthCalledWith(2, second);

        stop();
    });

    test('should not report anything without an error', () => {
        const { stop } = renderReportErrors();

        expect(core.externalErrorHandler).not.toHaveBeenCalled();

        stop();
    });

    test('should stay quiet when the SDK has no onError', () => {
        core.externalErrorHandler = undefined;
        const { error, stop } = renderReportErrors();

        expect(() => (error.value = new Error('failed'))).not.toThrow();

        stop();
    });

    test('should stop reporting once the component is gone', () => {
        const { error, stop } = renderReportErrors();
        stop();

        error.value = new Error('failed');

        expect(core.externalErrorHandler).not.toHaveBeenCalled();
    });
});
