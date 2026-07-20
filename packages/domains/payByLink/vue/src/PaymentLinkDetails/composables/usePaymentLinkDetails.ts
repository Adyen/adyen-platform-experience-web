import { computed, onUnmounted, ref, watch } from 'vue';
import { isFunction } from '@integration-components/utils';
import { useConfigContext, useCoreContext } from '@integration-components/core/vue';
import type { IPaymentLinkDetails } from '@integration-components/types';

export type PaymentLinkDetailsError = Error & {
    errorCode?: string;
    requestId?: string;
};

interface CountryOption {
    id: string;
    name: string;
}

interface UsePaymentLinkDetailsProps {
    id: string;
}

export function usePaymentLinkDetails(props: () => UsePaymentLinkDetailsProps) {
    const config = useConfigContext();
    const { i18n, getCdnDataset } = useCoreContext();

    const data = ref<IPaymentLinkDetails | undefined>(undefined);
    const error = ref<PaymentLinkDetailsError | undefined>(undefined);
    const isFetching = ref(false);
    const countries = ref<CountryOption[]>([]);
    let abortController: AbortController | null = null;

    const getPaymentLinkById = computed(() => config.endpoints.getPayByLinkPaymentLinkById);
    const canFetch = computed(() => isFunction(getPaymentLinkById.value) && !!props().id);

    async function loadCountries() {
        if (!isFunction(getCdnDataset)) return;
        try {
            countries.value =
                (await getCdnDataset<CountryOption[]>({
                    name: i18n.locale ?? 'en-US',
                    extension: 'json',
                    subFolder: 'countries',
                    fallback: [] as CountryOption[],
                })) ?? [];
        } catch {
            countries.value = [];
        }
    }

    function getCountryName(countryCode: string) {
        return countries.value.find(country => country.id === countryCode)?.name ?? countryCode;
    }

    function withResolvedCountries(paymentLink: IPaymentLinkDetails): IPaymentLinkDetails {
        const { shopperInformation } = paymentLink;
        if (!shopperInformation) return paymentLink;

        return {
            ...paymentLink,
            shopperInformation: {
                ...shopperInformation,
                ...(shopperInformation.shopperCountry && { shopperCountry: getCountryName(shopperInformation.shopperCountry) }),
                ...(shopperInformation.billingAddress?.country && {
                    billingAddress: { ...shopperInformation.billingAddress, country: getCountryName(shopperInformation.billingAddress.country) },
                }),
                ...(shopperInformation.shippingAddress?.country && {
                    shippingAddress: { ...shopperInformation.shippingAddress, country: getCountryName(shopperInformation.shippingAddress.country) },
                }),
            },
        };
    }

    async function runFetch() {
        const getPaymentLinkDetails = getPaymentLinkById.value;
        const { id } = props();
        if (!isFunction(getPaymentLinkDetails) || !canFetch.value || !id) return;

        if (abortController) abortController.abort();
        abortController = new AbortController();
        const { signal } = abortController;

        isFetching.value = true;
        error.value = undefined;

        try {
            const [, json] = await Promise.all([loadCountries(), getPaymentLinkDetails({ signal }, { path: { paymentLinkId: id } })]);

            if (!signal.aborted) {
                data.value = withResolvedCountries(json as IPaymentLinkDetails);
            }
        } catch (e) {
            if (!signal.aborted) {
                error.value = e as PaymentLinkDetailsError;
            }
        } finally {
            if (!signal.aborted) {
                isFetching.value = false;
            }
        }
    }

    const fetchKey = computed(() => (canFetch.value ? props().id : null));

    watch(
        fetchKey,
        newKey => {
            data.value = undefined;
            error.value = undefined;
            if (newKey) return runFetch();
        },
        { immediate: true }
    );

    onUnmounted(() => {
        if (abortController) abortController.abort();
    });

    return { paymentLink: data, error, isFetching, refetch: runFetch } as const;
}
