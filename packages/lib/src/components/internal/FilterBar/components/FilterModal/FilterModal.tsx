import { useState } from 'preact/hooks';
import Modal from '../../../Modal';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import Field from '../../../FormFields/Field';
import InputText from '../../../FormFields/InputText';
import Button from 'src/components/internal/Button';
import './FilterModal.scss';
import { FilterModalProps } from './types';

export default function FilterModal(props: FilterModalProps) {
    const { i18n } = useCoreContext();
    const [value, setValue] = useState([]);

    const updateFilters = () => {
        setValue(value);
        props.toggleModal();
    };

    return (
        <Modal title={i18n.get('editFilter!!!')} isOpen={props.isOpen} onClose={props.toggleModal} classNameModifiers={['filter']}>
            <Field label={props.label} classNameModifiers={props.classNameModifiers} name={props.fieldName}>
                <InputText name={props.fieldName} value={props.value} />
            </Field>

            <Button classNameModifiers={['ghost']} label="Clear" disabled={!props.value} />
            <Button label="Apply" onClick={updateFilters} disabled={!props.value} />
        </Modal>
    );
}
