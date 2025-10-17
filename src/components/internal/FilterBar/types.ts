import type { Dispatch } from 'preact/compat';
import type { StateUpdater } from 'preact/hooks';
import type { TranslationKey } from '../../../translations';

export interface FilterBarMobileSwitchProps extends FilterBarState {
    ariaLabelKey?: TranslationKey;
    setShowingFilters: NonNullable<FilterBarState['setShowingFilters']>;
}

export interface FilterBarProps extends FilterBarState {
    ariaLabelKey?: TranslationKey;
    canResetFilters?: boolean;
    resetFilters?: () => void;
}

export interface FilterBarState {
    filterBarElementId: string;
    isMobileContainer?: boolean;
    showingFilters?: boolean;
    setShowingFilters?: Dispatch<StateUpdater<boolean>>;
}
