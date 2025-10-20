import { ICategory, ITransaction } from '../../../types';
import { createDynamicTranslationFactory, KeyFactoryFunction, TranslationFallbackFunction } from './factory';
import { REFUND_REASONS_KEYS } from '../../external/TransactionDetails/context/constants';
import { RefundReason } from '../../external/TransactionDetails/context/types';

const originalValueFallback: TranslationFallbackFunction = (_, value) => value;

const txCategoryKeyFactory: KeyFactoryFunction = category => category && `transactions.common.types.${category as ICategory}`;
export const getTransactionCategory = createDynamicTranslationFactory(txCategoryKeyFactory, originalValueFallback);

const txCategoryDescriptionKeyFactory: KeyFactoryFunction = category => category && `transactions.common.types.${category as ICategory}.description`;
export const getTransactionCategoryDescription = createDynamicTranslationFactory(txCategoryDescriptionKeyFactory);

const txStatusKeyFactory: KeyFactoryFunction = status => status && `transactions.common.statuses.${status as ITransaction['status']}`;
export const getTranslationStatus = createDynamicTranslationFactory(txStatusKeyFactory, originalValueFallback);

const txRefundReasonKeyFactory: KeyFactoryFunction = refundReason =>
    refundReason &&
    (REFUND_REASONS_KEYS[refundReason as RefundReason] ?? `transactions.details.common.refundReasons.${refundReason as RefundReason}`);
export const getTransactionRefundReason = createDynamicTranslationFactory(txRefundReasonKeyFactory, originalValueFallback);
