import Button from '@src/components/internal/Button';
import { useState } from 'preact/hooks';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import Field from '../../../FormFields/Field';
import InputText from '../../../FormFields/InputText';
import Modal from '../../../Modal';
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
        <Modal title={i18n.get('editFilter')} isOpen={props.isOpen} onClose={props.toggleModal} classNameModifiers={['filter']}>
            <Field label={props.label} classNameModifiers={props.classNameModifiers} name={props.fieldName}>
                <InputText name={props.fieldName} value={props.value} />
            </Field>

            <Button classNameModifiers={['tertiary']} disabled={!props.value}>
                {' '}
                Clear{' '}
            </Button>
            <Button onClick={updateFilters} disabled={!props.value}>
                {' '}
                Label{' '}
            </Button>
        </Modal>
    );
}
