import { BaseFilterProps, EditAction, FilterEditModalRenderProps, FilterProps } from './types';
import { useCallback, useEffect, useMemo, useState } from 'preact/hooks';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import useBooleanState from '../../../../../hooks/useBooleanState';
import Button from '../../../Button';
import InputText from '../../../FormFields/InputText';
import { isEmpty } from '@src/utils/validator-utils';
import '../../../FormFields';
import './BaseFilter.scss';
import { ButtonVariants } from '@src/components/internal/Button/types';
import useUniqueIdentifier from '@src/hooks/element/useUniqueIdentifier';
import Popover from '@src/components/internal/Popover/Popover';

const isValueEmptyFallback = (value?: string | any[]) => {
    if (typeof value === 'string') {
        return isEmpty(value.trim());
    }
    if (Array.isArray(value)) return !value || !!value.length;
    return !Boolean(value);
};

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
                onChange('');
            }

            if (editAction === EditAction.APPLY) {
                onChange(currentValue ?? '');
            }
        }, [currentValue, editAction, onChange, onValueUpdated]);

        return <InputText name={name} value={currentValue} onInput={handleInput} />;
    };

    return <T extends BaseFilterProps>(props: FilterEditModalRenderProps<T>) => <DefaultEditModalBody<T> {...props} />;
})();

export default function BaseFilter<T extends BaseFilterProps = BaseFilterProps>({ render, ...props }: FilterProps<T>) {
    const { i18n } = useCoreContext();
    const [editAction, setEditAction] = useState(EditAction.NONE);
    const [editMode, _updateEditMode] = useBooleanState(false);
    const [editModalMounting, updateEditModalMounting] = useBooleanState(false);
    const [hasInitialValue, updateHasInitialValue] = useBooleanState(false);
    const [valueChanged, updateValueChanged] = useBooleanState(false);
    const targetElement = useUniqueIdentifier();

    const isValueEmpty = useMemo(() => props.isValueEmpty ?? isValueEmptyFallback, [props.isValueEmpty]);
    const renderModalBody = useMemo(() => render ?? renderFallback<T>, [render]);

    const onValueUpdated = useCallback(
        (currentValue?: string) => {
            const hasEmptyValue = isValueEmpty(currentValue);
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
            updateHasInitialValue(!hasEmptyValue);
        }
    }, [props.value, editModalMounting, isValueEmpty]);

    useEffect(() => {
        if (editAction === EditAction.APPLY) closeEditModal();
        if (editAction === EditAction.CLEAR) closeEditModal();
        if (editAction !== EditAction.NONE) setEditAction(EditAction.NONE);
    }, [closeEditModal, editAction]);

    const checkTrimValue = (): boolean => {
        if (!props.value) return true;
        return typeof props.value === 'string' ? !Boolean(props.value) : false;
    };

    const actions = [
        {
            title: i18n.get('apply'),
            variant: ButtonVariants.PRIMARY,
            event: applyFilter,
            disabled: !valueChanged && isValueEmpty(),
        },
        {
            title: i18n.get('clear'),
            variant: ButtonVariants.SECONDARY,
            event: clearFilter,
            disabled: !Boolean(props.value),
        },
    ];

    return (
        <>
            <div className={`adyen-fp-filter adyen-fp-filter--${props.type}`}>
                <Button
                    ariaLabel={props.label}
                    variant={'primary'}
                    label={props.label}
                    classNameModifiers={[
                        ...(props.value ? ['with-counter'] : []),
                        ...(props.classNameModifiers ?? []),
                        ...(editMode ? ['active'] : []),
                    ]}
                    onClick={handleClick}
                    ref={targetElement}
                >
                    {!!props.appliedFilterAmount && (
                        <div className="adyen-fp-button__counter-wrapper">
                            <span className="adyen-fp-button__counter">{props.appliedFilterAmount}</span>
                        </div>
                    )}
                </Button>
            </div>
            {editMode && (
                <Popover
                    title={i18n.get('editFilter')}
                    modifiers={['filter']}
                    open={editMode}
                    ariaLabel={'filter-popover'}
                    dismiss={closeEditModal}
                    divider={true}
                    actions={actions}
                    targetElement={targetElement}
                    disableFocusTrap={false}
                >
                    {renderModalBody({ ...props, editAction, onValueUpdated })}
                </Popover>
            )}
        </>
    );
}
