import { BaseFilterProps, EditAction, FilterEditModalRenderProps, FilterProps } from './types';
import { useCallback, useEffect, useMemo, useState } from 'preact/hooks';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import useBooleanState from '../../../../../hooks/useBooleanState';
import Modal from '../../../Modal';
import Button from '../../../Button';
import Field from '../../../FormFields/Field';
import InputText from '../../../FormFields/InputText';
import { isEmpty } from '../../../../../utils/validator-utils';
import '../../../FormFields';
import './BaseFilter.scss';

const isValueEmptyFallback = (value?: string) => !value || isEmpty(value);

const renderFallback = (() => {
    const DefaultEditModalBody = <T extends BaseFilterProps>(props: FilterEditModalRenderProps<T>) => {
        const { editAction, name, onChange, onValueUpdated } = props;
        const [currentValue, setCurrentValue] = useState(props.value);

        const handleInput = useCallback(
            (e: Event) => {
                const value = (e.target as HTMLInputElement).value.trim();
                setCurrentValue(value);
                onValueUpdated(value);
            },
            [onValueUpdated]
        );

        useEffect(() => {
            if (editAction === EditAction.CLEAR) {
                const value = '';
                setCurrentValue(value);
                onValueUpdated(value);
            }

            if (editAction === EditAction.APPLY) {
                onChange(currentValue ?? '');
            }
        }, [currentValue, editAction, onChange, onValueUpdated]);

        return (
            <Field label={props.label} classNameModifiers={props.classNameModifiers ?? []} name={name}>
                <InputText name={name} value={currentValue} onInput={handleInput} />
            </Field>
        );
    };

    return <T extends BaseFilterProps>(props: FilterEditModalRenderProps<T>) => <DefaultEditModalBody<T> {...props} />;
})();

export default function BaseFilter<T extends BaseFilterProps = BaseFilterProps>({ render, ...props }: FilterProps<T>) {
    const { i18n } = useCoreContext();
    const [editAction, setEditAction] = useState(EditAction.NONE);
    const [editMode, _updateEditMode] = useBooleanState(false);
    const [editModalMounting, updateEditModalMounting] = useBooleanState(false);
    const [hasEmptyValue, updateHasEmptyValue] = useBooleanState(false);
    const [hasInitialValue, updateHasInitialValue] = useBooleanState(false);
    const [valueChanged, updateValueChanged] = useBooleanState(false);

    const isValueEmpty = useMemo(() => props.isValueEmpty ?? isValueEmptyFallback, [props.isValueEmpty]);
    const renderModalBody = useMemo(() => render ?? renderFallback<T>, [render]);

    const onValueUpdated = useCallback(
        (currentValue?: string) => {
            const hasEmptyValue = isValueEmpty(currentValue);
            updateHasEmptyValue(hasEmptyValue);
            updateValueChanged(hasInitialValue ? currentValue !== props.value : !hasEmptyValue);
        },
        [props.value, hasInitialValue, isValueEmpty]
    );

    const applyFilter = useCallback(() => setEditAction(EditAction.APPLY), []);
    const clearFilter = useCallback(() => setEditAction(EditAction.CLEAR), []);

    const [closeEditModal, handleClick] = useMemo(() => {
        const updateEditMode = (mode: boolean) => () => {
            if (mode === editMode) return;

            if (mode) {
                setEditAction(EditAction.NONE);
                updateValueChanged(false);
                updateHasEmptyValue(false);
                updateHasInitialValue(false);
            }

            _updateEditMode(mode);
            updateEditModalMounting(mode);
        };

        return [updateEditMode(false), updateEditMode(true)];
    }, [editMode]);

    useEffect(() => {
        if (editModalMounting) {
            const hasEmptyValue = isValueEmpty(props.value);
            updateEditModalMounting(false);
            updateHasEmptyValue(hasEmptyValue);
            updateHasInitialValue(!hasEmptyValue);
        }
    }, [props.value, editModalMounting, isValueEmpty]);

    useEffect(() => {
        if (editAction === EditAction.APPLY) closeEditModal();
        if (editAction !== EditAction.NONE) setEditAction(EditAction.NONE);
    }, [closeEditModal, editAction]);

    return (
        <div className={`adyen-fp-filter adyen-fp-filter--${props.type}`}>
            <Button
                variant={'filter'}
                label={props.value || props.label}
                classNameModifiers={[...(props.value ? ['active'] : []), ...(props.classNameModifiers ?? [])]}
                onClick={handleClick}
            />

            <Modal title={i18n.get('editFilter')} classNameModifiers={['filter']} isOpen={editMode} onClose={closeEditModal} size={'small'}>
                {editMode && (
                    <>
                        {renderModalBody({ ...props, editAction, onValueUpdated })}

                        <div className="adyen-fp-modal__footer">
                            <Button
                                label={i18n.get('clear')}
                                classNameModifiers={['ghost', 'small']}
                                onClick={clearFilter}
                                disabled={hasEmptyValue}
                            />

                            <Button label={i18n.get('apply')} classNameModifiers={['small']} onClick={applyFilter} disabled={!valueChanged} />
                        </div>
                    </>
                )}
            </Modal>
        </div>
    );
}
