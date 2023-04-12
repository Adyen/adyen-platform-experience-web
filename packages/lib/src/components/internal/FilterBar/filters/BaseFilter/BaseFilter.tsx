import { createContext } from 'preact';
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'preact/hooks';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import useBooleanState from '../../../../../hooks/useBooleanState';
import Modal from '../../../Modal';
import Button from '../../../Button';
import Field from '../../../FormFields/Field';
import InputText from '../../../FormFields/InputText';
import '../../../FormFields';
import './BaseFilter.scss';
import {
    BaseFilterProps,
    EditAction,
    FilterEditModalProps,
    FilterEditModalRenderProps,
    FilterProps
} from './types';

const fallbackRender = (() => {
    const DefaultEditModalBody = <T extends BaseFilterProps>(props: FilterEditModalRenderProps<T>) => {
        const { editAction, name, onChange, onValueUpdated } = props;
        const currentValue = useRef(props.value ?? '');

        const handleInput = useCallback((e: Event) => {
            currentValue.current = (e.target as HTMLInputElement).value;
            onValueUpdated(currentValue.current);
        }, [onValueUpdated]);

        useEffect(() => {
            if (editAction === EditAction.CLEAR) {
                onValueUpdated(currentValue.current = '');
            }

            if (editAction !== EditAction.NONE) {
                onChange({ [name]: currentValue.current });
            }
        }, [editAction, name, onChange, onValueUpdated]);

        return <Field label={props.label} classNameModifiers={props.classNameModifiers ?? []} name={name}>
            <InputText name={name} defaultValue={currentValue.current} onInput={handleInput} />
        </Field>;
    };

    return <T extends BaseFilterProps>(props: FilterEditModalRenderProps<T>) => <DefaultEditModalBody<T> {...props} />;
})();

const BaseFilterEditModalBody = <T extends BaseFilterProps>({
    render,
    editActionContext,
    updateValueChanged,
    updateWithInitialValue,
    ...props
}: FilterEditModalProps<T>) => {
    const renderModalBody = useMemo(() => render ?? fallbackRender<T>, [render]);
    const editAction = useContext(editActionContext);

    const onValueUpdated = useCallback((currentValue: string) => {
        updateValueChanged(currentValue !== props.value);
    }, [props.value, updateValueChanged]);

    useEffect(() => {
        updateWithInitialValue(props.value != undefined);
    }, [props.value, updateWithInitialValue]);

    return renderModalBody({ ...props, editAction, onValueUpdated });
};

export default function BaseFilter<T extends BaseFilterProps = BaseFilterProps>(props: FilterProps<T>) {
    const { i18n } = useCoreContext();
    const [ editAction, setEditAction ] = useState(EditAction.NONE);
    const [ editMode, _updateEditMode ] = useBooleanState(false);
    const [ editModalMounting, _updateEditModalMounting ] = useBooleanState(false);
    const [ valueChanged, updateValueChanged ] = useBooleanState(false);
    const [ withInitialValue, _updateWithInitialValue ] = useBooleanState(false);

    const updateWithInitialValue = useCallback((withInitialValue: boolean) => {
        if (editModalMounting) {
            _updateEditModalMounting(false);
            _updateWithInitialValue(withInitialValue);
        }
    }, [editModalMounting, _updateEditModalMounting, _updateWithInitialValue]);

    const updateEditMode = useCallback((mode: boolean) => {
        if (mode === editMode) return;

        if (mode) {
            setEditAction(EditAction.NONE);
            updateValueChanged(false);
            _updateWithInitialValue(false);
        }

        _updateEditMode(mode);
        _updateEditModalMounting(mode);
    }, [editMode, setEditAction, _updateEditMode, _updateEditModalMounting, updateValueChanged, _updateWithInitialValue]);

    const applyFilter = useCallback(() => setEditAction(EditAction.APPLY), [setEditAction]);
    const clearFilter = useCallback(() => setEditAction(EditAction.CLEAR), [setEditAction]);
    const closeEditModal = useCallback(() => updateEditMode(false), [updateEditMode]);
    const handleClick = useCallback(() => updateEditMode(true), [updateEditMode]);

    const EditActionContext = useMemo(() => createContext(EditAction.NONE), []);

    useEffect(() => {
        if (editAction !== EditAction.NONE) {
            closeEditModal();
            setEditAction(EditAction.NONE);
        }
    }, [closeEditModal, editAction, setEditAction]);

    return (
        <div className={`adyen-fp-filter adyen-fp-filter--${props.type}`}>
            <Button
                variant={'filter'}
                label={props.value || props.label}
                classNameModifiers={[...(props.value ? ['active'] : []), ...(props.classNameModifiers ?? [])]}
                onClick={handleClick}
            />

            <Modal
                title={i18n.get('editFilter')}
                classNameModifiers={['filter']}
                isOpen={editMode}
                onClose={closeEditModal}
            >
                { editMode && <EditActionContext.Provider value={editAction}>
                    <BaseFilterEditModalBody<T>
                        {...props}
                        editActionContext={EditActionContext}
                        updateValueChanged={updateValueChanged}
                        updateWithInitialValue={updateWithInitialValue} />

                    <div className="adyen-fp-modal__footer">
                        { withInitialValue && <Button
                            label={i18n.get('clear')}
                            classNameModifiers={['ghost', 'small']}
                            onClick={clearFilter} /> }

                        <Button
                            label={i18n.get('apply')}
                            classNameModifiers={['small']}
                            onClick={applyFilter}
                            disabled={!valueChanged} />
                    </div>
                </EditActionContext.Provider> }
            </Modal>
        </div>
    );
}
