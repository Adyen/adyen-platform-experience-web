import { Controller } from '../../../../../../../../hooks/form';
import { FormValues } from '../../../types';
import FormField from '../../FormField';
import useCoreContext from '../../../../../../../../core/Context/useCoreContext';
import { useWizardFormContext } from '../../../../../../../../hooks/form/wizard/WizardFormContext';
import { useCallback, useMemo, useRef, useState } from 'preact/hooks';
import Button from '../../../../../../../internal/Button';
import { ButtonVariant } from '../../../../../../../internal/Button/types';
import Icon from '../../../../../../../internal/Icon';
import { PopoverContainerPosition, PopoverContainerSize, PopoverContainerVariant } from '../../../../../../../internal/Popover/types';
import Calendar from '../../../../../../../internal/Calendar';
import calendar from '../../../../../../../internal/Calendar/calendar';
import { CalendarProps } from '../../../../../../../internal/Calendar/types';
import useCalendarControlsRendering from '../../../../../../../internal/Calendar/hooks/useCalendarControlsRendering';
import useTimezoneAwareDateFormatting from '../../../../../../../../hooks/useTimezoneAwareDateFormatting';
import { DEFAULT_FIRST_WEEK_DAY } from '../../../../../../../internal/Calendar/calendar/timerange/presets/shared/offsetWeek';
import Popover from '../../../../../../../internal/Popover/Popover';
import { DATE_FORMAT_DELIVERY_DATE } from '../../../../../../../../constants';

const DeliveryDateSelector = ({
    value,
    onInput,
    onBlur,
    isInvalid,
    timezone,
}: {
    value?: string;
    onInput: (val: any) => void;
    onBlur: () => void;
    isInvalid?: boolean;
    timezone?: string;
}) => {
    const { i18n } = useCoreContext();
    const { dateFormat } = useTimezoneAwareDateFormatting(timezone);

    const buttonRef = useRef<HTMLButtonElement | null>(null);
    const [controlsRenderer, controlsContainerRef] = useCalendarControlsRendering();

    const originDate = useMemo(() => (value ? [new Date(value)] : undefined), [value]);
    const label = useMemo(
        () => (value ? dateFormat(value, DATE_FORMAT_DELIVERY_DATE) : i18n.get('common.inputs.select.placeholder')),
        [dateFormat, i18n, value]
    );
    const getGridLabel = useCallback<CalendarProps['getGridLabel']>(
        block => i18n.get('common.filters.types.date.calendar.label', { values: { monthOfYear: block.label } }),
        [i18n]
    );

    const [lastUpdatedTimestamp, setLastUpdatedTimestamp] = useState<string | undefined>(value);
    const [open, setOpen] = useState(false);

    const onHighlight = useCallback(
        (from?: number) => {
            if (from) {
                const iso = new Date(from).toISOString();
                onInput(iso);
                setLastUpdatedTimestamp(iso);
                onBlur();
                if (iso !== lastUpdatedTimestamp) setOpen(false);
            }
        },
        [lastUpdatedTimestamp, onBlur, onInput]
    );

    return (
        <div>
            <Button
                ref={buttonRef}
                onClick={e => {
                    e.preventDefault();
                    setOpen(prev => !prev);
                }}
                variant={ButtonVariant.SECONDARY}
                aria-haspopup="dialog"
                aria-expanded={open}
                aria-invalid={isInvalid ? 'true' : undefined}
                className={'adyen-pe-button adyen-pe-dropdown__button'}
                iconRight={<Icon className="adyen-pe-dropdown__button-collapse-indicator" name="chevron-down" />}
            >
                <span>{label}</span>
            </Button>

            <Popover
                open={open}
                dismiss={() => {
                    setOpen(false);
                }}
                variant={PopoverContainerVariant.POPOVER}
                containerSize={PopoverContainerSize.MEDIUM}
                targetElement={buttonRef}
                withContentPadding={true}
                position={PopoverContainerPosition.TOP}
                fixedPositioning={false}
                dismissible={false}
            >
                <div
                    ref={controlsContainerRef}
                    role="group"
                    className={'adyen-pe-datepicker__controls'}
                    aria-label={i18n.get('common.filters.types.date.calendar.navigation.label')}
                />
                <div>
                    <Calendar
                        getGridLabel={getGridLabel}
                        firstWeekDay={DEFAULT_FIRST_WEEK_DAY}
                        controls={calendar.controls.MINIMAL}
                        highlight={calendar.highlight.ONE}
                        dynamicBlockRows={true}
                        onlyCellsWithin={true}
                        originDate={originDate}
                        onHighlight={onHighlight}
                        renderControl={controlsRenderer}
                        trackCurrentDay={true}
                    />
                </div>
            </Popover>
        </div>
    );
};

export const DeliveryDateField = ({ timezone }: { timezone?: string }) => {
    const { i18n } = useCoreContext();
    const { control, fieldsConfig } = useWizardFormContext<FormValues>();

    const isRequired = useMemo(() => fieldsConfig['deliveryDate']?.required, [fieldsConfig]);

    return (
        <FormField label={i18n.get('payByLink.linkCreation.fields.deliveryDate.label')} optional={!isRequired}>
            <Controller<FormValues>
                name="deliveryDate"
                control={control}
                rules={{
                    required: isRequired,
                }}
                render={({ field, fieldState }) => {
                    return (
                        <div>
                            <DeliveryDateSelector
                                value={field.value as string}
                                onInput={field.onInput}
                                onBlur={field.onBlur}
                                isInvalid={!!fieldState.error}
                                timezone={timezone}
                            />
                            <span className="adyen-pe-input__invalid-value">{fieldState.error?.message}</span>
                        </div>
                    );
                }}
            />
        </FormField>
    );
};
