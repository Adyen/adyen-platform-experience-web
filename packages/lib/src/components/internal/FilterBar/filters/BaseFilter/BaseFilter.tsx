import FilterButton from '@src/components/internal/FilterBar/components/FilterButton/FilterButton';
import Popover from '@src/components/internal/Popover/Popover';
import { PopoverContainerPosition, PopoverContainerVariant } from '@src/components/internal/Popover/types';
import { TypographyElement, TypographyVariant } from '@src/components/internal/Typography/types';
import Typography from '@src/components/internal/Typography/Typography';
import useCommitAction, { CommitAction } from '@src/hooks/useCommitAction';
import useUniqueIdentifier from '@src/hooks/element/useUniqueIdentifier';
import { isEmpty } from '@src/utils/validator-utils';
import { memo } from 'preact/compat';
import { Ref, useCallback, useEffect, useMemo, useState } from 'preact/hooks';
import useBooleanState from '../../../../../hooks/useBooleanState';
import '../../../FormFields';
import InputText from '../../../FormFields/InputText';
import './BaseFilter.scss';
import { BaseFilterProps, FilterEditModalRenderProps, FilterProps } from './types';

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
            if (editAction === CommitAction.CLEAR) {
                const value = '';
                setCurrentValue(value);
                onValueUpdated(value);
                onChange(value);
            }

            if (editAction === CommitAction.APPLY) {
                onChange(currentValue ?? '');
            }
        }, [currentValue, editAction, onChange, onValueUpdated]);

        return <InputText name={name} value={currentValue} onInput={handleInput} />;
    };

    return <T extends BaseFilterProps>(props: FilterEditModalRenderProps<T>) => <DefaultEditModalBody<T> {...props} />;
})();

const BaseFilter = <T extends BaseFilterProps = BaseFilterProps>({ render, ...props }: FilterProps<T>) => {
    const [editMode, _updateEditMode] = useBooleanState(false);
    const [editModalMounting, updateEditModalMounting] = useBooleanState(false);
    const isValueEmpty = useMemo(() => props.isValueEmpty ?? isValueEmptyFallback, [props.isValueEmpty]);
    const [hasEmptyValue, updateHasEmptyValue] = useBooleanState(isValueEmpty(props.value));
    const [hasInitialValue, updateHasInitialValue] = useBooleanState(false);
    const [valueChanged, updateValueChanged] = useBooleanState(false);
    const [disabledApply, updateDisabledApply] = useBooleanState(isValueEmpty(props.value));
    const targetElement = useUniqueIdentifier() as Ref<Element | null>;

    const renderModalBody = useMemo(() => render ?? renderFallback<T>, [render]);

    const onValueUpdated = useCallback(
        (currentValue?: string | null) => {
            const hasEmptyValue = isValueEmpty(currentValue ?? undefined);
            updateHasEmptyValue(hasEmptyValue);
            updateDisabledApply(currentValue === null);
            updateValueChanged(hasInitialValue ? currentValue !== props.value : !hasEmptyValue);
        },
        [isValueEmpty, updateHasEmptyValue, updateDisabledApply, updateValueChanged, hasInitialValue, props.value]
    );

    const { commitAction, commitActionButtons, committing, resetCommitAction } = useCommitAction({
        applyDisabled: disabledApply || !valueChanged,
        resetDisabled: hasEmptyValue,
    });

    const [closeEditDialog, openEditDialog] = useMemo(() => {
        const updateEditMode = (mode: boolean) => () => {
            if (mode === editMode) return;

            if (mode) {
                resetCommitAction();
                updateValueChanged(false);
                updateHasInitialValue(false);
            }

            _updateEditMode(mode);
            updateEditModalMounting(mode);
        };

        return [updateEditMode(false), updateEditMode(true)];
    }, [_updateEditMode, editMode, resetCommitAction, updateEditModalMounting, updateHasInitialValue, updateValueChanged]);

    useEffect(() => {
        if (editModalMounting) {
            const hasEmptyValue = isValueEmpty(props.value);
            updateEditModalMounting(false);
            updateHasEmptyValue(hasEmptyValue);
            updateHasInitialValue(!hasEmptyValue);
        }
    }, [props.value, editModalMounting, isValueEmpty, updateEditModalMounting, updateHasEmptyValue, updateHasInitialValue]);

    useEffect(() => {
        committing && closeEditDialog();
        updateHasEmptyValue(hasEmptyValue);
    }, [committing, closeEditDialog, updateHasEmptyValue, hasEmptyValue]);
    return (
        <>
            <div className={`adyen-pe-filter adyen-pe-filter--${props.type}`}>
                {useMemo(
                    () => (
                        <FilterButton
                            classNameModifiers={[
                                ...(props.appliedFilterAmount ? ['with-counter'] : []),
                                ...(props.classNameModifiers ?? []),
                                ...(editMode ? ['active'] : []),
                                ...(hasEmptyValue ? [] : ['has-selection']),
                            ]}
                            onClick={editMode ? closeEditDialog : openEditDialog}
                            tabIndex={0}
                            ref={targetElement as Ref<HTMLButtonElement | null>}
                        >
                            <div className="adyen-pe-filter-button__default-container">
                                <Typography
                                    el={TypographyElement.SPAN}
                                    variant={TypographyVariant.BODY}
                                    stronger={true}
                                    className="adyen-pe-filter-button__label"
                                >
                                    {props.label}
                                </Typography>
                                {!!props.appliedFilterAmount && (
                                    <div className="adyen-pe-filter-button__counter-wrapper">
                                        <Typography
                                            el={TypographyElement.SPAN}
                                            variant={TypographyVariant.BODY}
                                            stronger={true}
                                            className="adyen-pe-filter-button__counter"
                                        >
                                            {props.appliedFilterAmount}
                                        </Typography>
                                    </div>
                                )}
                            </div>
                        </FilterButton>
                    ),
                    [
                        props.appliedFilterAmount,
                        props.classNameModifiers,
                        props.label,
                        editMode,
                        hasEmptyValue,
                        closeEditDialog,
                        openEditDialog,
                        targetElement,
                    ]
                )}
            </div>
            {editMode && (
                <Popover
                    actions={commitActionButtons}
                    title={props.title?.trim()}
                    variant={PopoverContainerVariant.POPOVER}
                    modifiers={['filter']}
                    open={editMode}
                    aria-label={`${props.label}`}
                    dismiss={closeEditDialog}
                    dismissible={false}
                    withContentPadding={props.withContentPadding ?? true}
                    divider={true}
                    targetElement={targetElement}
                    disableFocusTrap={false}
                    position={PopoverContainerPosition.BOTTOM}
                    containerSize={props.containerSize}
                >
                    {renderModalBody({ ...props, editAction: commitAction, onValueUpdated })}
                </Popover>
            )}
        </>
    );
};

export default memo(BaseFilter);
