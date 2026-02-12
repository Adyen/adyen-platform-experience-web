import cx from 'classnames';
import Button from '../Button';
import Icon from '../Icon';
import { isFunction } from '../../../utils';
import { ButtonVariant } from '../Button/types';
import { PropsWithChildren } from 'preact/compat';
import { useEffect, useMemo, useState } from 'preact/hooks';
import useCoreContext from '../../../core/Context/useCoreContext';
import { containerQueries, useResponsiveContainer } from '../../../hooks/useResponsiveContainer';
import type { FilterBarMobileSwitchProps, FilterBarProps } from './types';
import './FilterBar.scss';
import useUniqueId from '../../../hooks/useUniqueId';

const MOBILE_SWITCH_CLASS = 'adyen-pe-filter-bar-mobile-switch';

export const useFilterBarState = () => {
    const isMobileContainer = useResponsiveContainer(containerQueries.down.xs);
    const [showingFilters, setShowingFilters] = useState(!isMobileContainer);
    const filterBarElementId = `filters-${useUniqueId()}`;

    useEffect(() => {
        setShowingFilters(!isMobileContainer);
    }, [isMobileContainer]);

    return { filterBarElementId, isMobileContainer, showingFilters, setShowingFilters } as const;
};

export const FilterBarMobileSwitch = ({
    ariaLabelKey,
    filterBarElementId,
    isMobileContainer,
    showingFilters,
    setShowingFilters,
}: FilterBarMobileSwitchProps) => {
    const { i18n } = useCoreContext();
    const ariaLabel = useMemo(() => i18n.get(ariaLabelKey ?? 'common.filters.mobile.label'), [i18n]);
    const disabled = !isFunction(setShowingFilters);
    const expanded = !disabled && !!showingFilters;

    return isMobileContainer ? (
        <div className={MOBILE_SWITCH_CLASS}>
            <Button
                iconButton
                className={`${MOBILE_SWITCH_CLASS}__button`}
                disabled={disabled}
                aria-label={ariaLabel}
                aria-expanded={expanded}
                aria-controls={filterBarElementId}
                onClick={() => setShowingFilters?.(!showingFilters)}
                variant={ButtonVariant.SECONDARY}
            >
                <Icon name={showingFilters ? 'cross' : 'filter'} />
            </Button>
        </div>
    ) : null;
};

export const FilterBar = (props: PropsWithChildren<FilterBarProps>) => {
    const { i18n } = useCoreContext();

    return props.showingFilters ? (
        <div
            role="group"
            data-testId="filter-bar"
            aria-label={i18n.get(props.ariaLabelKey ?? 'common.filters.label')}
            className={cx('adyen-pe-filter-bar', { 'adyen-pe-filter-bar--mobile': props.isMobileContainer })}
            id={props.filterBarElementId}
        >
            {props.children}
            {props.canResetFilters && !!props.resetFilters && (
                <Button variant={ButtonVariant.TERTIARY} onClick={props.resetFilters}>
                    {i18n.get('common.filters.controls.resetAll.label')}
                </Button>
            )}
        </div>
    ) : null;
};

export default FilterBar;
