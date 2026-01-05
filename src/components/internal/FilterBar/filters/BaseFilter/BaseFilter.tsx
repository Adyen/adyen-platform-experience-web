import { containerQueries, useResponsiveContainer } from '../../../../../hooks/useResponsiveContainer';
import FilterButton from '../../components/FilterButton/FilterButton';
import Popover from '../../../Popover/Popover';
import { PopoverContainerPosition, PopoverContainerVariant } from '../../../Popover/types';
import { TypographyElement, TypographyVariant } from '../../../Typography/types';
import Typography from '../../../Typography/Typography';
import useCommitAction, { CommitAction } from '../../../../../hooks/useCommitAction';
import { isEmptyString, isNull } from '../../../../../utils';
import { memo } from 'preact/compat';
import { useCallback, useEffect, useMemo, useRef, useState } from 'preact/hooks';
import useBooleanState from '../../../../../hooks/useBooleanState';
import useUniqueId from '../../../../../hooks/useUniqueId';
import '../../../FormFields';
import InputText from '../../../FormFields/InputText';
import { BaseFilterProps, FilterEditModalRenderProps, FilterProps } from './types';

const isValueEmptyFallback = (value?: string) => {
    return !value || isEmptyString(value);
};

const renderFallback = (() => {
    const DefaultEditModalBody = <T extends BaseFilterProps>(props: FilterEditModalRenderProps<T>) => {
        const { editAction, name, onChange, onValueUpdated } = props;
        const [currentValue, setCurrentValue] = useState(props.value);
        const inputRef = useRef<HTMLInputElement>(null);

        const handleInput = useCallback(
            (e: Event) => {
                const value = (e.target as HTMLInputElement).value.trim();
                setCurrentValue(value);
                onValueUpdated(value);
            },
            [onValueUpdated]
        );

        useEffect(() => {
            if (inputRef.current) {
                inputRef.current.focus();
            }
        }, [inputRef]);

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

        return <InputText ref={inputRef} name={name} value={currentValue} onInput={handleInput} />;
    };

    return <T extends BaseFilterProps>(props: FilterEditModalRenderProps<T>) => <DefaultEditModalBody<T> {...props} />;
})();

const BaseFilter = <T extends BaseFilterProps = BaseFilterProps>({ render, ['aria-label']: ariaLabel, ...props }: FilterProps<T>) => {
    const isSmContainer = useResponsiveContainer(containerQueries.down.xs);
    const [editMode, _updateEditMode] = useBooleanState(false);
    const [editModalMounting, updateEditModalMounting] = useBooleanState(false);
    const isValueEmpty = useMemo(() => props.isValueEmpty ?? isValueEmptyFallback, [props.isValueEmpty]);
    const [hasEmptyValue, updateHasEmptyValue] = useBooleanState(isValueEmpty(props.value));
    const [hasInitialValue, updateHasInitialValue] = useBooleanState(false);
    const [valueChanged, updateValueChanged] = useBooleanState(false);
    const [disabledApply, updateDisabledApply] = useBooleanState(isValueEmpty(props.value));
    const targetElement = useRef<HTMLButtonElement | null>(null);

    const filterButtonId = `elem-${useUniqueId()}`;
    const renderModalBody = useMemo(() => render ?? renderFallback<T>, [render]);

    const onValueUpdated = useCallback(
        (currentValue?: string | null) => {
            const hasEmptyValue = isValueEmpty(currentValue ?? undefined);
            updateHasEmptyValue(hasEmptyValue);
            updateDisabledApply(isNull(currentValue));
            updateValueChanged(hasInitialValue ? currentValue !== props.value : !hasEmptyValue);
        },
        [isValueEmpty, updateHasEmptyValue, updateDisabledApply, updateValueChanged, hasInitialValue, props.value]
    );

    const { commitAction, commitActionButtons, committing, resetCommitAction } = useCommitAction({
        applyDisabled: disabledApply || !valueChanged,
        resetDisabled: hasEmptyValue,
        onResetAction: props?.onResetAction,
    });

    const editModeActive = useRef(false);

    const [closeEditDialog, openEditDialog] = useMemo(() => {
        const updateEditMode = (mode: boolean) => () => {
            if (mode === editMode || (mode && editModeActive.current)) return;

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
    }, [committing, closeEditDialog]);

    useEffect(() => {
        editModeActive.current = editMode;
    }, [editMode]);

    const isOnlySmContainer = useResponsiveContainer(containerQueries.only.sm);
    const isOnlyMdContainer = useResponsiveContainer(containerQueries.only.md);

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
                            aria-label={ariaLabel}
                            id={filterButtonId}
                            onClick={editMode ? closeEditDialog : openEditDialog}
                            ref={targetElement}
                            tabIndex={0}
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
                    dismiss={closeEditDialog}
                    dismissible={false}
                    withContentPadding={props.withContentPadding ?? true}
                    divider={true}
                    targetElement={targetElement}
                    disableFocusTrap={false}
                    position={PopoverContainerPosition.BOTTOM}
                    containerSize={props.containerSize}
                    showOverlay={isSmContainer}
                    fitPosition={isOnlySmContainer || isOnlyMdContainer}
                >
                    {renderModalBody({ ...props, editAction: commitAction, onValueUpdated })}
                </Popover>
            )}
        </>
    );
};

export default memo(BaseFilter);
