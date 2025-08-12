import { Preview } from '@storybook/preact';
import { Container } from '../stories/utils/Container';
import { getMockHandlers } from '../mocks/mock-server/utils/utils';
import { mswLoader, initialize, getWorker } from 'msw-storybook-addon';
import { mocks } from '../mocks/mock-server';

initialize({}, [...getMockHandlers(mocks)]);

const preview: Preview = {
    parameters: {
        controls: {
            hideNoControlsWarning: true,
        },
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
        locale: { control: 'select', options: ['da-DK', 'de-DE', 'en-US', 'es-ES', 'fi-FI', 'fr-FR', 'it-IT', 'nl-NL', 'no-NO', 'pt-BR', 'sv-SE'] },
        skipDecorators: {
            table: {
                disable: true,
            },
        },
    },
    args: {
        locale: 'en-US',
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
        mswLoader,
    ],
    render: (args, context) => {
        return (
            <Container
                locale={context.args.locale || 'en-US'}
                component={args.component}
                componentConfiguration={args}
                context={context}
                mockedApi={args.mockedApi}
            />
        );
    },
};

export default preview;
