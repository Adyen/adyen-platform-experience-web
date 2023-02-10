import { h } from 'preact';
import Button from '../../../Button';

export default function FilterButton(props) {    
    return (
        <Button
            label={props.activeFilter ?? props.label}
            classNameModifiers={['filter', 'small', 'secondary', ...(props.activeFilter ? 'active-filter' : [])]}
            onClick={props.onClick}
        />
    );
}