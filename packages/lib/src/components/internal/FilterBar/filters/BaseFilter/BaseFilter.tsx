import { ButtonVariant } from '@src/components/internal/Button/types';
import FilterButton from '@src/components/internal/FilterBar/components/FilterButton/FilterButton';
import Popover from '@src/components/internal/Popover/Popover';
import { TypographyElement, TypographyVariant } from '@src/components/internal/Typography/types';
import Typography from '@src/components/internal/Typography/Typography';
import useUniqueIdentifier from '@src/hooks/element/useUniqueIdentifier';
import { isEmpty } from '@src/utils/validator-utils';
import { memo } from 'preact/compat';
import { Ref, useCallback, useEffect, useMemo, useState } from 'preact/hooks';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import useBooleanState from '../../../../../hooks/useBooleanState';
import '../../../FormFields';
import InputText from '../../../FormFields/InputText';
import './BaseFilter.scss';
import { BaseFilterProps, EditAction, FilterEditModalRenderProps, FilterProps } from './types';

const isValueEmptyFallback = (value?: string) => {
    return !value || isEmpty(value);
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
                onChange(value);
            }

            if (editAction === EditAction.APPLY) {
                onChange(currentValue ?? '');
            }
        }, [currentValue, editAction, onChange, onValueUpdated]);

        return <InputText name={name} value={currentValue} onInput={handleInput} />;
    };

    return <T extends BaseFilterProps>(props: FilterEditModalRenderProps<T>) => <DefaultEditModalBody<T> {...props} />;
})();

const BaseFilter = <T extends BaseFilterProps = BaseFilterProps>({ render, ...props }: FilterProps<T>) => {
    const { i18n } = useCoreContext();
    const [editAction, setEditAction] = useState(EditAction.NONE);
    const [editMode, _updateEditMode] = useBooleanState(false);
    const [editModalMounting, updateEditModalMounting] = useBooleanState(false);
    const [hasEmptyValue, updateHasEmptyValue] = useBooleanState(false);
    const [hasInitialValue, updateHasInitialValue] = useBooleanState(false);
    const [valueChanged, updateValueChanged] = useBooleanState(false);
    const targetElement = useUniqueIdentifier() as Ref<Element | null>;

    const isValueEmpty = useMemo(() => props.isValueEmpty ?? isValueEmptyFallback, [props.isValueEmpty]);
    const renderModalBody = useMemo(() => render ?? renderFallback<T>, [render]);

    const onValueUpdated = useCallback(
        (currentValue?: string) => {
            const hasEmptyValue = isValueEmpty(currentValue);
            updateValueChanged(hasInitialValue ? currentValue !== props.value : !hasEmptyValue);
        },
        [props.value, hasInitialValue, isValueEmpty]
    );

    const [closeEditDialog, openEditDialog] = useMemo(() => {
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
        switch (editAction) {
            case EditAction.APPLY:
            case EditAction.CLEAR:
                setEditAction(EditAction.NONE);
                closeEditDialog();
                break;
        }
    }, [closeEditDialog, editAction, setEditAction]);

    // [TODO]: Revisit these actions — since there isn't a clear way of committing filter changes
    // const actions = useMemo(
    //     () => [
    //         {
    //             title: i18n.get('apply'),
    //             variant: ButtonVariant.PRIMARY,
    //             event: () => setEditAction(EditAction.APPLY),
    //             disabled: !valueChanged,
    //         },
    //         {
    //             title: i18n.get('clear'),
    //             variant: ButtonVariant.SECONDARY,
    //             event: () => setEditAction(EditAction.CLEAR),
    //             disabled: hasEmptyValue,
    //         },
    //     ],
    //     [setEditAction, valueChanged, hasEmptyValue]
    // );

    return (
        <>
            <div className={`adyen-fp-filter adyen-fp-filter--${props.type}`}>
                {useMemo(
                    () => (
                        <FilterButton
                            classNameModifiers={[
                                ...(props.value ? ['with-counter'] : []),
                                ...(props.classNameModifiers ?? []),
                                ...(editMode ? ['active'] : []),
                            ]}
                            onClick={openEditDialog}
                            ref={targetElement as Ref<HTMLButtonElement | null>}
                        >
                            <div className="adyen-fp-filter-button__default-container">
                                <Typography
                                    el={TypographyElement.SPAN}
                                    variant={TypographyVariant.BODY}
                                    stronger={true}
                                    className="adyen-fp-filter-button__label"
                                >
                                    {props.label}
                                </Typography>
                                {!!props.appliedFilterAmount && (
                                    <div className="adyen-fp-filter-button__counter-wrapper">
                                        <Typography
                                            el={TypographyElement.SPAN}
                                            variant={TypographyVariant.BODY}
                                            stronger={true}
                                            className="adyen-fp-filter-button__counter"
                                        >
                                            {props.appliedFilterAmount}
                                        </Typography>
                                    </div>
                                )}
                            </div>
                        </FilterButton>
                    ),
                    [props.label, props.appliedFilterAmount, editMode, props.classNameModifiers, props.value]
                )}
            </div>
            {editMode && (
                <Popover
                    title={props.title?.trim()}
                    modifiers={['filter']}
                    open={editMode}
                    ariaLabel={`${props.label}`}
                    dismiss={closeEditDialog}
                    dismissible={true}
                    withContentPadding={props.withContentPadding ?? true}
                    divider={true}
                    targetElement={targetElement}
                    disableFocusTrap={false}
                >
                    {renderModalBody({ ...props, editAction, onValueUpdated })}
                </Popover>
            )}
        </>
    );
};

export default memo(BaseFilter);
