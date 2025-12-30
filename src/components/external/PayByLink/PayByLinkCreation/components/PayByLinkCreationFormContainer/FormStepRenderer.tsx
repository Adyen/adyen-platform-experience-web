import { LinkCreationFormStep } from '../types';
import { CustomerDetailsForm } from '../Form/CustomerDetailsForm/CustomerDetailsForm';
import { PaymentDetailsForm } from '../Form/PaymentDetailsForm/PaymentDetailsForm';
import { FormSummary } from '../Form/Summary/FormSummary';
import { StoreForm } from '../Form/StoreForm/StoreForm';
import { Dispatch, SetStateAction } from 'preact/compat';
import { PayByLinkSettingsDTO, PayByLinkStoreDTO, PaymentLinkConfiguration, PayByLinkCountryDTO } from '../../../../../../types/api/models/payByLink';
import { StateUpdater } from 'preact/hooks';
import { StoreIds } from '../../../types';

type FormStepRendererProps = {
    setShowTermsAndConditions: Dispatch<StateUpdater<boolean>>;
    currentFormStep: LinkCreationFormStep;
    settingsData?: PayByLinkSettingsDTO;
    storeIds?: StoreIds;
    storesData?: {
        data: PayByLinkStoreDTO[];
    };
    selectItems: {
        id: string;
        name: string;
    }[];
    termsAndConditionsProvisioned: boolean;
    timezone?: string;
    configurationData?: PaymentLinkConfiguration;
    isSeparateAddress: boolean;
    setIsSeparateAddress: Dispatch<SetStateAction<boolean>>;
    countriesData?: {
        data: PayByLinkCountryDTO[];
    };
    isFetchingCountries: boolean;
    countryDatasetData?: Array<{ id: string; name: string }>;
    isFetchingCountryDataset: boolean;
};

export const FormStepRenderer = ({
    setShowTermsAndConditions,
    currentFormStep,
    settingsData,
    storeIds,
    storesData,
    selectItems,
    termsAndConditionsProvisioned,
    timezone,
    configurationData,
    isSeparateAddress,
    setIsSeparateAddress,
    countriesData,
    isFetchingCountries,
    countryDatasetData,
    isFetchingCountryDataset,
}: FormStepRendererProps) => {
    switch (currentFormStep) {
        case 'store':
            return (
                <StoreForm
                    setShowTermsAndConditions={setShowTermsAndConditions}
                    settingsData={settingsData}
                    storeIds={storeIds}
                    storesData={storesData?.data}
                    selectItems={selectItems}
                    termsAndConditionsProvisioned={termsAndConditionsProvisioned}
                />
            );
        case 'payment':
            return <PaymentDetailsForm timezone={timezone} configuration={configurationData} />;
        case 'customer':
            return (
                <CustomerDetailsForm
                    isSeparateAddress={isSeparateAddress}
                    setIsSeparateAddress={setIsSeparateAddress}
                    countriesData={countriesData}
                    isFetchingCountries={isFetchingCountries}
                    countryDatasetData={countryDatasetData}
                    isFetchingCountryDataset={isFetchingCountryDataset}
                />
            );
        case 'summary':
            return <FormSummary countryDatasetData={countryDatasetData} />;
        default:
            return <PaymentDetailsForm configuration={configurationData} />;
    }
};
