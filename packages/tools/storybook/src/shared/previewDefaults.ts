import { getMockHandlers, setMocksDelay } from '@integration-components/testing/msw';
import { mswLoader, initialize, getWorker } from 'msw-storybook-addon';
import { mocks } from '../../../../../mocks/mock-server';

const allHandlers = [...getMockHandlers(mocks)];

// Register the default mock handlers at worker initialization so they serve as
// the baseline. `mswLoader` then layers each story's `parameters.msw` handlers
// on top via `worker.use(...)`, which correctly takes precedence over defaults.
initialize({}, allHandlers);

const convertMocksDelayToNumber = (value?: string): number | undefined => {
    if (value === undefined || value === '') return undefined;
    const duration = Number(value);
    return Number.isFinite(duration) && duration >= 0 ? duration : undefined;
};

export const sharedPreviewConfig = {
    parameters: {
        controls: {
            hideNoControlsWarning: true,
        },
    },
    globalTypes: {
        mocksDelay: {
            description: 'Delay applied to mocked API responses',
            toolbar: {
                title: 'Mocks delay',
                items: [
                    { title: 'Realistic delay', value: undefined },
                    { title: '0s delay', value: '0' },
                    { title: '1s delay', value: '1000' },
                    { title: '3s delay', value: '3000' },
                ],
                dynamicTitle: true,
            },
        },
        locale: {
            description: 'Global locale for components',
            toolbar: {
                title: 'Locale',
                items: ['da-DK', 'de-DE', 'en-US', 'es-ES', 'fi-FI', 'fr-FR', 'it-IT', 'nl-NL', 'no-NO', 'pt-BR', 'sv-SE'],
                dynamicTitle: true,
            },
        },
        fontFamily: {
            description: 'Global font family for components',
            toolbar: {
                title: 'Font family',
                items: [{ title: 'Default', value: undefined }, { value: 'Comic Sans MS' }],
                dynamicTitle: true,
            },
        },
    },
    initialGlobals: {
        locale: 'en-US',
        fontFamily: undefined,
        mocksDelay: undefined,
    },
    argTypes: {
        mockedApi: {
            table: {
                disable: true,
            },
        },
        component: {
            table: {
                disable: true,
            },
        },
        balanceAccountId: { type: 'string' as const },
        skipDecorators: {
            table: {
                disable: true,
            },
        },
    },
    loaders: [
        async (context: { args: { mockedApi?: boolean } }) => {
            const worker = getWorker();
            if (context.args.mockedApi) {
                await worker.start();
            } else {
                worker.stop();
            }
            return { worker };
        },
        // Applies the `mocksDelay` toolbar global to resolvers wrapped in `withDelay`.
        (context: { globals: { mocksDelay?: string } }) => {
            setMocksDelay(convertMocksDelayToNumber(context.globals.mocksDelay));
        },
        // mswLoader runs LAST so that story-level `parameters.msw` handlers are
        // registered on top of the baseline defaults via `worker.use(...)` and
        // therefore win when MSW matches requests.
        mswLoader,
    ],
};
