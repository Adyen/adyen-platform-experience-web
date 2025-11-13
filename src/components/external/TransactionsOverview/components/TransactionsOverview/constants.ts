import { TranslationKey } from '../../../../../translations';

const _BASE_CLASS = 'adyen-pe-transactions';

export const BASE_CLASS = `${_BASE_CLASS}-overview`;
export const BASE_CLASS_DETAILS = `${_BASE_CLASS}-details`;
export const BASE_XS_CLASS = `${BASE_CLASS}--xs`;
export const SUMMARY_CLASS = `${BASE_CLASS}__summary`;
export const SUMMARY_ITEM_CLASS = `${SUMMARY_CLASS}-item`;

export const enum TransactionsView {
    TRANSACTIONS = 'transactions',
    INSIGHTS = 'insights',
}

export const TRANSACTIONS_VIEWS: Readonly<Record<TransactionsView, TranslationKey>> = {
    [TransactionsView.TRANSACTIONS]: 'transactions.overview.views.transactions',
    [TransactionsView.INSIGHTS]: 'transactions.overview.views.insights',
} as const;

export const TRANSACTIONS_VIEW_TABS = Object.entries(TRANSACTIONS_VIEWS).map(([view, labelTranslationKey]) => ({
    id: view as TransactionsView,
    label: labelTranslationKey,
    content: null,
}));
