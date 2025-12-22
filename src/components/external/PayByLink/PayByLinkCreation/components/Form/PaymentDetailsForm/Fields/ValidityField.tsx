import useCoreContext from '../../../../../../../../core/Context/useCoreContext';
import { useMemo, useCallback, useState, useEffect } from 'preact/hooks';
import { FunctionalComponent, JSX } from 'preact';
import { LinkValidityDTO, PaymentLinkConfiguration } from '../../../../../../../../types/api/models/payByLink';
import { TranslationKey } from '../../../../../../../../translations';
import { PBLFormValues } from '../../../types';
import { useWizardFormContext } from '../../../../../../../../hooks/form/wizard/WizardFormContext';
import { VisibleField } from '../../../../../../../internal/FormWrappers/VisibleField';
import FormField from '../../../../../../../internal/FormWrappers/FormField';
import { Controller } from '../../../../../../../../hooks/form';
import Select from '../../../../../../../internal/FormFields/Select';
import { LINK_VALIDITY_DURATION_UNITS } from '../../../../constants';
import InputBase from '../../../../../../../internal/FormFields/InputBase';
import { transformToMS } from '../../../../../../../../utils';

export type ValidityFieldProps = {
    configuration?: PaymentLinkConfiguration;
};

const MAX_VALIDITY_DAYS = 70;
const FLEXIBLE_ID = 'flexible';

export const ValidityField: FunctionalComponent<ValidityFieldProps> = ({ configuration }) => {
    const [customDurationUnit, setCustomDurationUnit] = useState('');
    const [customDurationQuantity, setCustomDurationQuantity] = useState<number | undefined>(undefined);
    const [validityValue, setValidityValue] = useState('');
    const { i18n } = useCoreContext();
    const { control, fieldsConfig, setValue, getValues, trigger } = useWizardFormContext<PBLFormValues>();

    const getValidityFromFormState = useCallback(
        () => [getValues('linkValidity.durationUnit'), getValues('linkValidity.quantity')] as const,
        [getValues]
    );

    const validitySelectItems = useMemo(() => {
        const options: LinkValidityDTO[] = configuration?.linkValidity?.options ?? [];
        return options.map(({ quantity, durationUnit, type }) => {
            if (type === FLEXIBLE_ID) {
                return { id: FLEXIBLE_ID, name: i18n.get('payByLink.linkCreation.fields.validity.linkValidityUnit.custom') };
            }
            const key = `payByLink.linkCreation.fields.validity.linkValidityUnit.${durationUnit}` as TranslationKey;
            return { id: `${quantity} ${durationUnit}` || '', name: i18n.get(key, { values: { quantity }, count: quantity }) };
        });
    }, [configuration, i18n]);

    const initializeDefaultValidity = useCallback(() => {
        if (!validitySelectItems.length) return;
        const [durationUnit, quantity] = getValidityFromFormState();
        if (!quantity || !durationUnit) {
            const [qty, unit] = `${validitySelectItems[0]?.id}`.split(' ');
            setValue('linkValidity.quantity', qty);
            setValue('linkValidity.durationUnit', unit);
        }
    }, [validitySelectItems, setValue, getValidityFromFormState]);

    const findCurrentOption = useCallback(() => {
        const [durationUnit, quantity] = getValidityFromFormState();
        if (!quantity || !durationUnit) return validitySelectItems[0];
        return validitySelectItems.find(item => item.id === `${quantity} ${durationUnit}`) || { id: FLEXIBLE_ID };
    }, [validitySelectItems, getValidityFromFormState]);

    useEffect(() => {
        const [durationUnit, quantity] = getValidityFromFormState();
        setCustomDurationUnit(durationUnit || '');
        setCustomDurationQuantity(quantity || '');
        setValidityValue(findCurrentOption()?.id || '');
        initializeDefaultValidity();
    }, [getValidityFromFormState, validitySelectItems, findCurrentOption]);

    const isDurationUnitRequired = fieldsConfig['linkValidity.durationUnit']?.required;
    const isDurationQuantityRequired = fieldsConfig['linkValidity.quantity']?.required;

    const handleCustomDurationQuantityChange = useCallback(
        (e: JSX.TargetedEvent<HTMLInputElement>) => {
            const eventValue = (e.target as HTMLInputElement)?.value;
            const newQuantity = parseInt(eventValue, 10);
            setValue('linkValidity.quantity', newQuantity);
            setCustomDurationQuantity(newQuantity);
            trigger('linkValidity.durationUnit');
        },
        [setValue, trigger]
    );

    const handleCustomDurationUnitChange = useCallback(
        (selectedValue: string) => {
            setValue('linkValidity.durationUnit', selectedValue);
            setCustomDurationUnit(selectedValue);
            trigger('linkValidity.quantity');
        },
        [setValue, trigger]
    );

    const dropdownItems = useMemo(
        () =>
            LINK_VALIDITY_DURATION_UNITS.map(unit => ({
                id: unit,
                name: i18n.get(`payByLink.linkCreation.fields.validity.linkValidityUnit.${unit}__plural`),
            })),
        [i18n]
    );

    const validate = useCallback(() => {
        if (validityValue !== FLEXIBLE_ID) return { valid: true };

        const [durationUnit, durationQuantity] = getValidityFromFormState();
        const qty = parseInt(durationQuantity, 10);

        if (!durationQuantity) {
            return { valid: false, message: i18n.get('payByLink.linkCreation.fields.validity.customDuration.error.missingDurationValue') };
        }
        if (qty <= 0) {
            return { valid: false, message: i18n.get('payByLink.linkCreation.fields.validity.customDuration.error.invalidDurationValue') };
        }
        if (!durationUnit) {
            return { valid: false, message: i18n.get('payByLink.linkCreation.fields.validity.customDuration.error.missingDurationUnit') };
        }
        // TODO: Change to use config
        if (transformToMS(durationUnit, qty) > transformToMS('day', MAX_VALIDITY_DAYS)) {
            return {
                valid: false,
                message: i18n.get('payByLink.linkCreation.fields.validity.customDuration.error.durationTooLong', {
                    values: { maxDays: MAX_VALIDITY_DAYS },
                }),
            };
        }
        return { valid: true };
    }, [validityValue, i18n, getValidityFromFormState]);

    return (
        <VisibleField<PBLFormValues> name="linkValidity.durationUnit">
            <Controller<PBLFormValues>
                name="linkValidity.durationUnit"
                control={control}
                rules={{
                    required: isDurationUnitRequired,
                    validate,
                }}
                render={({ field: durationUnitField, fieldState: durationUnitFieldState }) => (
                    <Controller<PBLFormValues>
                        name="linkValidity.quantity"
                        control={control}
                        rules={{ required: isDurationQuantityRequired, validate }}
                        render={({ field: durationQuantityField, fieldState: durationQuantityFieldState }) => {
                            const onSelectInput = (e: Event) => {
                                const newValue = (e.target as HTMLSelectElement)?.value;
                                if (newValue !== FLEXIBLE_ID) {
                                    const [value, durationUnit] = newValue?.split(' ') || [];
                                    durationQuantityField.onInput(value);
                                    durationUnitField.onInput(durationUnit);
                                } else {
                                    durationUnitField.onInput('');
                                    durationQuantityField.onInput('');
                                    setCustomDurationQuantity(undefined);
                                    setCustomDurationUnit('');
                                }
                                setValidityValue(newValue);
                            };

                            const isInvalid =
                                (durationQuantityFieldState.error || durationUnitFieldState.error) &&
                                durationQuantityFieldState.isTouched &&
                                durationUnitFieldState.isTouched;
                            const isValid = !durationQuantityFieldState.error || !durationUnitFieldState.error;
                            const errorMessage = durationQuantityFieldState.error?.message || durationUnitFieldState.error?.message;

                            return (
                                <div>
                                    <div className="adyen-pe-pay-by-link-creation-form__validity-container">
                                        <FormField
                                            label={i18n.get('payByLink.linkCreation.fields.validity.label')}
                                            supportText={i18n.get('payByLink.linkCreation.fields.validity.supportText')}
                                            optional={!isDurationUnitRequired && !isDurationQuantityRequired}
                                        >
                                            <Select
                                                selected={validityValue}
                                                onChange={onSelectInput}
                                                items={validitySelectItems}
                                                isValid={isValid}
                                                isInvalid={isInvalid}
                                            />
                                        </FormField>
                                        {validityValue === FLEXIBLE_ID && (
                                            <FormField
                                                label={i18n.get('payByLink.linkCreation.fields.validity.customDuration.label')}
                                                optional={false}
                                            >
                                                <InputBase
                                                    dropdown={{ items: dropdownItems, value: customDurationUnit || '' }}
                                                    onDropdownInput={handleCustomDurationUnitChange}
                                                    dropdownPosition="end"
                                                    value={customDurationQuantity}
                                                    type="number"
                                                    onInput={handleCustomDurationQuantityChange}
                                                    isValid={isValid}
                                                    isInvalid={isInvalid}
                                                />
                                            </FormField>
                                        )}
                                    </div>
                                    {isInvalid && <span className="adyen-pe-input__invalid-value">{errorMessage}</span>}
                                </div>
                            );
                        }}
                    />
                )}
            />
        </VisibleField>
    );
};
