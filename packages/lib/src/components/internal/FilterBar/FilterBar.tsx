import { useMemo } from 'preact/hooks';
import useCoreContext from '../../../core/Context/useCoreContext';
import Button from '../Button';
import './FilterBar.scss';

export default function FilterBar(props) {
    const { i18n } = useCoreContext();
    const disableResetButton = useMemo(() => !!props.filters || !!Object.keys(props.filters).length, [props.filters]);

    return (
        <div class="adyen-fp-filter-bar">
            {props.children}
            {!!props.resetFilters && (
                <Button
                    label={i18n.get('button.resetAll')}
                    classNameModifiers={['ghost', 'small', 'reset']}
                    disabled={!disableResetButton}
                    onClick={props.resetFilters}
                />
            )}
        </div>
    );
}
