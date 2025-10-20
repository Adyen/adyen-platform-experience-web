import { ICategory, ITransaction } from '../../../types';
import { createDynamicTranslationFactory, KeyFactoryFunction, TranslationFallbackFunction } from '../translation/factory';

const txCategoryFallback: TranslationFallbackFunction = (_, category) => category;
const txCategoryKeyFactory: KeyFactoryFunction = category => category && `transactions.common.types.${category as ICategory}`;
export const getCategoryTranslation = createDynamicTranslationFactory(txCategoryKeyFactory, txCategoryFallback);

const txCategoryDescriptionKeyFactory: KeyFactoryFunction = category => category && `transactions.common.types.${category as ICategory}.description`;
export const getCategoryDescriptionTranslation = createDynamicTranslationFactory(txCategoryDescriptionKeyFactory);

const txStatusFallback: TranslationFallbackFunction = (_, status) => status;
const txStatusKeyFactory: KeyFactoryFunction = status => status && `transactions.common.statuses.${status as ITransaction['status']}`;
export const getStatusTranslation = createDynamicTranslationFactory(txStatusKeyFactory, txStatusFallback);
