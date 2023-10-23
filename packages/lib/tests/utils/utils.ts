import { pages } from '../../../playground/pages';
import keys from '../../../lib/src/core/Localization/translations/en-US.json';

type PageId = (typeof pages)[number]['id'];
export const getPagePath = (id: PageId) => pages.find(page => page.id === id)?.id ?? '';

export const getTranslatedKey = (key: keyof typeof keys) => keys[key] ?? '';
