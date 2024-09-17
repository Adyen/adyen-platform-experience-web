import type { TranslationKey } from '../../../translations';

export interface FilterBarProps {
    canResetFilters?: boolean;
    resetFilters?: () => void;
    titleKey: TranslationKey;
}
