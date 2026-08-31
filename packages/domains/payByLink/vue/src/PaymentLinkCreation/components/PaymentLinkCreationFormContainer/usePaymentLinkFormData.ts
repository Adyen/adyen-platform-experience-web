import { computed, ref, watch } from 'vue';
import { EMPTY_OBJECT, isFunction } from '@integration-components/utils';
import type { IPaymentLinkConfiguration, IPaymentLinkCountry, IPaymentLinkSettings, IPaymentLinkStore } from '@integration-components/types';
import { getFormSteps, type FormStepConfig, type PaymentLinkCreationProps } from '../../../../../domain/src';
import type { TranslationKey } from '@integration-components/core';
import { usePayByLinkContext } from '../../../integration/context';

interface CountryDatasetItem {
    id: string;
    name: string;
}

export function usePaymentLinkFormData(props: () => Pick<PaymentLinkCreationProps, 'storeIds' | 'fieldsConfig'>) {
    const { i18n, runtime } = usePayByLinkContext();
    const { getCdnDataset } = runtime;

    const selectedStore = ref('');
    const setSelectedStore = (storeId: string) => {
        selectedStore.value = storeId;
    };

    const storesData = ref<{ data?: IPaymentLinkStore[] } | undefined>(undefined);
    const isFetchingStores = ref(false);
    const configurationData = ref<IPaymentLinkConfiguration | undefined>(undefined);
    const isFetchingConfiguration = ref(false);
    const configurationError = ref<Error | undefined>(undefined);
    const settingsData = ref<IPaymentLinkSettings | undefined>(undefined);
    const isFetchingSettings = ref(false);
    const settingsError = ref<Error | undefined>(undefined);
    const countriesData = ref<{ data?: IPaymentLinkCountry[] } | undefined>(undefined);
    const isFetchingCountries = ref(false);
    const countryDatasetData = ref<CountryDatasetItem[] | undefined>(undefined);
    const isFetchingCountryDataset = ref(false);
    const getPayByLinkStores = computed(() => runtime.endpoints.getPayByLinkStores);
    const getPayByLinkConfiguration = computed(() => runtime.endpoints.getPayByLinkConfiguration);
    const getPayByLinkSettings = computed(() => runtime.endpoints.getPayByLinkSettings);
    const getCountries = computed(() => runtime.endpoints.countries);

    async function fetchStores() {
        const fn = getPayByLinkStores.value;
        if (!isFunction(fn)) return;
        isFetchingStores.value = true;
        try {
            storesData.value = await fn(EMPTY_OBJECT, {});
        } catch {
            storesData.value = undefined;
        } finally {
            isFetchingStores.value = false;
        }
    }

    async function fetchConfiguration(storeId: string) {
        const fn = getPayByLinkConfiguration.value;
        if (!isFunction(fn) || !storeId) return;
        isFetchingConfiguration.value = true;
        configurationError.value = undefined;
        try {
            configurationData.value = await fn(EMPTY_OBJECT, { path: { storeId } });
        } catch (e) {
            configurationData.value = undefined;
            configurationError.value = e as Error;
        } finally {
            isFetchingConfiguration.value = false;
        }
    }

    async function fetchSettings(storeId: string) {
        const fn = getPayByLinkSettings.value;
        if (!isFunction(fn) || !storeId) return;
        isFetchingSettings.value = true;
        settingsError.value = undefined;
        try {
            settingsData.value = await fn(EMPTY_OBJECT, { path: { storeId } });
        } catch (e) {
            settingsData.value = undefined;
            settingsError.value = e as Error;
        } finally {
            isFetchingSettings.value = false;
        }
    }

    async function fetchCountries() {
        const fn = getCountries.value;
        if (!isFunction(fn)) return;
        isFetchingCountries.value = true;
        try {
            countriesData.value = await fn(EMPTY_OBJECT);
        } catch {
            countriesData.value = undefined;
        } finally {
            isFetchingCountries.value = false;
        }
    }

    async function fetchCountryDataset() {
        if (!isFunction(getCdnDataset)) {
            countryDatasetData.value = [];
            return;
        }
        isFetchingCountryDataset.value = true;
        try {
            const fileName = `${i18n.locale ?? 'en-US'}`;
            countryDatasetData.value =
                (await getCdnDataset<CountryDatasetItem[]>({
                    name: fileName,
                    extension: 'json',
                    subFolder: 'countries',
                    fallback: [],
                })) ?? [];
        } catch {
            countryDatasetData.value = [];
        } finally {
            isFetchingCountryDataset.value = false;
        }
    }

    const storesSelectorItems = computed(() => {
        const stores: IPaymentLinkStore[] = storesData.value?.data ?? [];
        const storeIds = props().storeIds;
        return stores
            .filter(({ storeId }) => {
                if (!storeIds) return true;
                if (Array.isArray(storeIds) && storeId) return storeIds.includes(storeId);
                return storeIds === storeId;
            })
            .map(({ storeCode, storeId }) => ({ id: storeId || '', name: storeCode || '' }));
    });

    const termsAndConditionsProvisioned = computed(() => !!settingsData.value?.termsOfServiceUrl);
    const canModifySettings = computed(() => isFunction(runtime.endpoints.savePayByLinkSettings));
    const createPaymentLink = computed(() => runtime.endpoints.createPBLPaymentLink);

    const getFieldConfig = (field: keyof IPaymentLinkConfiguration) => configurationData.value?.[field];

    const isCountriesQueryEnabled = computed(() =>
        Boolean(getFieldConfig('deliveryAddress') || getFieldConfig('billingAddress') || getFieldConfig('countryCode'))
    );

    const formSteps = computed<ReadonlyArray<FormStepConfig>>(() => {
        const skipStoreStep = storesSelectorItems.value.length === 1 && termsAndConditionsProvisioned.value;
        return getFormSteps({
            i18n: i18n as Parameters<typeof getFormSteps>[0]['i18n'],
            getFieldConfig,
            visibilityConfig: props().fieldsConfig?.visibility,
        }).filter(step => !(step.id === 'store' && skipStoreStep));
    });

    const stepperItems = computed(() =>
        formSteps.value.map(step => ({
            id: step.id,
            label: i18n.get(`payByLink.creation.form.steps.${step.id}` as TranslationKey),
        }))
    );

    const formStepsAriaLabel = computed(() => i18n.get('payByLink.creation.steps.a11y.label'));

    const isDataLoading = computed(() => isFetchingConfiguration.value || isFetchingSettings.value || isFetchingStores.value);
    const shouldSkipStoreSelection = computed(() => storesSelectorItems.value.length === 1);
    const isConfigReady = computed(() => !isDataLoading.value && (!!configurationData.value || !!configurationError.value));
    const isSettingReady = computed(() => !isDataLoading.value && (!!settingsData.value || !!settingsError.value));
    const isFirstLoadDone = computed(
        () => !isFetchingStores.value && (!shouldSkipStoreSelection.value || (isConfigReady.value && isSettingReady.value))
    );

    const accountIsMisconfigured = computed(() => !!storesData.value?.data && storesData.value.data.length === 0);
    const displayConfigurationError = (currentStepId: string) => currentStepId !== 'store' && !configurationData.value;

    watch(getPayByLinkStores, () => void fetchStores(), { immediate: true });

    watch(
        [selectedStore, getPayByLinkConfiguration],
        ([storeId]) => {
            if (storeId) void fetchConfiguration(storeId);
        },
        { immediate: true }
    );

    watch(
        [selectedStore, getPayByLinkSettings],
        ([storeId]) => {
            if (storeId) void fetchSettings(storeId);
        },
        { immediate: true }
    );

    watch(
        [isCountriesQueryEnabled, getCountries],
        ([enabled]) => {
            if (enabled && !countriesData.value) void fetchCountries();
        },
        { immediate: true }
    );

    watch(
        isCountriesQueryEnabled,
        enabled => {
            if (enabled && !countryDatasetData.value) {
                void fetchCountryDataset();
            }
        },
        { immediate: true }
    );

    watch(
        storesSelectorItems,
        items => {
            if (items.length === 1 && items[0] && selectedStore.value !== items[0].id) {
                setSelectedStore(items[0].id);
            }
        },
        { immediate: true }
    );

    return {
        i18n,
        selectedStore,
        setSelectedStore,
        storesData,
        configurationData,
        settingsData,
        countriesData,
        countryDatasetData,
        isFetchingCountries,
        isFetchingCountryDataset,
        storesSelectorItems,
        termsAndConditionsProvisioned,
        canModifySettings,
        getFieldConfig,
        formSteps,
        stepperItems,
        formStepsAriaLabel,
        isDataLoading,
        isFirstLoadDone,
        accountIsMisconfigured,
        displayConfigurationError,
        createPaymentLink,
    };
}
