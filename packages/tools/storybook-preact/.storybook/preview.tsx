import { Preview } from '@storybook/preact';
import { Container } from '../src/utils/Container';
import { getMockHandlers } from '@integration-components/testing/msw';
import { mswLoader, initialize, getWorker } from 'msw-storybook-addon';
import { mocks } from '../../../../mocks/mock-server';

const allHandlers = [...getMockHandlers(mocks)];

// Register the default mock handlers at worker initialization so they serve as
// the baseline. `mswLoader` then layers each story's `parameters.msw` handlers
// on top via `worker.use(...)`, which correctly takes precedence over defaults.
initialize({}, allHandlers);

const preview: Preview = {
    parameters: {
        controls: {
            hideNoControlsWarning: true,
        },
    },
    globalTypes: {
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
        balanceAccountId: { type: 'string' },
        skipDecorators: {
            table: {
                disable: true,
            },
        },
    },
    loaders: [
        async context => {
            const worker = getWorker();
            if (context.args.mockedApi) {
                await worker.start();
            } else {
                worker.stop();
            }
            return { worker };
        },
        // mswLoader runs LAST so that story-level `parameters.msw` handlers are
        // registered on top of the baseline defaults via `worker.use(...)` and
        // therefore win when MSW matches requests.
        mswLoader,
    ],
    render: (args, context) => {
        return <Container component={args.component} componentConfiguration={args} context={context} mockedApi={args.mockedApi} />;
    },
};

export default preview;
