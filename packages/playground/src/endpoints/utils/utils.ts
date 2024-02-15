import { compose, context, DelayMode } from 'msw';

const IS_TEST = Boolean(process.env.E2E_TEST === 'true') || process.env.VITE_MODE === 'demo';
export function delay(duration?: DelayMode | number): any {
    // Ensure there is no response delay in tests.

    if (IS_TEST) {
        return compose();
    }

    return compose(context.delay(duration));
}
