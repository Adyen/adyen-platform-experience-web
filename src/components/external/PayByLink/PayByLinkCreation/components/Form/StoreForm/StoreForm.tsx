import useCoreContext from '../../../../../../../core/Context/useCoreContext';
import Alert from '../../../../../../internal/Alert/Alert';
import { AlertTypeOption, AlertVariantOption } from '../../../../../../internal/Alert/types';
import StoreField from './Fields/StoreField';

import { useCallback, useMemo } from 'preact/hooks';
import { StoresDTO } from '../../../../../../../types/api/models/stores';
import { useConfigContext } from '../../../../../../../core/ConfigContext';
import { useFetch } from '../../../../../../../hooks/useFetch';
import { EMPTY_OBJECT } from '../../../../../../../utils';
import { PBLFormValues } from '../../types';
import { useWizardFormContext } from '../../../../../../../hooks/form/wizard/WizardFormContext';
import { TranslationKey } from '../../../../../../../translations';

export const StoreForm = () => {
    const { i18n } = useCoreContext();
    const { getStores, savePayByLinkSettings } = useConfigContext().endpoints;
    const { getValues } = useWizardFormContext<PBLFormValues>();
    const canModifySettings = !!savePayByLinkSettings;

    const storesQuery = useFetch({
        fetchOptions: { enabled: !!getStores },
        queryFn: useCallback(async () => {
            return getStores?.(EMPTY_OBJECT, {});
        }, [getStores]),
    });

    const selectedStoreId = getValues('store');

    const selectItems = useMemo(() => {
        const stores: StoresDTO[] = storesQuery.data?.data ?? [];
        return stores.map(({ storeCode, description }) => ({
            id: storeCode || description || '',
            name: storeCode || description || '',
        }));
    }, [storesQuery.data]);

    const termsAndConditionsProvisioned = useMemo(() => {
        const selectedStore = storesQuery.data?.data?.find(store => store.storeCode === selectedStoreId);
        return !!selectedStore?.setup?.termsAndConditionsProvisioned;
    }, [storesQuery.data?.data, selectedStoreId]);

    const themeFullyProvisioned = useMemo(() => {
        const selectedStore = storesQuery.data?.data?.find(store => store.storeCode === selectedStoreId);
        return !!selectedStore?.setup?.themeFullyProvisioned;
    }, [storesQuery.data?.data, selectedStoreId]);

    const alertLabel: TranslationKey = useMemo(() => {
        if (!termsAndConditionsProvisioned && !themeFullyProvisioned) {
            return 'payByLink.linkCreation.storeForm.alerts.absentTermsAndConditionsAndTheme';
        }
        if (!termsAndConditionsProvisioned) {
            return 'payByLink.linkCreation.storeForm.alerts.absentTermsAndConditions';
        }
        return 'payByLink.linkCreation.storeForm.alerts.absentTheme';
    }, [termsAndConditionsProvisioned, themeFullyProvisioned]);

    const alertActions = useMemo(() => {
        if (!canModifySettings) {
            return [];
        }
        return [
            {
                label: 'Set up Terms and Conditions',
                onClick: () => {
                    console.log('TODO: Open terms and conditions');
                },
            },
        ];
    }, [canModifySettings]);

    return (
        <div className="adyen-pe-pay-by-link-creation-form__fields-container">
            <StoreField
                items={selectItems}
                termsAndConditionsProvisioned={termsAndConditionsProvisioned}
                themeFullyProvisioned={themeFullyProvisioned}
            />
            {!storesQuery.isFetching && selectedStoreId && (!termsAndConditionsProvisioned || !themeFullyProvisioned) && (
                <Alert
                    title="Terms and Conditions Setup Required"
                    type={AlertTypeOption.WARNING}
                    description={i18n.get(alertLabel)}
                    actions={alertActions}
                />
            )}
        </div>
    );
};
