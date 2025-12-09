import useCoreContext from '../../../../../../../../core/Context/useCoreContext';
import { useMemo, useCallback, useState, useEffect } from 'preact/hooks';
import { FunctionalComponent, h } from 'preact';
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

const MAX_VALIDITY_IN_MS = 70;

export const ValidityField: FunctionalComponent<ValidityFieldProps> = ({ configuration }) => {
    const [customDurationUnit, setCustomDurationUnit] = useState<string>('');
    const [customDurationValue, setCustomDurationValue] = useState<string>('');
    const [validityValue, setValidityValue] = useState<string>('');
    const { i18n } = useCoreContext();
    const { control, fieldsConfig, setValue, setFieldDisplayValue, getValues } = useWizardFormContext<PBLFormValues>();

    const getValidityFromFormState = useCallback(() => {
        const displayValue = getValues('linkValidity');
        if (!displayValue) return '';
        const parts = displayValue.split(' ');

        return [parts[0], parts[1]];
    }, [getValues]);
    const validitySelectItems = useMemo(() => {
        const options: LinkValidityDTO[] = configuration?.linkValidity?.options ?? [];
        return options.map(({ quantity, durationUnit, type }) => {
            if (type === 'flexible') {
                return {
                    id: 'flexible',
                    name: i18n.get('payByLink.linkCreation.fields.validity.linkValidityUnit.custom'),
                };
            }
            const key = `payByLink.linkCreation.fields.validity.linkValidityUnit.${durationUnit}` as TranslationKey;
            return {
                id: `${quantity} ${durationUnit}` || '',
                name: i18n.get(key, { values: { quantity }, count: quantity }),
            };
        });
    }, [configuration, i18n]);

    const lookUpExistingOption = useCallback(() => {
        const [value, unit] = getValidityFromFormState();
        if (!value || !unit) {
            setValue('linkValidity', `${validitySelectItems[0]?.id}`);
            return validitySelectItems[0];
        }

        return validitySelectItems.find(item => item.id === `${value} ${unit}`) || { id: 'flexible' };
    }, [validitySelectItems, setValue]);

    useEffect(() => {
        const validityFromFormState = getValidityFromFormState();
        setCustomDurationUnit(validityFromFormState[1] || '');
        setCustomDurationValue(validityFromFormState[0] || '');
        setValidityValue(lookUpExistingOption()?.id || '');
    }, [getValidityFromFormState]);

    const isRequired = useMemo(() => fieldsConfig['linkValidity']?.required, [fieldsConfig]);

    const handleDisplayValueChange = useCallback(
        (value: string, unit: string) => {
            const key = `payByLink.linkCreation.fields.validity.linkValidityUnit.${unit}` as TranslationKey;

            setFieldDisplayValue(
                'linkValidity',
                i18n.get(key, {
                    values: { quantity: value },
                    count: Number(value),
                })
            );
        },
        [setFieldDisplayValue]
    );

    const handleCustomDurationUnitChange = useCallback(
        (selectedValue: string, triggerValidation: () => void) => {
            setValue('linkValidity', `${customDurationValue} ${selectedValue}`);
            handleDisplayValueChange(customDurationValue, selectedValue);
            setCustomDurationUnit(selectedValue);
            triggerValidation();
        },
        [setValue, setCustomDurationUnit, customDurationValue, handleDisplayValueChange]
    );

    const handleCustomDurationValueChange = useCallback(
        (e: h.JSX.TargetedEvent<HTMLInputElement>) => {
            const newValue = (e.target as HTMLInputElement)?.value;
            setValue('linkValidity', `${newValue} ${customDurationUnit}`);
            handleDisplayValueChange(newValue, customDurationUnit);
            setCustomDurationValue(newValue);
        },
        [setValue, setCustomDurationValue, customDurationUnit, handleDisplayValueChange]
    );

    const dropdownItems = useMemo(
        () =>
            LINK_VALIDITY_DURATION_UNITS.map(unit => ({
                id: unit,
                name: i18n.get(`payByLink.linkCreation.fields.validity.linkValidityUnit.${unit}__plural`),
            })),
        [i18n]
    );

    const validate = useCallback(
        (value: string) => {
            const [durationValue, durationUnit] = value.split(' ');

            if (validityValue === 'flexible') {
                if (!durationValue) {
                    return {
                        valid: false,
                        message: i18n.get('payByLink.linkCreation.fields.validity.customDuration.error.missingDurationValue'),
                    };
                }
                if (parseInt(durationValue) <= 0) {
                    return {
                        valid: false,
                        message: i18n.get('payByLink.linkCreation.fields.validity.customDuration.error.invalidDurationValue'),
                    };
                }
                if (!durationUnit) {
                    return {
                        valid: false,
                        message: i18n.get('payByLink.linkCreation.fields.validity.customDuration.error.missingDurationUnit'),
                    };
                }
                if (durationUnit && durationValue) {
                    const ms = transformToMS(durationUnit, parseInt(durationValue, 10));
                    // TODO: Change to use config
                    const maxMs = transformToMS('day', MAX_VALIDITY_IN_MS);
                    if (ms > maxMs) {
                        return {
                            valid: false,
                            message: i18n.get('payByLink.linkCreation.fields.validity.customDuration.error.durationTooLong'),
                        };
                    }
                }
            }
            return { valid: true };
        },
        [validityValue, i18n]
    );

    return (
        <VisibleField<PBLFormValues> name="linkValidity">
            <Controller<PBLFormValues>
                name="linkValidity"
                control={control}
                rules={{
                    required: isRequired,
                    validate,
                }}
                render={({ field, fieldState }) => {
                    const onSelectInput = (e: Event) => {
                        const newValue = (e.target as HTMLSelectElement)?.value;
                        if (newValue !== 'flexible') {
                            field.onInput(newValue);
                            const [value, unit] = (newValue as string)?.split(' ') || [];
                            handleDisplayValueChange(value || '', unit || '');
                        } else {
                            field.onInput('');
                            handleDisplayValueChange('', '');
                            setCustomDurationValue('');
                            setCustomDurationUnit('');
                        }
                        setValidityValue(newValue);
                    };

                    const isInvalid = !!fieldState.error && fieldState.isTouched;

                    return (
                        <div>
                            <div className="adyen-pe-pay-by-link-creation-form__validity-container">
                                <FormField
                                    label={i18n.get('payByLink.linkCreation.fields.validity.label')}
                                    supportText={i18n.get('payByLink.linkCreation.fields.validity.supportText')}
                                    optional={!isRequired}
                                >
                                    <Select
                                        selected={validityValue}
                                        onChange={onSelectInput}
                                        items={validitySelectItems}
                                        isValid={!fieldState.error}
                                        isInvalid={isInvalid}
                                    />
                                </FormField>
                                {validityValue === 'flexible' && (
                                    <FormField label={i18n.get('payByLink.linkCreation.fields.validity.customDuration.label')} optional={!isRequired}>
                                        <InputBase
                                            dropdown={{
                                                items: dropdownItems,
                                                value: customDurationUnit || '',
                                            }}
                                            onDropdownInput={e => handleCustomDurationUnitChange(e, field.triggerValidation)}
                                            dropdownPosition="end"
                                            value={customDurationValue}
                                            type="number"
                                            onInput={handleCustomDurationValueChange}
                                            isValid={!fieldState.error}
                                            isInvalid={isInvalid}
                                        />
                                    </FormField>
                                )}
                            </div>
                            {isInvalid && <span className="adyen-pe-input__invalid-value">{fieldState.error?.message}</span>}
                        </div>
                    );
                }}
            />
        </VisibleField>
    );
};
