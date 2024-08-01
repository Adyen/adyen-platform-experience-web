import { Preview } from '@storybook/preact';
import '../playground/assets/style/style.scss';
import '../src/components/shared.scss';
import { createAdyenPlatformExperience } from './utils/create-adyenPE';
import { getMockHandlers } from '../mocks/mock-server/utils';
import sessionRequest from '../playground/utils/sessionRequest';
import { mswLoader, initialize, getWorker } from 'msw-storybook-addon';
import { mocks } from '../mocks/mock-server';
import { Container } from '../stories/utils/Container';

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
    },
    loaders: [
        async context => {
            let worker;

            if (context.args.mockedApi) {
                initialize({}, [...getMockHandlers(mocks)]);
                worker = getWorker();
            }

            const AdyenPlatformExperience = await createAdyenPlatformExperience({
                ...context.coreOptions,
                balanceAccountId: context.args.balanceAccountId,
                environment: 'beta',
                onSessionCreate: async () => {
                    return await sessionRequest(context.args.session);
                },
            });
            return { AdyenPlatformExperience, worker };
        },
        mswLoader,
    ],
    decorators: [
        (Story, context) => {
            return (
                <Container
                    component={context.args.component}
                    componentConfiguration={context.args}
                    context={context}
                    mockedApi={context.args.mockedApi}
                />
            );
        },
    ],
};

export default preview;
