import { Preview } from '@storybook/preact';
import '../playground/assets/style/style.scss';
import '../src/components/shared.scss';
import { getMockHandlers } from '../mocks/mock-server/utils/utils';
import { mswLoader, initialize, getWorker } from 'msw-storybook-addon';
import { mocks } from '../mocks/mock-server';
import { Container } from '../stories/utils/Container';

initialize({}, [...getMockHandlers(mocks)]);

const preview: Preview = {
    parameters: {
        controls: {
            hideNoControlsWarning: true,
        },
        options: {
            storySort: { order: ['components', ['Transactions', 'Payouts']] },
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
        skipDecorator: {
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
        mswLoader,
    ],
    render: (args, context) => {
        return <Container component={args.component} componentConfiguration={args} context={context} mockedApi={args.mockedApi} />;
    },
};

export default preview;
