import cx from 'classnames';
import Button from '../Button';
import Close from '../SVGIcons/Close';
import Filter from '../SVGIcons/Filter';
import { isFunction } from '../../../utils';
import { ButtonVariant } from '../Button/types';
import { PropsWithChildren } from 'preact/compat';
import { useEffect, useState } from 'preact/hooks';
import useCoreContext from '../../../core/Context/useCoreContext';
import { mediaQueries, useResponsiveViewport } from '../../hooks/useResponsiveViewport';
import type { FilterBarMobileSwitchProps, FilterBarProps } from './types';
import './FilterBar.scss';

const MOBILE_SWITCH_CLASS = 'adyen-pe-filter-bar-mobile-switch';

export const useFilterBarState = () => {
    const isMobileViewport = useResponsiveViewport(mediaQueries.down.xs);
    const [showingFilters, setShowingFilters] = useState(!isMobileViewport);

    useEffect(() => {
        setShowingFilters(!isMobileViewport);
    }, [isMobileViewport]);

    return { isMobileViewport, showingFilters, setShowingFilters } as const;
};

export const FilterBarMobileSwitch = ({ isMobileViewport, showingFilters, setShowingFilters }: FilterBarMobileSwitchProps) => {
    return isMobileViewport ? (
        <div className={MOBILE_SWITCH_CLASS}>
            <Button
                iconButton
                className={`${MOBILE_SWITCH_CLASS}__button`}
                disabled={!isFunction(setShowingFilters)}
                onClick={() => setShowingFilters?.(!showingFilters)}
                variant={ButtonVariant.SECONDARY}
            >
                {showingFilters ? <Close /> : <Filter />}
            </Button>
        </div>
    ) : null;
};

export const FilterBar = (props: PropsWithChildren<FilterBarProps>) => {
    const { i18n } = useCoreContext();
    return props.showingFilters ? (
        <div
            aria-label={i18n.get('filterBar')}
            className={cx('adyen-pe-filter-bar', { 'adyen-pe-filter-bar__content--mobile': props.isMobileViewport })}
        >
            {props.children}
            {props.canResetFilters && !!props.resetFilters && (
                <Button variant={ButtonVariant.TERTIARY} onClick={props.resetFilters}>
                    {i18n.get('button.clearAll')}
                </Button>
            )}
        </div>
    ) : null;
};

export default FilterBar;
