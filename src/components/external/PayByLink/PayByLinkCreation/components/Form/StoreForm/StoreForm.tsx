import useCoreContext from '../../../../../../../core/Context/useCoreContext';
import Alert from '../../../../../../internal/Alert/Alert';
import { AlertTypeOption, AlertVariantOption } from '../../../../../../internal/Alert/types';
import StoreField from './Fields/StoreField';

import { useCallback, useEffect, useMemo } from 'preact/hooks';
import { StoresDTO } from '../../../../../../../types/api/models/stores';
import { useConfigContext } from '../../../../../../../core/ConfigContext';
import { useFetch } from '../../../../../../../hooks/useFetch';
import { EMPTY_OBJECT } from '../../../../../../../utils';
import { PBLFormValues } from '../../types';
import { useWizardFormContext } from '../../../../../../../hooks/form/wizard/WizardFormContext';

interface StoreFormProps {
    storeIds?: string[] | string;
    setNextButtonDisabled?: (disabled: boolean) => void;
    settingsQuery: ReturnType<typeof useFetch>;
}

export const StoreForm = ({ storeIds, setNextButtonDisabled, settingsQuery }: StoreFormProps) => {
    const { i18n } = useCoreContext();
    const { getStores, savePayByLinkSettings, getPayByLinkSettings } = useConfigContext().endpoints;
    const { getValues } = useWizardFormContext<PBLFormValues>();
    const canModifySettings = !!savePayByLinkSettings;

    const storesQuery = useFetch({
        fetchOptions: { enabled: !!getStores },
        queryFn: useCallback(async () => {
            return getStores?.(EMPTY_OBJECT, {});
        }, [getStores]),
    });

    const selectedStoreId = getValues('store');

    const termsAndConditionsProvisioned = useMemo(() => {
        return !!settingsQuery.data?.data?.termsOfServiceUrl;
    }, [settingsQuery.data?.data]);

    useEffect(() => {
        if (setNextButtonDisabled) {
            setNextButtonDisabled(!termsAndConditionsProvisioned);
        }
    }, [termsAndConditionsProvisioned, setNextButtonDisabled]);

    const selectItems = useMemo(() => {
        const stores: StoresDTO[] = storesQuery.data?.data ?? [];
        return stores
            .filter(store => !storeIds || storeIds.includes(store.storeCode || ''))
            .map(({ storeCode, description }) => ({
                id: storeCode || '',
                name: description || '',
            }));
    }, [storesQuery.data, storeIds]);

    const alertLabel = useMemo(() => {
        if (!termsAndConditionsProvisioned) {
            if (canModifySettings) {
                return 'payByLink.linkCreation.storeForm.alerts.tcSetupRequired';
            }
            return 'payByLink.linkCreation.storeForm.alerts.tcSetupRequiredWithoutPermissions';
        }
    }, [termsAndConditionsProvisioned, canModifySettings]);

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
            <StoreField items={selectItems} termsAndConditionsProvisioned={termsAndConditionsProvisioned} />
            {settingsQuery.data && storesQuery.data && selectedStoreId && !termsAndConditionsProvisioned && (
                <Alert
                    title={i18n.get('payByLink.linkCreation.storeForm.alerts.tcSetupRequiredTitle')}
                    type={AlertTypeOption.WARNING}
                    description={alertLabel && i18n.get(alertLabel)}
                    actions={alertActions}
                />
            )}
        </div>
    );
};
