import { useCallback, useEffect, useState } from 'preact/hooks';
import Select from '../FormFields/Select';
import { StoreSelectorButtonContent } from './StoreSelectorButton/StoreSelectorButton';
import { StoreSelectorItem } from './StoreSelectorItem/StoreSelectorItem';
import { StoreSelectorItemParams, StoreSelectorProps } from './types';
import { SelectChangeEvent } from '../FormFields/Select/types';
import { containerQueries, useResponsiveContainer } from '../../../hooks/useResponsiveContainer';

export const StoreSelector = ({ stores, selectedStoreId, setSelectedStoreId }: StoreSelectorProps) => {
    const isMobileContainer = useResponsiveContainer(containerQueries.down.xs);
    const handleStoreChange = useCallback(
        ({ target }: SelectChangeEvent) => {
            setSelectedStoreId(target.value);
        },
        [setSelectedStoreId]
    );

    const renderButtonContent = (data: { item?: StoreSelectorItemParams }) => {
        if (!data.item) {
            return null;
        }
        return <StoreSelectorButtonContent name={data.item.storeCode} description={data.item.description} />;
    };

    if (!stores || !stores.length) {
        return null;
    }
    if (stores.length === 1) {
        return <StoreSelectorItem name={stores[0]?.storeCode} description={stores[0]?.description} />;
    }

    return (
        <Select
            filterable={false}
            items={stores}
            multiSelect={false}
            onChange={handleStoreChange}
            renderButtonContent={renderButtonContent}
            renderListItem={data => <StoreSelectorItem name={data.item.name} description={data.item.description} />}
            selected={selectedStoreId}
            setToTargetWidth={isMobileContainer}
            showOverlay={false}
            withoutCollapseIndicator={true}
        />
    );
};
