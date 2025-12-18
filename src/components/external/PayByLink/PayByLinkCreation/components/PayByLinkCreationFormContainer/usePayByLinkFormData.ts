import { useCallback, useEffect, useMemo, useState } from 'preact/hooks';
import { useFetch } from '../../../../../../hooks/useFetch';
import { useConfigContext } from '../../../../../../core/ConfigContext';
import { EMPTY_OBJECT } from '../../../../../../utils';
import { PayByLinkStoreDTO, PaymentLinkConfiguration } from '../../../../../../types/api/models/payByLink';
import { getFormSteps } from '../../utils';
import useCoreContext from '../../../../../../core/Context/useCoreContext';
import { TranslationKey } from '../../../../../../translations';
import { useWizardForm } from '../../../../../../hooks/form/wizard/useWizardForm';
import { PBLFormValues } from '../types';
import { DeepPartial } from '../../../../../types';

type UsePayByLinkFormDataProps = {
    storeIds?: string[] | string;
    defaultValues?: DeepPartial<PBLFormValues>;
};

export const usePayByLinkFormData = ({ storeIds, defaultValues }: UsePayByLinkFormDataProps) => {
    const [selectedStore, setSelectedStore] = useState<string>('');
    const { i18n } = useCoreContext();
    const { getPayByLinkConfiguration, createPBLPaymentLink, getPayByLinkSettings, getPayByLinkStores } = useConfigContext().endpoints;

    // Stores query
    const storesQuery = useFetch({
        fetchOptions: { enabled: !!getPayByLinkStores },
        queryFn: useCallback(async () => {
            return getPayByLinkStores?.(EMPTY_OBJECT, {});
        }, [getPayByLinkStores]),
    });

    const storesSelectorItems = useMemo(() => {
        const stores: PayByLinkStoreDTO[] = storesQuery.data?.data ?? [];
        return stores
            .filter(store => !storeIds || storeIds.includes(store.storeCode || ''))
            .map(({ storeCode, storeId }) => ({
                id: storeId || '',
                name: storeCode || '',
            }));
    }, [storesQuery.data, storeIds]);

    // Configuration query (depends on selected store)
    const configurationQuery = useFetch({
        fetchOptions: { enabled: !!getPayByLinkConfiguration && !!selectedStore },
        queryFn: useCallback(async () => {
            return getPayByLinkConfiguration?.(EMPTY_OBJECT, { path: { storeId: selectedStore } });
        }, [getPayByLinkConfiguration, selectedStore]),
    });

    // Settings query (depends on selected store)
    const settingsQuery = useFetch({
        fetchOptions: { enabled: !!getPayByLinkSettings && !!selectedStore },
        queryFn: useCallback(async () => {
            return getPayByLinkSettings?.(EMPTY_OBJECT, { path: { storeId: selectedStore } });
        }, [getPayByLinkSettings, selectedStore]),
    });

    const termsAndConditionsProvisioned = useMemo(() => {
        return !!settingsQuery.data?.termsOfServiceUrl;
    }, [settingsQuery.data?.termsOfServiceUrl]);

    const getFieldConfig = useCallback(
        (field: keyof PaymentLinkConfiguration) => {
            return configurationQuery.data?.[field];
        },
        [configurationQuery.data]
    );

    // Form steps configuration
    const formSteps = useMemo(() => {
        const skipStoreStep = storesSelectorItems.length === 1 && termsAndConditionsProvisioned;
        return getFormSteps({ i18n, getFieldConfig }).filter(step => !(step.id === 'store' && skipStoreStep));
    }, [configurationQuery.data, getFieldConfig, i18n, storesSelectorItems, termsAndConditionsProvisioned]);

    const steps = useMemo(() => {
        return formSteps.map(step => ({
            id: step.id,
            label: i18n.get(`payByLink.linkCreation.form.steps.${step.id}` as TranslationKey),
        }));
    }, [formSteps, i18n]);

    const formStepsAriaLabel = useMemo(() => i18n.get('payByLink.linkCreation.steps.a11y.label'), [i18n]);

    // Wizard form setup
    const wizardForm = useWizardForm<PBLFormValues>({
        i18n,
        steps: formSteps,
        defaultValues: {
            ...defaultValues,
            billingAddress: defaultValues?.billingAddress || defaultValues?.deliveryAddress || {},
            store: selectedStore || defaultValues?.store || '',
        } as Partial<PBLFormValues>,
        mode: 'all',
        validateBeforeNext: true,
    });

    // Auto-select store when only one is available
    useEffect(() => {
        if (storesSelectorItems.length === 1) {
            wizardForm.setValue('store', storesSelectorItems[0]?.id);
            wizardForm.setFieldDisplayValue('store', storesSelectorItems[0]?.name);
        }
    }, [storesSelectorItems]);

    // Sync selected store with form value
    useEffect(() => {
        const unsubscribe = wizardForm.control.subscribe(() => {
            const storeValue = wizardForm.control.getValue('store');
            if (storeValue && storeValue !== selectedStore) {
                setSelectedStore(storeValue);
            }
        });
        return unsubscribe;
    }, [wizardForm.control, selectedStore]);

    const isDataLoading = configurationQuery.isFetching || settingsQuery.isFetching;
    const shouldSkipStoreSelection = storesSelectorItems.length === 1;
    const isConfigReady = !isDataLoading && configurationQuery.data;
    const isSettingReady = !isDataLoading && settingsQuery.data;

    const isFirstLoadDone = !storesQuery.isFetching && (!shouldSkipStoreSelection || (isConfigReady && isSettingReady));

    return {
        // Queries
        storesQuery,
        configurationQuery,
        settingsQuery,
        // Store data
        selectedStore,
        storesSelectorItems,
        termsAndConditionsProvisioned,
        // Form steps
        formSteps,
        steps,
        formStepsAriaLabel,
        // Wizard form
        wizardForm,
        // Endpoints
        createPBLPaymentLink,
        // Loading state
        isDataLoading,
        isFirstLoadDone,
    };
};
