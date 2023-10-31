import { ButtonVariant } from '@src/components/internal/Button/types';
import useCoreContext from '@src/core/Context/useCoreContext';
import { PropsWithChildren } from 'preact/compat';
import Button from '../Button';
import './FilterBar.scss';
import { FilterBarProps } from './types';

export default function FilterBar(props: PropsWithChildren<FilterBarProps>) {
    const { i18n } = useCoreContext();
    return (
        <div aria-label={i18n.get('filterBar')} className="adyen-fp-filter-bar">
            {props.children}
            {props.canResetFilters && !!props.resetFilters && (
                <Button variant={ButtonVariant.TERTIARY} onClick={props.resetFilters}>
                    {i18n.get('button.clearAll')}
                </Button>
            )}
        </div>
    );
}
