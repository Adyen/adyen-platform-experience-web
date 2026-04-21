import { Preview } from '@storybook/preact';
import { Container } from '../src/utils/Container';
import { getMockHandlers } from '@integration-components/testing/msw';
import { mswLoader, initialize, getWorker } from 'msw-storybook-addon';
import { mocks } from '../../../../mocks/mock-server';

const allHandlers = [...getMockHandlers(mocks)];

initialize({}, []);

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
        mswLoader,
        async context => {
            const worker = getWorker();
            await worker.start();
            if (context.args.mockedApi) {
                worker.use(...allHandlers);
            }
            return { worker };
        },
    ],
    render: (args, context) => {
        return <Container component={args.component} componentConfiguration={args} context={context} mockedApi={args.mockedApi} />;
    },
};

export default preview;
