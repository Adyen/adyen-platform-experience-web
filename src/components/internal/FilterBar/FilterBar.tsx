import cx from 'classnames';
import Button from '../Button';
import Icon from '../Icon';
import { isFunction } from '../../../utils';
import { ButtonVariant } from '../Button/types';
import { PropsWithChildren } from 'preact/compat';
import useCoreContext from '../../../core/Context/useCoreContext';
import type { FilterBarMobileSwitchProps, FilterBarProps } from './types';
import './FilterBar.scss';

const MOBILE_SWITCH_CLASS = 'adyen-pe-filter-bar-mobile-switch';

export const FilterBarMobileSwitch = ({ isMobileContainer, showingFilters, setShowingFilters }: FilterBarMobileSwitchProps) => {
    return isMobileContainer ? (
        <div className={MOBILE_SWITCH_CLASS}>
            <Button
                iconButton
                className={`${MOBILE_SWITCH_CLASS}__button`}
                disabled={!isFunction(setShowingFilters)}
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
            aria-label={i18n.get('filterBar')}
            className={cx('adyen-pe-filter-bar', { 'adyen-pe-filter-bar__content--mobile': props.isMobileContainer })}
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
