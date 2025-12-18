import { useStoreTheme } from './useStoreTheme';
import { useStoreTermsAndConditions } from './useStoreTermsAndConditions';
import type { Dispatch } from 'preact/compat';
import { StateUpdater } from 'preact/hooks';
import { ActiveMenuItem } from '../components/PayByLinkSettingsContainer/context/constants';

export interface UseMenuItemStateProps {
    activeMenuItem: string;
    selectedStore: string | undefined;
    refreshData: boolean;
    setRefreshData: Dispatch<StateUpdater<boolean>>;
}

const useMenuItemState = ({ activeMenuItem, selectedStore, refreshData, setRefreshData }: UseMenuItemStateProps) => {
    const isThemeRefresh = activeMenuItem === ActiveMenuItem.theme && refreshData;
    const isTermsConditionsRefresh = activeMenuItem === ActiveMenuItem.termsAndConditions && refreshData;

    const { theme, isFetching: isFetchingThemes } = useStoreTheme(selectedStore, isThemeRefresh, setRefreshData);
    const { termsOfService, isFetching: isFetchingTermsAndConditions } = useStoreTermsAndConditions(
        selectedStore,
        isTermsConditionsRefresh,
        setRefreshData
    );

    const data = activeMenuItem === ActiveMenuItem.theme ? theme : activeMenuItem === ActiveMenuItem.termsAndConditions ? termsOfService : null;
    const isFetching = isFetchingThemes || isFetchingTermsAndConditions;

    return {
        data,
        isFetching,
    } as const;
};

export default useMenuItemState;
