import { PayoutDetails } from '../../src';
import { ElementProps, ElementStory } from '../utils/types';
import { Meta } from '@storybook/preact';
import { PayoutDetailsMeta } from '../components/payoutDetails';
import { CUSTOM_URL_EXAMPLE } from '../utils/constants';
import { PAYOUTS_WITH_DETAILS } from '../../mocks/mock-data';
import { PAYOUT_DETAILS_HANDLERS } from '../../mocks/mock-server/payouts';

const meta: Meta<ElementProps<typeof PayoutDetails>> = { ...PayoutDetailsMeta, title: 'Mocked/Payouts/Payout Details' };
const defaultPayoutDetails = PAYOUTS_WITH_DETAILS[0]!;

const sharedArgs = {
    date: defaultPayoutDetails.payout!.createdAt,
    id: defaultPayoutDetails.balanceAccountId,
    mockedApi: true,
};

export const Default: ElementStory<typeof PayoutDetails> = {
    name: 'Default',
    args: sharedArgs,
    parameters: {
        msw: { ...PAYOUT_DETAILS_HANDLERS.default },
    },
};

export const ErrorDetails: ElementStory<typeof PayoutDetails> = {
    name: 'Error - Details',
    args: sharedArgs,
    parameters: {
        msw: { ...PAYOUT_DETAILS_HANDLERS.errorDetails },
    },
};

export const SumOfSameDayPayouts: ElementStory<typeof PayoutDetails> = {
    name: 'Sum of same-day payouts',
    args: sharedArgs,
    parameters: {
        msw: { ...PAYOUT_DETAILS_HANDLERS.sumOfSameDayPayouts },
    },
};

export const DataCustomization: ElementStory<typeof PayoutDetails> = {
    name: 'Data customization',
    args: {
        ...sharedArgs,
        coreOptions: {
            translations: {
                en_US: {
                    _store: 'Store',
                    _product: 'Product',
                    _summary: 'Summary',
                    _sendEmail: 'Email',
                    _country: 'Country',
                },
            },
        },
        dataCustomization: {
            details: {
                fields: [{ key: '_store' }, { key: '_product' }, { key: '_summary' }, { key: '_sendEmail' }, { key: '_country' }],
                onDataRetrieve: data => {
                    return new Promise(resolve => {
                        return resolve({
                            ...data,
                            _store: 'Sydney',
                            _product: 'Coffee',
                            _summary: {
                                type: 'link',
                                value: 'See summary',
                                config: {
                                    href: CUSTOM_URL_EXAMPLE,
                                },
                            },
                            _sendEmail: {
                                type: 'button',
                                value: 'Send email',
                                config: {
                                    action: () => console.log('Action'),
                                },
                            },
                            _country: {
                                type: 'icon',
                                value: '',
                                config: {
                                    src: `https://flagicons.lipis.dev/flags/4x3/es.svg`,
                                },
                            },
                        });
                    });
                },
            },
        },
    },
    parameters: {
        msw: { ...PAYOUT_DETAILS_HANDLERS.default },
    },
};

export default meta;
