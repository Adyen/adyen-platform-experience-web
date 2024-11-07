import type { Dispatch } from 'preact/compat';
import type { StateUpdater } from 'preact/hooks';

export interface FilterBarMobileSwitchProps extends FilterBarState {
    setShowingFilters: NonNullable<FilterBarState['setShowingFilters']>;
}

export interface FilterBarProps extends FilterBarState {
    canResetFilters?: boolean;
    resetFilters?: () => void;
}

export interface FilterBarState {
    isMobileViewport?: boolean;
    showingFilters?: boolean;
    setShowingFilters?: Dispatch<StateUpdater<boolean>>;
}
