import { useCallback, useEffect, useMemo, useState } from 'preact/hooks';
import { Controller } from '../../../../../../../../hooks/form';
import { PBLFormValues } from '../../../types';
import { useWizardFormContext } from '../../../../../../../../hooks/form/wizard/WizardFormContext';
import { useFetch } from '../../../../../../../../hooks/useFetch';
import { VisibleField } from '../../../../../../../internal/FormWrappers/VisibleField';
import InputBase from '../../../../../../../internal/FormFields/InputBase';
import FormField from '../../../../../../../internal/FormWrappers/FormField';
import useCoreContext from '../../../../../../../../core/Context/useCoreContext';
import { PBL_CREATION_FIELD_LENGTHS } from '../../../../constants';
import { filterDisallowedCharacters } from '../../../../../../../internal/FormFields/utils';
import { JSX } from 'preact/jsx-runtime';

export const ShopperPhoneField = () => {
    const { i18n, getCdnDataset } = useCoreContext();
    const { control, fieldsConfig, setValue, setFieldDisplayValue, getDisplayValue, trigger, formState } = useWizardFormContext<PBLFormValues>();

    const phoneNumberWithoutPhoneCode = useMemo(() => {
        const displayValue = getDisplayValue('telephoneNumber');
        if (!displayValue) return '';
        const parts = displayValue.split(' ');
        return parts[1];
    }, [getDisplayValue]);

    const phoneCode = useMemo(() => {
        const displayValue = getDisplayValue('telephoneNumber');
        if (!displayValue) return '';
        const parts = displayValue.split(' ');
        return parts[0] || '';
    }, [getDisplayValue]);

    const phonesDatasetQuery = useFetch({
        fetchOptions: { enabled: true },
        queryFn: useCallback(async () => {
            if (getCdnDataset) {
                return (
                    (await getCdnDataset<Array<{ id: string; prefix: string }>>({
                        name: 'phonenumbers',
                        extension: 'json',
                        fallback: [] as Array<{ id: string; prefix: string }>,
                    })) ?? []
                );
            }
            return [] as Array<{ id: string; prefix: string }>;
        }, [getCdnDataset]),
    });

    const phoneCodesDropdown = useMemo(() => {
        const phones = phonesDatasetQuery.data ?? [];
        return phones.map(({ id, prefix }) => ({ id: prefix, name: `${id} (${prefix})` })).sort(({ name: a }, { name: b }) => a.localeCompare(b));
    }, [phonesDatasetQuery.data]);

    // We use some state variables for validation, so it has to happen in an effect to get accurate values
    useEffect(() => {
        if (phoneCode && formState.touchedFields['telephoneNumber'] && formState.errors['telephoneNumber']) {
            trigger('telephoneNumber');
        }
    }, [phoneCode, phoneNumberWithoutPhoneCode, trigger, formState.errors, formState.touchedFields]);

    const isRequired = useMemo(() => fieldsConfig['telephoneNumber']?.required, [fieldsConfig]);

    const validate = useCallback(() => {
        if (!phoneCode) {
            return { valid: false, message: i18n.get('payByLink.linkCreation.fields.phoneNumber.errors.requiredPhoneCode') };
        }
        const number = phoneNumberWithoutPhoneCode;
        if (!number) {
            return { valid: false, message: i18n.get('payByLink.linkCreation.fields.phoneNumber.errors.requiredPhoneNumber') };
        }
        return { valid: true };
    }, [phoneCode, phoneNumberWithoutPhoneCode]);

    return (
        <VisibleField<PBLFormValues> name="telephoneNumber">
            <FormField label={i18n.get('payByLink.linkCreation.fields.shopperPhone.label')} optional={!isRequired}>
                <Controller<PBLFormValues>
                    name="telephoneNumber"
                    control={control}
                    rules={{
                        required: isRequired,
                        validate,
                    }}
                    render={({ field, fieldState }) => {
                        const isInvalid = !!fieldState.error && fieldState.isTouched;
                        return (
                            <InputBase
                                {...field}
                                onKeyDown={e => {
                                    filterDisallowedCharacters({
                                        event: e as JSX.TargetedKeyboardEvent<HTMLInputElement>,
                                        inputType: 'number',
                                    });
                                }}
                                onInput={e => {
                                    const numberValue = (e.target as HTMLInputElement).value;
                                    field.onInput(e);
                                    setValue('telephoneNumber', `${phoneCode}${numberValue}`);
                                    setFieldDisplayValue('telephoneNumber', `${phoneCode} ${numberValue}`);
                                }}
                                value={phoneNumberWithoutPhoneCode}
                                type="text"
                                dropdown={{
                                    filterable: true,
                                    items: phoneCodesDropdown,
                                    value: phoneCode,
                                    placeholder: i18n.get('payByLink.linkCreation.fields.shopperPhone.phonePrefix.placeholder'),
                                    readonly: phonesDatasetQuery.isFetching,
                                }}
                                onDropdownInput={val => {
                                    const currentNumber = phoneNumberWithoutPhoneCode || '';
                                    setValue('telephoneNumber', `${val}${currentNumber}`);
                                    setFieldDisplayValue('telephoneNumber', `${val} ${currentNumber}`);
                                }}
                                isValid={!fieldState.error && !!field.value}
                                isInvalid={isInvalid}
                                errorMessage={fieldState.error?.message}
                                maxLength={PBL_CREATION_FIELD_LENGTHS.telephoneNumber.max}
                            />
                        );
                    }}
                />
            </FormField>
        </VisibleField>
    );
};
