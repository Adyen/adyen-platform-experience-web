import useCoreContext from '@src/core/Context/useCoreContext';
import Button from '../Button';
import './FilterBar.scss';
import { FilterBarProps } from './types';
import { PropsWithChildren } from 'preact/compat';

export default function FilterBar(props: PropsWithChildren<FilterBarProps>) {
    const { i18n } = useCoreContext();

    return (
        <div aria-label={i18n.get('filterBar')} className="adyen-fp-filter-bar">
            {props.children}
            {!!props.resetFilters && (
                <Button
                    label={i18n.get('button.clearAll')}
                    classNameModifiers={['ghost', 'small', 'reset']}
                    disabled={!props.canResetFilters}
                    onClick={props.resetFilters}
                />
            )}
        </div>
    );
}
