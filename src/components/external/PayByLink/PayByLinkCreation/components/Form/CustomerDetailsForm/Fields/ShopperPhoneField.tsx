import { Controller } from '../../../../../../../../hooks/form';
import { FormValues } from '../../../types';
import FormField from '../../FormField';
import useCoreContext from '../../../../../../../../core/Context/useCoreContext';
import { useWizardFormContext } from '../../../../../../../../hooks/form/wizard/WizardFormContext';
import { useCallback, useMemo, useState } from 'preact/hooks';
import InputBase from '../../../../../../../internal/FormFields/InputBase';
import { useFetch } from '../../../../../../../../hooks/useFetch';

export const ShopperPhoneField = () => {
    const { i18n, getCdnDataset } = useCoreContext();
    const { control, fieldsConfig, setFieldDisplayValue } = useWizardFormContext<FormValues>();
    // TODO - check if we can get the default value from somewhere or let it be null as default
    const [phoneCode, setPhoneCode] = useState<string>('+31');

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

    const onSelectPhoneCode = useCallback(
        (value: string) => {
            setPhoneCode(value);
        },
        [setPhoneCode]
    );

    const isRequired = useMemo(() => fieldsConfig['phoneNumber']?.required, [fieldsConfig]);

    return (
        <FormField label={i18n.get('payByLink.linkCreation.fields.shopperPhone.label')} optional={!isRequired}>
            <Controller<FormValues>
                name="phoneNumber"
                control={control}
                rules={{
                    required: isRequired,
                    validate: () => {
                        if (!phoneCode) {
                            return { valid: false, message: i18n.get('payByLink.linkCreation.fields.phoneNumber.errors.requiredPhoneCode') };
                        }
                        return { valid: true };
                    },
                }}
                render={({ field, fieldState }) => {
                    return (
                        <InputBase
                            {...field}
                            onInput={e => {
                                field.onInput(e);
                                setFieldDisplayValue('phoneNumber', `${phoneCode} ${e.currentTarget.value}`);
                            }}
                            type="number"
                            dropdown={{
                                items: phoneCodesDropdown,
                                value: phoneCode,
                                placeholder: i18n.get('payByLink.linkCreation.fields.shopperPhone.phonePrefix.placeholder'),
                                readonly: phonesDatasetQuery.isFetching,
                            }}
                            onDropdownInput={val => {
                                onSelectPhoneCode(val);
                                field.onBlur();
                            }}
                            isValid={false}
                            isInvalid={!!fieldState.error}
                            errorMessage={fieldState.error?.message}
                        />
                    );
                }}
            />
        </FormField>
    );
};
