import uuidv4 from '../../../utils/uuid';
import { StructuredListItem, ListValue } from './types';
import { TranslationKey } from '@src/core/Localization/types';
import useCoreContext from '@src/core/Context/useCoreContext';
export const useStructuredListItems = (items: { [key in TranslationKey]?: ListValue | undefined }) => {
    const { i18n } = useCoreContext();
    return Object.keys(items).reduce((prev: StructuredListItem[], key) => {
        const uniqueID = uuidv4();
        const itemKey = key as TranslationKey;
        return items[itemKey]
            ? [
                  ...prev,
                  {
                      id: uniqueID,
                      label: i18n.get(itemKey),
                      value: items[itemKey],
                      key,
                  },
              ]
            : prev;
    }, []);
};
