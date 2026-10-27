import { delay, type DefaultBodyType, type DelayMode, type HttpResponseResolver, type PathParams } from 'msw';

const DEFAULT_MOCKS_DELAY: DelayMode = 'real';

let mocksDelay: number | undefined;

export const setMocksDelay = (value?: number) => {
    mocksDelay = value;
};

/**
 * Wraps an msw resolver so the mocked response is delayed.
 *
 * Delay duration, in order of precedence:
 * - Test: `testDuration`, otherwise no delay.
 * - Dev: `duration`, then the value from `setMocksDelay` (Storybook global), then msw's `real` latency.
 *
 * @param resolver - Resolver to delay.
 * @param duration - Exact delay in ms outside test builds; overrides the toolbar value.
 * @param testDuration - Exact delay in ms in test builds, for specs that need an in-progress state.
 */
export function withDelay<
    Params extends PathParams = PathParams,
    RequestBodyType extends DefaultBodyType = DefaultBodyType,
    ResponseBodyType extends DefaultBodyType = undefined,
>(
    resolver: HttpResponseResolver<Params, RequestBodyType, any>,
    duration?: number,
    testDuration?: number
): HttpResponseResolver<Params, RequestBodyType, ResponseBodyType> {
    const delayed: HttpResponseResolver<Params, RequestBodyType, any> = async info => {
        const isTest = Number(process.env.TEST_ENV) === 1;
        await delay(isTest ? (testDuration ?? 0) : (duration ?? mocksDelay ?? DEFAULT_MOCKS_DELAY));
        return resolver(info);
    };
    return delayed as HttpResponseResolver<Params, RequestBodyType, ResponseBodyType>;
}
