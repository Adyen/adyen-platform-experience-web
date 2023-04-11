import Button from '../../../Button';
import { FilterButtonProps } from './types';

export default function FilterButton(props: FilterButtonProps) {
    return (
        <Button
            label={props.activeFilter ?? props.label}
            classNameModifiers={['filter', 'small', 'secondary', ...(props.activeFilter ? 'active-filter' : [])]}
            onClick={props.onClick}
        />
    );
}
