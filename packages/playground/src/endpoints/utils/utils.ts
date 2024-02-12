import { compose, context } from 'msw';

const IS_TEST = process.env.E2E_TEST;
export function delay(duration?: number): any {
    // Ensure there is no response delay in tests.
    if (IS_TEST) {
        return compose();
    }

    return compose(context.delay(duration));
}
