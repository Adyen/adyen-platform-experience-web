import useCoreContext from '@src/core/Context/useCoreContext';
import Button from '../Button';
import './FilterBar.scss';
import { FilterBarProps } from './types';
import { PropsWithChildren } from 'preact/compat';
import { useRef } from 'preact/hooks';

export default function FilterBar(props: PropsWithChildren<FilterBarProps>) {
    const { i18n } = useCoreContext();
    const filterBarElement = useRef(null);

    return (
        <div aria-label={i18n.get('filterBar')} ref={filterBarElement} className="adyen-fp-filter-bar">
            {props.children}
            {!!props.resetFilters && (
                <Button
                    label={i18n.get('button.clearAll')}
                    classNameModifiers={['tertiary', 'reset', !props.canResetFilters && 'hidden']}
                    onClick={props.resetFilters}
                />
            )}
        </div>
    );
}
