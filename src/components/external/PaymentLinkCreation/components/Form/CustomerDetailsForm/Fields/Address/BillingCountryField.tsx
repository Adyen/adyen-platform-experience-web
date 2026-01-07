import useCoreContext from '../../../../../../../../core/Context/useCoreContext';
import { useMemo } from 'preact/hooks';
import { FormSelect } from '../../../../../../../internal/FormWrappers/FormSelect';
import { PaymentLinkCreationFormValues } from '../../../../types';
import type { AddressFieldRequiredChecker } from '../../useAddressChecker';
import { IPaymentLinkCountry } from '../../../../../../../../types';
import { useWizardFormContext } from '../../../../../../../../hooks/form/wizard/WizardFormContext';

interface BillingCountryFieldProps {
    countriesData?: { data?: IPaymentLinkCountry[] };
    isAddressFieldRequired: AddressFieldRequiredChecker;
    isFetchingCountries: boolean;
    countryDatasetData?: Array<{ id: string; name: string }>;
    isFetchingCountryDataset: boolean;
}

export const BillingCountryField = ({
    countriesData,
    isAddressFieldRequired,
    isFetchingCountries,
    countryDatasetData,
    isFetchingCountryDataset,
}: BillingCountryFieldProps) => {
    const { i18n } = useCoreContext();
    const { fieldsConfig } = useWizardFormContext<PaymentLinkCreationFormValues>();

    const countriesListItems = useMemo(() => {
        const countryCodeSubset = new Set((countriesData?.data ?? []).map(({ countryCode }: IPaymentLinkCountry) => countryCode).filter(Boolean));
        const countriesTranslationDataset = countryDatasetData ?? [];

        const available = countryCodeSubset.size
            ? countriesTranslationDataset.filter(({ id }) => countryCodeSubset.has(id))
            : countriesTranslationDataset;

        return available.map(({ id, name }) => ({ id, name })).sort(({ name: a }, { name: b }) => a.localeCompare(b));
    }, [countriesData?.data, countryDatasetData]);

    const isRequired = fieldsConfig['billingAddress.country']?.required || isAddressFieldRequired('billingAddress.country');

    return (
        <FormSelect<PaymentLinkCreationFormValues>
            clearable
            filterable
            className="adyen-pe-payment-link-creation-form__billing-address-field--medium"
            fieldName="billingAddress.country"
            label={i18n.get('payByLink.creation.fields.billingAddress.country.label')}
            items={countriesListItems}
            readonly={isFetchingCountries || isFetchingCountryDataset}
            hideOptionalLabel
            isRequired={isRequired}
        />
    );
};
