import { Meta } from '@storybook/preact';
import { getAccountHolderById } from '../../utils/services';
import { Container } from '../utils/Container';
import { AccountHolderComponent } from '@adyen/adyen-fp-web';
import { ElementProps, ElementStory } from '../utils/types';

const DEFAULT_ACCOUNT_HOLDER = 'AH3227B2248HKJ5BHTQPKC5GX';

export default {
    title: 'screens/AccountHolder',
    render: (args, context) => {
        if (context.loaded.data) {
            Object.assign(args, { accountHolder: context.loaded.data });
        }
        return <Container type={'accountHolder'} componentConfiguration={args} context={context} />;
    },
} satisfies Meta<ElementProps<typeof AccountHolderComponent>>;

export const BasicAccountHolder: ElementStory<typeof AccountHolderComponent> = {
    loaders: [
        async () => ({
            data: await getAccountHolderById(DEFAULT_ACCOUNT_HOLDER),
        }),
    ],
};
