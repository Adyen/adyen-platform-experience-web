import type { TranslationKey } from '../../../core/Localization/types';

export interface FilterBarProps {
    canResetFilters?: boolean;
    resetFilters?: () => void;
    titleKey: TranslationKey;
}
