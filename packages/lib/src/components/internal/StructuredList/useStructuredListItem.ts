import { useMemo } from 'preact/hooks';
import useCoreContext from '../../../core/Context/useCoreContext';
import { TranslationKey } from '../../../core/Localization/types';
import uuidv4 from '../../../utils/uuid';
import { StructuredListItem, ListValue } from './types';

export const useStructuredListItems = (items: { [key in TranslationKey]?: ListValue | undefined }) => {
    const { i18n } = useCoreContext();
    return useMemo(() => {
        return (Object.keys(items) as (keyof typeof items)[]).reduce((list: StructuredListItem[], key) => {
            const value = items[key];
            value &&
                list.push({
                    key,
                    value,
                    id: uuidv4(),
                    label: i18n.get(key),
                });
            return list;
        }, []);
    }, [i18n, items]);
};
