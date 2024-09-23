import { useMemo } from 'preact/hooks';
import useCoreContext from '../../../core/Context/useCoreContext';
import { TranslationKey } from '../../../translations';
import { uuid } from '../../../utils';
import { ListValue } from './types';

export const useStructuredListItems = (items: { key: TranslationKey; value: ListValue }[]) => {
    const { i18n } = useCoreContext();
    return useMemo(() => {
        return items.map(item => {
            return {
                key: item.key,
                value: item.value,
                id: uuid(),
                label: i18n.get(item.key),
            };
        });
    }, [i18n, items]);
};
