import { useMemo } from 'preact/hooks';
import { TranslationKey } from '../../../core/Localization/types';
import { uuid } from '../../../utils';
import { ListValue } from './types';
import { useTranslation } from 'react-i18next';

export const useStructuredListItems = (items: { key: TranslationKey; value: ListValue }[]) => {
    const { t } = useTranslation();

    return useMemo(() => {
        return items.map(item => {
            return {
                key: item.key,
                value: item.value,
                id: uuid(),
                label: t(item.key),
            };
        });
    }, [t, items]);
};
