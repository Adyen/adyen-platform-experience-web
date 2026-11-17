import type { PietToolEndpoint } from '../Tools';
import type { PietTranslationKey } from '../shared/types';

/** A shortcut shown in the empty chat: its label is the button, its message is what the user "says" when clicking it. */
export interface PietStarter {
    id: string;
    labelKey: PietTranslationKey;
    messageKey: PietTranslationKey;
    /** The session endpoint the conversation will need. The starter is only offered when the session grants it. */
    endpoint: PietToolEndpoint;
}

export const PIET_STARTERS: readonly PietStarter[] = [
    {
        id: 'balanceAccounts',
        labelKey: 'piet.chat.starters.balanceAccounts.label',
        messageKey: 'piet.chat.starters.balanceAccounts.message',
        endpoint: 'getBalanceAccounts',
    },
    {
        id: 'transactions',
        labelKey: 'piet.chat.starters.transactions.label',
        messageKey: 'piet.chat.starters.transactions.message',
        endpoint: 'getTransactions',
    },
    {
        id: 'payouts',
        labelKey: 'piet.chat.starters.payouts.label',
        messageKey: 'piet.chat.starters.payouts.message',
        endpoint: 'getPayouts',
    },
    {
        id: 'disputes',
        labelKey: 'piet.chat.starters.disputes.label',
        messageKey: 'piet.chat.starters.disputes.message',
        endpoint: 'getDisputeList',
    },
    {
        id: 'capital',
        labelKey: 'piet.chat.starters.capital.label',
        messageKey: 'piet.chat.starters.capital.message',
        endpoint: 'getCapitalState',
    },
    {
        id: 'paymentLinks',
        labelKey: 'piet.chat.starters.paymentLinks.label',
        messageKey: 'piet.chat.starters.paymentLinks.message',
        endpoint: 'getPaymentLinks',
    },
];
