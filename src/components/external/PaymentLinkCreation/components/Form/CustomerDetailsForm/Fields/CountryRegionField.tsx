import useCoreContext from '../../../../../../../core/Context/useCoreContext';
import { useMemo } from 'preact/hooks';
import { FormSelect } from '../../../../../../internal/FormWrappers/FormSelect';
import { PaymentLinkCreationFormValues } from '../../../types';
import { useWizardFormContext } from '../../../../../../../hooks/form/wizard/WizardFormContext';
import { IPaymentLinkCountry } from '../../../../../../../types';

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
        const countriesFromConfig = fieldsConfig?.['countryCode']?.options as string[] | undefined;
        const countriesQueryData = (countriesData?.data ?? []).map(({ countryCode }) => countryCode);

        const allowedCodes = new Set(countriesFromConfig ?? countriesQueryData);
        const countriesTranslationDataset = countryDatasetData ?? [];
        const available = allowedCodes.size ? countriesTranslationDataset.filter(({ id }) => allowedCodes.has(id)) : countriesTranslationDataset;

        return available.sort((a, b) => a.name.localeCompare(b.name));
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
