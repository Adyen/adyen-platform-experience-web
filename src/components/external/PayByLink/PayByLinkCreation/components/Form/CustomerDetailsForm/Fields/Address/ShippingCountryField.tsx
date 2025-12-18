import useCoreContext from '../../../../../../../../../core/Context/useCoreContext';
import { useMemo, useCallback } from 'preact/hooks';
import { CountryDTO } from '../../../../../../../../../types/api/models/countries';
import { useFetch } from '../../../../../../../../../hooks/useFetch';
import { useConfigContext } from '../../../../../../../../../core/ConfigContext';
import { EMPTY_OBJECT } from '../../../../../../../../../utils';
import { FormSelect } from '../../../../../../../../internal/FormWrappers/FormSelect';
import { PBLFormValues } from '../../../../types';
import { useWizardFormContext } from '../../../../../../../../../hooks/form/wizard/WizardFormContext';
import { TargetedEvent } from 'preact/compat';
import { useAddressChecker } from '../../useAddressChecker';

export const ShippingCountryField = ({ isSeparateAddress }: { isSeparateAddress: boolean }) => {
    const { i18n, getCdnDataset } = useCoreContext();
    const { getCountries } = useConfigContext().endpoints;
    const { setValue, fieldsConfig } = useWizardFormContext<PBLFormValues>();
    const { isAddressFieldRequired } = useAddressChecker();

    const countriesQuery = useFetch({
        fetchOptions: { enabled: !!getCountries },
        queryFn: useCallback(async () => {
            return getCountries?.(EMPTY_OBJECT);
        }, [getCountries]),
    });

    const datasetQuery = useFetch({
        fetchOptions: { enabled: !!i18n?.locale },
        queryFn: useCallback(async () => {
            const fileName = `${i18n.locale}`;
            if (getCdnDataset) {
                return (
                    (await getCdnDataset<Array<{ id: string; name: string }>>({
                        name: fileName,
                        extension: 'json',
                        subFolder: 'countries',
                        fallback: [] as Array<{ id: string; name: string }>,
                    })) ?? []
                );
            }
            return [] as Array<{ id: string; name: string }>;
        }, [getCdnDataset, i18n.locale]),
    });

    const countriesListItems = useMemo(() => {
        const subset = new Set((countriesQuery.data?.data ?? []).map(({ countryCode }: CountryDTO) => countryCode).filter(Boolean));
        const store = datasetQuery.data ?? [];

        const available = subset.size ? store.filter(({ id }) => subset.has(id)) : store;

        return available.map(({ id, name }) => ({ id, name })).sort(({ name: a }, { name: b }) => a.localeCompare(b));
    }, [countriesQuery.data, datasetQuery.data]);

    const handleChange = useCallback(
        (e: TargetedEvent<HTMLSelectElement>) => {
            if (!isSeparateAddress) {
                setValue('billingAddress.country', (e.target as HTMLSelectElement).value);
            }
        },
        [isSeparateAddress, setValue]
    );

    const isRequired = fieldsConfig['deliveryAddress.country']?.required || isAddressFieldRequired('deliveryAddress.country');

    return (
        <FormSelect<PBLFormValues>
            filterable
            fieldName="deliveryAddress.country"
            label={i18n.get('payByLink.linkCreation.fields.deliveryAddress.country.label')}
            items={countriesListItems}
            readonly={countriesQuery.isFetching || datasetQuery.isFetching}
            className="adyen-pe-pay-by-link-creation-form__shipping-address-field--medium"
            onChange={handleChange}
            hideOptionalLabel
            isRequired={isRequired}
        />
    );
};
