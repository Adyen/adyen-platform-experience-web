import { LinkCreationFormStep } from '../types';
import { CustomerDetailsForm } from '../Form/CustomerDetailsForm/CustomerDetailsForm';
import { PaymentDetailsForm } from '../Form/PaymentDetailsForm/PaymentDetailsForm';
import { FormSummary } from '../Form/Summary/FormSummary';
import { StoreForm } from '../Form/StoreForm/StoreForm';
import { Dispatch, SetStateAction } from 'preact/compat';
import { PayByLinkSettingsDTO, PayByLinkStoreDTO, PaymentLinkConfiguration, PayByLinkCountryDTO } from '../../../../../../types/api/models/payByLink';

type FormStepRendererProps = {
    currentFormStep: LinkCreationFormStep;
    settingsData?: PayByLinkSettingsDTO;
    storeIds?: string[] | string;
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
};

export const FormStepRenderer = ({
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
}: FormStepRendererProps) => {
    switch (currentFormStep) {
        case 'store':
            return (
                <StoreForm
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
                />
            );
        case 'summary':
            return <FormSummary />;
        default:
            return <PaymentDetailsForm configuration={configurationData} />;
    }
};
