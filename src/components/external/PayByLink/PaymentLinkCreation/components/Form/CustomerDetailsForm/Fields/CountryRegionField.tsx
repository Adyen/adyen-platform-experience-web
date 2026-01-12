import useCoreContext from '../../../../../../../../core/Context/useCoreContext';
import { useMemo } from 'preact/hooks';
import { FormSelect } from '../../../../../../../internal/FormWrappers/FormSelect';
import { PaymentLinkCreationFormValues } from '../../../types';
import { useWizardFormContext } from '../../../../../../../../hooks/form/wizard/WizardFormContext';
import { IPaymentLinkCountry } from '../../../../../../../../types';

interface CountryRegionFieldProps {
    countriesData?: { data?: IPaymentLinkCountry[] };
    isFetchingCountries: boolean;
    countryDatasetData?: Array<{ id: string; name: string }>;
    isFetchingCountryDataset: boolean;
}

export const CountryRegionField = ({ countriesData, isFetchingCountries, countryDatasetData, isFetchingCountryDataset }: CountryRegionFieldProps) => {
    const { i18n } = useCoreContext();
    const { fieldsConfig } = useWizardFormContext<PaymentLinkCreationFormValues>();

    const countriesListItems = useMemo(() => {
        const allowedCodes = new Set(fieldsConfig?.['countryCode']?.options ?? countriesData?.data?.map(({ countryCode }) => countryCode) ?? []);
        const countries = countryDatasetData?.length
            ? countryDatasetData
            : (countriesData?.data?.map(({ countryCode, countryName }) => ({ id: countryCode, name: countryName })) ?? []);

        const allowedCountries = countries.filter(({ id }) => !allowedCodes.size || allowedCodes.has(id));

        return allowedCountries.sort((a, b) => a.name.localeCompare(b.name));
    }, [countriesData?.data, countryDatasetData, fieldsConfig]);

    return (
        <FormSelect<PaymentLinkCreationFormValues>
            clearable
            filterable
            fieldName="countryCode"
            label={i18n.get('payByLink.creation.fields.country.label')}
            items={countriesListItems}
            readonly={isFetchingCountries || isFetchingCountryDataset}
        />
    );
};
