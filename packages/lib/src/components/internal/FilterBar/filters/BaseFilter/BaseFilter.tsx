import { useState } from 'preact/hooks';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import Modal from '../../../Modal';
import Button from '../../../Button';
import Field from '../../../FormFields/Field';
import InputText from '../../../FormFields/InputText';
import '../../../FormFields';
import './BaseFilter.scss';
import { BaseFilterProps } from './types';

export default function BaseFilter(props: BaseFilterProps) {
    const { i18n } = useCoreContext();
    const [editMode, setEditMode] = useState(false);
    const [filterValue, setFilterValue] = useState('');
    const [filterName, setFilterName] = useState('');

    const handleClick = () => {
        setEditMode(!editMode);
    };

    const updateFilterValue = (e: Event, field: string) => {
        setFilterValue((e.target as HTMLInputElement).value);
        setFilterName(field);

    const updateFilters = () => {
        props.onChange({ [filterName ?? props.name]: filterValue });
        toggleModal();
    };

    const clearFilter = () => {
        if (props.value) props.onChange({ [props.name]: '' });
        setFilterValue('');
        toggleModal();
    };

    const toggleModal = () => {
        setEditMode(!editMode);
    };

    const BaseFilterBody = (props: { fieldName?: string; label: string; classNameModifiers?: string[]; value?: string }) => {
        return (
            <Field label={props.label} classNameModifiers={props.classNameModifiers ? props.classNameModifiers : []} name={props.fieldName}>
                <InputText name={props.fieldName} value={props.value} onInput={updateFilterValue} />
            </Field>
        );
    };

    return (
        <div className={`adyen-fp-filter adyen-fp-filter--${props.type}`}>
            <Button
                variant={'filter'}
                label={props.value || props.label}
                classNameModifiers={[...(props.value ? ['active'] : []), ...(props?.classNameModifiers ?? [])]}
                onClick={handleClick}
            />

            <Modal title={i18n.get('editFilter')} isOpen={editMode} onClose={toggleModal} classNameModifiers={['filter']}>
                {props.body ? props.body({ ...props, updateFilterValue }) : <BaseFilterBody {...props} />}

                <div className="adyen-fp-modal__footer">
                    <Button classNameModifiers={['ghost', 'small']} label={i18n.get('clear')} onClick={clearFilter} disabled={!filterValue} />
                    <Button classNameModifiers={['small']} label={i18n.get('apply')} onClick={updateFilters} disabled={!filterValue} />
                </div>
            </Modal>
        </div>
    );
}

// <Portal into={'body'}>
//     <div class="adyen-fp-popover"></div>
// </Portal>
